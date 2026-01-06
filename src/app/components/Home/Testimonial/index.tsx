'use client'

import { useCallback, useEffect, useState } from 'react'
import {
  MessageCircle,
  Send,
  ThumbsUp,
  ChevronDown,
  ChevronUp,
} from 'lucide-react'
import { supabase } from '@/lib/supabaseClient'
import type { Database } from '@/types/database.types'

type ClassWithQuestions = Database['public']['Tables']['classes']['Row'] & {
  questions: QuestionWithMeta[]
}

type QuestionRow = Database['public']['Tables']['questions']['Row']
type ReplyRow = Database['public']['Tables']['question_replies']['Row']

type QuestionWithMeta = QuestionRow & {
  upvote_count: number
  user_has_upvoted: boolean
  replies: ReplyRow[]
}

const getUserIdentifier = () => {
  if (typeof window === 'undefined') return ''
  let identifier = localStorage.getItem('user_identifier')
  if (!identifier) {
    identifier = crypto.randomUUID()
    localStorage.setItem('user_identifier', identifier)
  }
  return identifier
}

const QASession = () => {
  const [classes, setClasses] = useState<ClassWithQuestions[]>([])
  const [selectedClass, setSelectedClass] = useState<ClassWithQuestions | null>(
    null
  )
  const [question, setQuestion] = useState('')
  const [loading, setLoading] = useState(true)
  const [expandedQuestions, setExpandedQuestions] = useState<Set<string>>(
    new Set()
  )

  const fetchQuestionsWithMeta = useCallback(async (classId: string) => {
    const userIdentifier = getUserIdentifier()
    const { data: questions } = await supabase
      .from('questions')
      .select('*')
      .eq('class_id', classId)
      .order('created_at', { ascending: false })

    if (!questions) return []

    const enriched = await Promise.all(
      questions.map(async (item) => {
        const [{ count }, { data: replies }, { data: userUpvote }] =
          await Promise.all([
            supabase
              .from('question_upvotes')
              .select('*', { count: 'exact', head: true })
              .eq('question_id', item.id),
            supabase
              .from('question_replies')
              .select('*')
              .eq('question_id', item.id)
              .order('created_at', { ascending: true }),
            supabase
              .from('question_upvotes')
              .select('id')
              .eq('question_id', item.id)
              .eq('user_identifier', userIdentifier)
              .maybeSingle(),
          ])

        return {
          ...item,
          replies: replies ?? [],
          upvote_count: count ?? 0,
          user_has_upvoted: !!userUpvote,
        }
      })
    )

    enriched.sort((a, b) => b.upvote_count - a.upvote_count)
    return enriched
  }, [])

  const loadClasses = useCallback(async () => {
    setLoading(true)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    const { data: todayRows } = await supabase
      .from('classes')
      .select('*')
      .gte('class_date', today.toISOString())
      .lt('class_date', tomorrow.toISOString())
      .order('class_date', { ascending: true })

    const hydrated = await Promise.all(
      (todayRows ?? []).map(async (cls) => ({
        ...cls,
        questions: await fetchQuestionsWithMeta(cls.id),
      }))
    )

    setClasses(hydrated)
    setSelectedClass(hydrated[0] ?? null)
    setLoading(false)
  }, [fetchQuestionsWithMeta])

  const loadQuestions = useCallback(
    async (classId: string) => {
      const updatedQuestions = await fetchQuestionsWithMeta(classId)
      setClasses((prev) =>
        prev.map((cls) =>
          cls.id === classId ? { ...cls, questions: updatedQuestions } : cls
        )
      )
      setSelectedClass((prev) =>
        prev && prev.id === classId
          ? { ...prev, questions: updatedQuestions }
          : prev
      )
    },
    [fetchQuestionsWithMeta]
  )

  useEffect(() => {
    loadClasses()
  }, [loadClasses])

  useEffect(() => {
    if (!selectedClass) return
    const subscription = supabase
      .channel(`qa_live_${selectedClass.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'questions',
          filter: `class_id=eq.${selectedClass.id}`,
        },
        () => loadQuestions(selectedClass.id)
      )
      .subscribe()
    return () => {
      subscription.unsubscribe()
    }
  }, [loadQuestions, selectedClass])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedClass || !question.trim() || !selectedClass.qa_open) return
    await supabase.from('questions').insert({
      class_id: selectedClass.id,
      question: question.trim(),
    })
    setQuestion('')
  }

  const toggleUpvote = async (
    questionId: string,
    hasUpvoted: boolean
  ): Promise<void> => {
    const userIdentifier = getUserIdentifier()
    if (hasUpvoted) {
      await supabase
        .from('question_upvotes')
        .delete()
        .eq('question_id', questionId)
        .eq('user_identifier', userIdentifier)
    } else {
      await supabase.from('question_upvotes').insert({
        question_id: questionId,
        user_identifier: userIdentifier,
      })
    }
    if (selectedClass) {
      loadQuestions(selectedClass.id)
    }
  }

  const toggleExpanded = (questionId: string) => {
    setExpandedQuestions((prev) => {
      const next = new Set(prev)
      if (next.has(questionId)) {
        next.delete(questionId)
      } else {
        next.add(questionId)
      }
      return next
    })
  }

  const hasClasses = classes.length > 0
  const qaStatusText =
    selectedClass && selectedClass.qa_open
      ? 'Q&A is open—ask away!'
      : 'Q&A will open when class begins.'

  return (
    <section id='qa-section' className='bg-cream'>
      <div className='container'>
        <div className='flex flex-col sm:flex-row gap-5 justify-between sm:items-center mb-6'>
          <div>
            <p className='text-sm uppercase tracking-[0.3em] text-primary'>
              Live Q&A
            </p>
            <h2 className='font-bold tracking-tight'>
              Submit and upvote questions in real time
            </h2>
            <p className='text-base text-gray-500 mt-2'>{qaStatusText}</p>
          </div>
        </div>

        {loading ? (
          <div className='bg-white rounded-3xl border border-gray-100 p-10 text-center'>
            <p className='text-gray-500'>Loading today&apos;s session...</p>
          </div>
        ) : !hasClasses ? (
          <div className='bg-white rounded-3xl border border-gray-100 p-10 text-center'>
            <MessageCircle className='mx-auto w-8 h-8 text-primary mb-3' />
            <p className='text-gray-500'>Q&A opens when we have class.</p>
          </div>
        ) : (
          <div className='grid gap-6 lg:grid-cols-[1.2fr,0.8fr]'>
            <div className='bg-white rounded-3xl border border-gray-100 p-6'>
              <div className='flex flex-col gap-4'>
                {classes.length > 1 && (
                  <select
                    value={selectedClass?.id}
                    onChange={(e) => {
                      const match = classes.find(
                        (cls) => cls.id === e.target.value
                      )
                      setSelectedClass(match ?? null)
                    }}
                    className='border border-gray-200 rounded-2xl px-4 py-3 text-base focus:ring-primary focus:outline-none'
                  >
                    {classes.map((cls) => (
                      <option key={cls.id} value={cls.id}>
                        {cls.title}
                      </option>
                    ))}
                  </select>
                )}

                {selectedClass && (
                  <>
                    <div className='flex items-center justify-between'>
                      <div>
                        <p className='text-sm text-gray-500'>
                          {new Date(selectedClass.class_date).toLocaleTimeString(
                            'en-US',
                            { hour: 'numeric', minute: '2-digit' }
                          )}{' '}
                          — {selectedClass.location}
                        </p>
                        <p className='text-lg font-semibold text-black'>
                          {selectedClass.title}
                        </p>
                      </div>
                      <span
                        className={`px-3 py-1 text-xs font-semibold rounded-full ${
                          selectedClass.qa_open
                            ? 'bg-primary/10 text-primary'
                            : 'bg-gray-100 text-gray-500'
                        }`}
                      >
                        {selectedClass.qa_open ? 'Q&A open' : 'Closed'}
                      </span>
                    </div>

                    <form
                      onSubmit={handleSubmit}
                      className='border border-gray-200 rounded-2xl p-4 flex items-center gap-4'
                    >
                      <input
                        type='text'
                        placeholder='Drop your question here'
                        value={question}
                        onChange={(e) => setQuestion(e.target.value)}
                        disabled={!selectedClass.qa_open}
                        className='flex-1 focus:outline-none text-base disabled:bg-gray-50'
                      />
                      <button
                        type='submit'
                        disabled={!selectedClass.qa_open || !question.trim()}
                        className='bg-primary text-white px-5 py-3 rounded-xl font-semibold flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed'
                      >
                        <Send className='w-4 h-4' />
                        Ask
                      </button>
                    </form>

                    <div className='space-y-4'>
                      {selectedClass.questions.length === 0 ? (
                        <p className='text-gray-500 text-sm'>
                          No questions yet. Be the first to ask!
                        </p>
                      ) : (
                        selectedClass.questions.map((item) => (
                          <div
                            key={item.id}
                            className='border border-gray-100 rounded-2xl p-4'
                          >
                            <div className='flex justify-between gap-4'>
                              <div>
                                <p className='text-base font-semibold text-black'>
                                  {item.question}
                                </p>
                                <p className='text-xs text-gray-400 mt-1'>
                                  Asked{' '}
                                  {new Date(
                                    item.created_at
                                  ).toLocaleTimeString('en-US', {
                                    hour: 'numeric',
                                    minute: '2-digit',
                                  })}
                                </p>
                              </div>
                              <button
                                onClick={() =>
                                  toggleUpvote(item.id, item.user_has_upvoted)
                                }
                                className={`flex items-center gap-2 px-3 py-1 rounded-full border ${
                                  item.user_has_upvoted
                                    ? 'bg-primary text-white border-primary'
                                    : 'border-gray-200 text-gray-600'
                                }`}
                              >
                                <ThumbsUp className='w-4 h-4' />
                                {item.upvote_count}
                              </button>
                            </div>
                            {item.replies.length > 0 && (
                              <div className='mt-3'>
                                <button
                                  className='text-sm text-primary font-semibold flex items-center gap-2'
                                  onClick={() => toggleExpanded(item.id)}
                                >
                                  {expandedQuestions.has(item.id) ? (
                                    <>
                                      <ChevronUp className='w-4 h-4' />
                                      Hide {item.replies.length} replies
                                    </>
                                  ) : (
                                    <>
                                      <ChevronDown className='w-4 h-4' />
                                      Show {item.replies.length} replies
                                    </>
                                  )}
                                </button>
                                {expandedQuestions.has(item.id) && (
                                  <ul className='mt-3 space-y-2 text-sm text-gray-600'>
                                    {item.replies.map((reply) => (
                                      <li
                                        key={reply.id}
                                        className='bg-gray-50 rounded-xl px-3 py-2'
                                      >
                                        {reply.reply}
                                      </li>
                                    ))}
                                  </ul>
                                )}
                              </div>
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>

            <div className='bg-white rounded-3xl border border-gray-100 p-6'>
              <p className='text-lg font-semibold text-black mb-2'>
                How the Q&A works
              </p>
              <ul className='space-y-3 text-sm text-gray-600'>
                <li>Questions stay anonymous. Feel free to ask anything.</li>
                <li>
                  Upvote the questions that you want the instructor to cover.
                </li>
                <li>
                  Replies will be posted as soon as the instructors respond.
                </li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}

export default QASession
