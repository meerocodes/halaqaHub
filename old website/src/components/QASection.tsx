import { useState, useEffect } from 'react';
import { MessageCircle, Send, CheckCircle, Clock, ToggleLeft, ToggleRight, ThumbsUp, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import type { Database } from '../lib/database.types';

type Class = Database['public']['Tables']['classes']['Row'];
type Question = Database['public']['Tables']['questions']['Row'];
type Reply = Database['public']['Tables']['question_replies']['Row'];

interface QuestionWithUpvotes extends Question {
  upvote_count: number;
  user_has_upvoted: boolean;
  replies: Reply[];
  reply_count: number;
}

interface ClassWithQuestions extends Class {
  questions: QuestionWithUpvotes[];
}

const getUserIdentifier = (): string => {
  let identifier = localStorage.getItem('user_identifier');
  if (!identifier) {
    identifier = crypto.randomUUID();
    localStorage.setItem('user_identifier', identifier);
  }
  return identifier;
};

export function QASection() {
  const { isAdmin } = useAuth();
  const [todayClasses, setTodayClasses] = useState<ClassWithQuestions[]>([]);
  const [selectedClass, setSelectedClass] = useState<ClassWithQuestions | null>(null);
  const [newQuestion, setNewQuestion] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [expandedQuestions, setExpandedQuestions] = useState<Set<string>>(new Set());
  const [replyInputs, setReplyInputs] = useState<Record<string, string>>({});
  const [replySubmitting, setReplySubmitting] = useState<string | null>(null);

  useEffect(() => {
    loadTodayClasses();
  }, []);

  useEffect(() => {
    if (selectedClass) {
      const subscription = supabase
        .channel('questions_channel')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'questions',
            filter: `class_id=eq.${selectedClass.id}`,
          },
          () => {
            loadQuestionsForClass(selectedClass.id);
          }
        )
        .subscribe();

      return () => {
        subscription.unsubscribe();
      };
    }
  }, [selectedClass]);

  const loadTodayClasses = async () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const { data: classes } = await supabase
      .from('classes')
      .select('*')
      .gte('class_date', today.toISOString())
      .lt('class_date', tomorrow.toISOString())
      .order('class_date', { ascending: true });

    if (classes && classes.length > 0) {
      const userIdentifier = getUserIdentifier();
      const classesWithQuestions = await Promise.all(
        classes.map(async (cls) => {
          const { data: questions } = await supabase
            .from('questions')
            .select('*')
            .eq('class_id', cls.id)
            .order('created_at', { ascending: false });

          const questionsWithUpvotes = await Promise.all(
            (questions || []).map(async (question) => {
              const { count } = await supabase
                .from('question_upvotes')
                .select('*', { count: 'exact', head: true })
                .eq('question_id', question.id);

              const { data: userUpvote } = await supabase
                .from('question_upvotes')
                .select('id')
                .eq('question_id', question.id)
                .eq('user_identifier', userIdentifier)
                .maybeSingle();

              const { data: replies } = await supabase
                .from('question_replies')
                .select('*')
                .eq('question_id', question.id)
                .order('created_at', { ascending: true });

              return {
                ...question,
                upvote_count: count || 0,
                user_has_upvoted: !!userUpvote,
                replies: replies || [],
                reply_count: replies?.length || 0,
              };
            })
          );

          questionsWithUpvotes.sort((a, b) => b.upvote_count - a.upvote_count);

          return {
            ...cls,
            questions: questionsWithUpvotes,
          };
        })
      );

      setTodayClasses(classesWithQuestions);
      setSelectedClass(classesWithQuestions[0]);
    }
    setLoading(false);
  };

  const loadQuestionsForClass = async (classId: string) => {
    const { data: questions } = await supabase
      .from('questions')
      .select('*')
      .eq('class_id', classId)
      .order('created_at', { ascending: false });

    if (questions) {
      const userIdentifier = getUserIdentifier();

      const questionsWithUpvotes = await Promise.all(
        questions.map(async (question) => {
          const { count } = await supabase
            .from('question_upvotes')
            .select('*', { count: 'exact', head: true })
            .eq('question_id', question.id);

          const { data: userUpvote } = await supabase
            .from('question_upvotes')
            .select('id')
            .eq('question_id', question.id)
            .eq('user_identifier', userIdentifier)
            .maybeSingle();

          const { data: replies } = await supabase
            .from('question_replies')
            .select('*')
            .eq('question_id', question.id)
            .order('created_at', { ascending: true });

          return {
            ...question,
            upvote_count: count || 0,
            user_has_upvoted: !!userUpvote,
            replies: replies || [],
            reply_count: replies?.length || 0,
          };
        })
      );

      questionsWithUpvotes.sort((a, b) => b.upvote_count - a.upvote_count);

      setTodayClasses((prev) =>
        prev.map((cls) =>
          cls.id === classId ? { ...cls, questions: questionsWithUpvotes } : cls
        )
      );

      if (selectedClass?.id === classId) {
        setSelectedClass((prev) => prev ? { ...prev, questions: questionsWithUpvotes } : null);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClass || !selectedClass.qa_open) return;

    const { error } = await supabase
      .from('questions')
      .insert({
        class_id: selectedClass.id,
        question: newQuestion,
      });

    if (!error) {
      setNewQuestion('');
      setSubmitted(true);
      setTimeout(() => setSubmitted(false), 3000);
    }
  };

  const toggleQA = async (classId: string, currentState: boolean) => {
    await supabase
      .from('classes')
      .update({ qa_open: !currentState })
      .eq('id', classId);

    loadTodayClasses();
  };

  const toggleAnswered = async (questionId: string, currentState: boolean) => {
    await supabase
      .from('questions')
      .update({ is_answered: !currentState })
      .eq('id', questionId);

    if (selectedClass) {
      loadQuestionsForClass(selectedClass.id);
    }
  };

  const toggleUpvote = async (questionId: string, hasUpvoted: boolean) => {
    const userIdentifier = getUserIdentifier();

    if (hasUpvoted) {
      await supabase
        .from('question_upvotes')
        .delete()
        .eq('question_id', questionId)
        .eq('user_identifier', userIdentifier);
    } else {
      await supabase
        .from('question_upvotes')
        .insert({
          question_id: questionId,
          user_identifier: userIdentifier,
        });
    }

    if (selectedClass) {
      loadQuestionsForClass(selectedClass.id);
    }
  };

  const deleteQuestion = async (questionId: string) => {
    if (!confirm('Are you sure you want to delete this question?')) return;

    await supabase
      .from('questions')
      .delete()
      .eq('id', questionId);

    if (selectedClass) {
      loadQuestionsForClass(selectedClass.id);
    }
  };

  const toggleQuestionExpanded = (questionId: string) => {
    setExpandedQuestions((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(questionId)) {
        newSet.delete(questionId);
      } else {
        newSet.add(questionId);
      }
      return newSet;
    });
  };

  const handleReplySubmit = async (questionId: string) => {
    const reply = replyInputs[questionId];
    if (!reply || !reply.trim()) return;

    setReplySubmitting(questionId);

    const { error } = await supabase
      .from('question_replies')
      .insert({
        question_id: questionId,
        reply: reply.trim(),
      });

    if (!error) {
      setReplyInputs((prev) => ({ ...prev, [questionId]: '' }));
      if (selectedClass) {
        await loadQuestionsForClass(selectedClass.id);
      }
    }

    setReplySubmitting(null);
  };

  const deleteReply = async (replyId: string) => {
    if (!confirm('Are you sure you want to delete this reply?')) return;

    await supabase
      .from('question_replies')
      .delete()
      .eq('id', replyId);

    if (selectedClass) {
      loadQuestionsForClass(selectedClass.id);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  if (todayClasses.length === 0) {
    return (
      <section className="mb-8 sm:mb-12">
        <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
          <MessageCircle className="text-emerald-600" size={24} />
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800">Q&A Session</h2>
        </div>
        <div className="text-center py-8 sm:py-12 bg-gray-50 rounded-xl px-4">
          <MessageCircle size={40} className="sm:w-12 sm:h-12 mx-auto text-gray-400 mb-3" />
          <p className="text-sm sm:text-base text-gray-600">No classes scheduled for today</p>
          <p className="text-gray-500 text-xs sm:text-sm mt-2">Q&A sessions are only available on class days</p>
        </div>
      </section>
    );
  }

  return (
    <section className="mb-8 sm:mb-12">
      <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
        <MessageCircle className="text-emerald-600" size={24} />
        <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800">Q&A Session</h2>
      </div>

      <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 border-2 border-gray-200">
        {todayClasses.length > 1 && (
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Select Class</label>
            <select
              value={selectedClass?.id}
              onChange={(e) => {
                const cls = todayClasses.find(c => c.id === e.target.value);
                setSelectedClass(cls || null);
              }}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-gray-900"
            >
              {todayClasses.map((cls) => (
                <option key={cls.id} value={cls.id}>
                  {cls.title} {cls.qa_open ? '(Q&A Open)' : '(Q&A Closed)'}
                </option>
              ))}
            </select>
          </div>
        )}

        {selectedClass && (
          <>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6 pb-4 border-b gap-3">
              <div className="flex-1">
                <h3 className="text-lg sm:text-xl font-bold text-gray-800">{selectedClass.title}</h3>
                <p className="text-xs sm:text-sm text-gray-600 mt-1">
                  {new Date(selectedClass.class_date).toLocaleTimeString('en-US', {
                    hour: 'numeric',
                    minute: '2-digit',
                  })} - {selectedClass.location}
                </p>
              </div>
              <div className="flex items-center gap-2 sm:gap-3">
                <span
                  className={`px-3 sm:px-4 py-1 rounded-full text-xs sm:text-sm font-semibold ${
                    selectedClass.qa_open
                      ? 'bg-green-100 text-green-700'
                      : 'bg-red-100 text-red-700'
                  }`}
                >
                  {selectedClass.qa_open ? 'Q&A Open' : 'Q&A Closed'}
                </span>
                {isAdmin && (
                  <button
                    onClick={() => toggleQA(selectedClass.id, selectedClass.qa_open)}
                    className={`p-1.5 sm:p-2 rounded-lg transition-colors ${
                      selectedClass.qa_open
                        ? 'bg-red-100 text-red-700 hover:bg-red-200'
                        : 'bg-green-100 text-green-700 hover:bg-green-200'
                    }`}
                    title={selectedClass.qa_open ? 'Close Q&A' : 'Open Q&A'}
                  >
                    {selectedClass.qa_open ? <ToggleRight size={20} /> : <ToggleLeft size={20} />}
                  </button>
                )}
              </div>
            </div>

            {selectedClass.qa_open && (
              <form onSubmit={handleSubmit} className="mb-4 sm:mb-6">
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                  Ask a Question (Anonymous)
                </label>
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                  <input
                    type="text"
                    value={newQuestion}
                    onChange={(e) => setNewQuestion(e.target.value)}
                    placeholder="Type your question here..."
                    className="flex-1 px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-gray-900"
                    required
                  />
                  <button
                    type="submit"
                    className="bg-emerald-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg hover:bg-emerald-700 transition-colors font-medium flex items-center justify-center gap-2 text-sm sm:text-base"
                  >
                    <Send size={16} className="sm:w-[18px] sm:h-[18px]" />
                    <span>Send</span>
                  </button>
                </div>
                {submitted && (
                  <div className="mt-3 flex items-center gap-2 text-emerald-600">
                    <CheckCircle size={18} className="sm:w-5 sm:h-5" />
                    <span className="font-medium text-sm sm:text-base">Question submitted successfully!</span>
                  </div>
                )}
              </form>
            )}

            <div>
              <h4 className="font-bold text-gray-800 mb-4">
                Questions ({selectedClass.questions.length})
              </h4>
              {selectedClass.questions.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No questions yet. Be the first to ask!</p>
              ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {selectedClass.questions.map((question) => {
                    const isExpanded = expandedQuestions.has(question.id);
                    const hasReplies = question.reply_count > 0;

                    return (
                      <div
                        key={question.id}
                        className={`rounded-lg border-l-4 ${
                          question.is_answered
                            ? 'bg-emerald-50 border-emerald-500'
                            : 'bg-gray-50 border-gray-300'
                        }`}
                      >
                        <div className="p-4">
                          <div className="flex items-start gap-3">
                            <div className="flex flex-col items-center gap-1 pt-1">
                              <button
                                onClick={() => toggleUpvote(question.id, question.user_has_upvoted)}
                                className={`p-1.5 rounded-lg transition-all ${
                                  question.user_has_upvoted
                                    ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                                    : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                                }`}
                                title={question.user_has_upvoted ? 'Remove upvote' : 'Upvote question'}
                              >
                                <ThumbsUp size={16} />
                              </button>
                              <span className="text-sm font-bold text-gray-700">
                                {question.upvote_count}
                              </span>
                            </div>

                            <div className="flex-1">
                              <p className="text-gray-800 font-medium">{question.question}</p>
                              <div className="flex items-center gap-3 mt-2">
                                <span className="text-xs text-gray-500">
                                  {new Date(question.created_at).toLocaleTimeString('en-US', {
                                    hour: 'numeric',
                                    minute: '2-digit',
                                  })}
                                </span>
                                {hasReplies && (
                                  <button
                                    onClick={() => toggleQuestionExpanded(question.id)}
                                    className="flex items-center gap-1 text-xs text-emerald-600 hover:text-emerald-700 font-medium"
                                  >
                                    {isExpanded ? (
                                      <>
                                        <ChevronUp size={14} />
                                        Hide {question.reply_count} {question.reply_count === 1 ? 'reply' : 'replies'}
                                      </>
                                    ) : (
                                      <>
                                        <ChevronDown size={14} />
                                        Show {question.reply_count} {question.reply_count === 1 ? 'reply' : 'replies'}
                                      </>
                                    )}
                                  </button>
                                )}
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              {question.is_answered ? (
                                <CheckCircle className="text-emerald-600 flex-shrink-0" size={20} />
                              ) : (
                                <Clock className="text-gray-400 flex-shrink-0" size={20} />
                              )}
                              {isAdmin && (
                                <>
                                  <button
                                    onClick={() => toggleAnswered(question.id, question.is_answered)}
                                    className={`text-xs px-3 py-1 rounded-full font-medium transition-colors ${
                                      question.is_answered
                                        ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                        : 'bg-emerald-200 text-emerald-700 hover:bg-emerald-300'
                                    }`}
                                  >
                                    {question.is_answered ? 'Unanswer' : 'Mark Answered'}
                                  </button>
                                  <button
                                    onClick={() => deleteQuestion(question.id)}
                                    className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                    title="Delete question"
                                  >
                                    <Trash2 size={16} />
                                  </button>
                                </>
                              )}
                            </div>
                          </div>

                          {isExpanded && hasReplies && (
                            <div className="mt-3 ml-12 space-y-2 border-l-2 border-gray-300 pl-3">
                              {question.replies.map((reply) => (
                                <div
                                  key={reply.id}
                                  className="bg-white p-3 rounded-lg border border-gray-200"
                                >
                                  <div className="flex items-start justify-between gap-2">
                                    <p className="text-sm text-gray-700 flex-1">{reply.reply}</p>
                                    {isAdmin && (
                                      <button
                                        onClick={() => deleteReply(reply.id)}
                                        className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors flex-shrink-0"
                                        title="Delete reply"
                                      >
                                        <Trash2 size={14} />
                                      </button>
                                    )}
                                  </div>
                                  <span className="text-xs text-gray-400 mt-1 block">
                                    {new Date(reply.created_at).toLocaleTimeString('en-US', {
                                      hour: 'numeric',
                                      minute: '2-digit',
                                    })}
                                  </span>
                                </div>
                              ))}
                            </div>
                          )}

                          <div className="mt-3 ml-12">
                            <div className="flex gap-2">
                              <input
                                type="text"
                                value={replyInputs[question.id] || ''}
                                onChange={(e) =>
                                  setReplyInputs((prev) => ({
                                    ...prev,
                                    [question.id]: e.target.value,
                                  }))
                                }
                                placeholder="Write a reply..."
                                className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-gray-900"
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    handleReplySubmit(question.id);
                                  }
                                }}
                              />
                              <button
                                onClick={() => handleReplySubmit(question.id)}
                                disabled={!replyInputs[question.id]?.trim() || replySubmitting === question.id}
                                className="bg-emerald-600 text-white px-3 py-2 rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                              >
                                <Send size={14} />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </section>
  );
}
