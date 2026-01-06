'use client'

import { useEffect, useState } from 'react'
import { MessageSquare, Send } from 'lucide-react'
import { supabase } from '@/lib/supabaseClient'
import type { Database } from '@/types/database.types'
import toast from 'react-hot-toast'

type ClassRow = Database['public']['Tables']['classes']['Row']

const QuickQA = () => {
  const [todayClasses, setTodayClasses] = useState<ClassRow[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedClass, setSelectedClass] = useState<ClassRow | null>(null)
  const [question, setQuestion] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    const loadTodayClasses = async () => {
      setLoading(true)
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const tomorrow = new Date(today)
      tomorrow.setDate(tomorrow.getDate() + 1)

      const { data } = await supabase
        .from('classes')
        .select('*')
        .gte('class_date', today.toISOString())
        .lt('class_date', tomorrow.toISOString())
        .order('class_date', { ascending: true })

      const classesWithQA = (data ?? []).filter((cls) => cls.qa_is_open || cls.qa_open)
      setTodayClasses(classesWithQA)
      if (classesWithQA.length > 0) {
        setSelectedClass(classesWithQA[0])
      }
      setLoading(false)
    }

    loadTodayClasses()
  }, [])

  const handleSubmitQuestion = async () => {
    if (!question.trim() || !selectedClass) {
      toast.error('Please enter a question and select a class')
      return
    }

    setSubmitting(true)
    try {
      const { error } = await supabase.from('questions').insert({
        class_id: selectedClass.id,
        question: question.trim(),
        is_answered: false,
      })

      if (error) throw error

      toast.success('Question submitted! Others will vote on this and it may be answered.')
      setQuestion('')
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to submit question'
      toast.error(message)
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className='animate-pulse space-y-4'>
        <div className='h-12 bg-gray-100 rounded-lg'></div>
      </div>
    )
  }

  if (todayClasses.length === 0) {
    return null
  }

  return (
    <div className='bg-white border border-gray-100 rounded-3xl p-6 shadow-sm'>
      <div className='flex items-center gap-3 mb-6'>
        <MessageSquare className='text-primary w-6 h-6' />
        <div>
          <p className='text-sm uppercase tracking-[0.3em] text-gray-500'>
            Today's Q&A
          </p>
          <p className='text-lg font-semibold text-black'>
            Ask a question
          </p>
        </div>
      </div>

      <div className='space-y-4'>
        {todayClasses.length > 1 && (
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-2'>
              Select a class
            </label>
            <select
              value={selectedClass?.id || ''}
              onChange={(e) => {
                const selected = todayClasses.find((cls) => cls.id === e.target.value)
                setSelectedClass(selected || null)
              }}
              className='w-full px-4 py-2 border border-gray-200 rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition'
            >
              {todayClasses.map((cls) => (
                <option key={cls.id} value={cls.id}>
                  {cls.title} - {new Date(cls.class_date).toLocaleTimeString('en-US', {
                    hour: 'numeric',
                    minute: '2-digit',
                  })}
                </option>
              ))}
            </select>
          </div>
        )}

        <div>
          <label className='block text-sm font-medium text-gray-700 mb-2'>
            Your question
          </label>
          <textarea
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Ask something about today's class..."
            className='w-full px-4 py-3 border border-gray-200 rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition resize-none'
            rows={3}
          />
          <p className='text-xs text-gray-500 mt-1'>
            Questions are anonymous. Other students will vote on helpful questions.
          </p>
        </div>

        <button
          onClick={handleSubmitQuestion}
          disabled={submitting || !question.trim()}
          className='w-full bg-primary text-white font-medium py-3 px-4 rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center justify-center gap-2'
        >
          <Send className='w-4 h-4' />
          Submit Question
        </button>
      </div>
    </div>
  )
}

export default QuickQA
