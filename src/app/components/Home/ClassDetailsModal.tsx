'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  Calendar,
  CheckCircle2,
  MapPin,
  User,
  Users,
  X,
} from 'lucide-react'
import { supabase } from '@/lib/supabaseClient'
import { useAuth } from '@/contexts/AuthContext'
import type { Database } from '@/types/database.types'
import toast from 'react-hot-toast'

type ClassRow = Database['public']['Tables']['classes']['Row']
type Attendance = Database['public']['Tables']['attendance']['Row']
type ProfessorSuggestion =
  Database['public']['Tables']['professor_suggestions']['Row']

type ClassDetailsModalProps = {
  classItem: ClassRow
  onClose: () => void
}

const formatDate = (isoDate: string) =>
  new Date(isoDate).toLocaleString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })

const ClassDetailsModal = ({ classItem, onClose }: ClassDetailsModalProps) => {
  const [attendees, setAttendees] = useState<Attendance[]>([])
  const [suggestions, setSuggestions] = useState<ProfessorSuggestion[]>([])
  const [userVotes, setUserVotes] = useState<Set<string>>(new Set())
  const [profName, setProfName] = useState('')
  const [profTopic, setProfTopic] = useState('')
  const [suggestionError, setSuggestionError] = useState('')
  const [attending, setAttending] = useState(false)
  const [suggesting, setSuggesting] = useState(false)
  const [voting, setVoting] = useState<string | null>(null)
  const { user } = useAuth()
  const attendeeName = useMemo(() => {
    const name =
      (user?.user_metadata as Record<string, unknown> | undefined)?.full_name ||
      user?.email ||
      ''
    return name as string
  }, [user])
  const currentAttendance = useMemo(
    () => attendees.find((person) => person.user_id === user?.id) ?? null,
    [attendees, user?.id]
  )

  useEffect(() => {
    const body = document.querySelector('body')
    if (body) body.style.overflow = 'hidden'
    return () => {
      if (body) body.style.overflow = ''
    }
  }, [])

  const loadDetails = useCallback(async () => {
    const [{ data: attendeeRows }, { data: suggestionRows }] =
      await Promise.all([
        supabase
          .from('attendance')
          .select('*')
          .eq('class_id', classItem.id)
          .order('checked_in_at', { ascending: false }),
        supabase
          .from('professor_suggestions')
          .select('*')
          .eq('class_id', classItem.id)
          .order('votes', { ascending: false }),
      ])

    setAttendees(attendeeRows ?? [])
    setSuggestions(suggestionRows ?? [])

    if (user?.id && suggestionRows && suggestionRows.length > 0) {
      const suggestionIds = suggestionRows.map((row) => row.id)
      const { data: voteRows } = await supabase
        .from('professor_suggestion_votes')
        .select('suggestion_id')
        .eq('user_id', user.id)
        .in('suggestion_id', suggestionIds)
      setUserVotes(new Set((voteRows ?? []).map((vote) => vote.suggestion_id)))
    } else {
      setUserVotes(new Set())
    }
  }, [classItem.id, user?.id])

  useEffect(() => {
    loadDetails()
  }, [loadDetails])

  const handleAttend = async () => {
    if (!user) {
      toast.error('Please sign in to check in.')
      return
    }
    if (!attendeeName.trim()) return
    if (!window.confirm('Confirm check-in for this class?')) {
      return
    }
    setAttending(true)
    const { error } = await supabase.from('attendance').insert({
      attendee_name: attendeeName.trim(),
      class_id: classItem.id,
      user_id: user.id,
    })
    setAttending(false)
    if (error) {
      if (error.message.toLowerCase().includes('duplicate')) {
        toast('You are already checked in.', { icon: 'ℹ️' })
      } else {
        toast.error('Unable to check you in right now.')
      }
      return
    }
    toast.success('You are checked in!')
    loadDetails()
  }

  const handleUnattend = async () => {
    if (!user || !currentAttendance) return
    if (!window.confirm('Remove your check-in for this class?')) {
      return
    }
    setAttending(true)
    const { error } = await supabase
      .from('attendance')
      .delete()
      .eq('id', currentAttendance.id)
    setAttending(false)
    if (error) {
      toast.error('Unable to remove your check-in right now.')
      return
    }
    toast.success('You are no longer checked in.')
    loadDetails()
  }

  const handleSuggestion = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!profName.trim() || !profTopic.trim()) {
      setSuggestionError('Instructor name and topic are both required.')
      return
    }
    setSuggestionError('')
    setSuggesting(true)
    await supabase.from('professor_suggestions').insert({
      class_id: classItem.id,
      name: profName.trim(),
      topic: profTopic.trim(),
    })
    setProfName('')
    setProfTopic('')
    setSuggesting(false)
    loadDetails()
  }

  const handleVote = async (suggestionId: string) => {
    if (!user) {
      toast.error('Please sign in to vote on speakers.')
      return
    }
    if (userVotes.has(suggestionId)) {
      toast('You have already voted for this speaker.', { icon: 'ℹ️' })
      return
    }
    setVoting(suggestionId)
    const { error } = await supabase
      .from('professor_suggestion_votes')
      .insert({ suggestion_id: suggestionId, user_id: user.id })
    setVoting(null)
    if (error) {
      if (error.message.toLowerCase().includes('duplicate')) {
        toast('You have already voted for this speaker.', { icon: 'ℹ️' })
        setUserVotes((prev) => {
          const next = new Set(prev)
          next.add(suggestionId)
          return next
        })
      } else {
        toast.error('Unable to record your vote right now.')
      }
      return
    }
    toast.success('Thanks for voting!')
    loadDetails()
  }

  return (
    <div
      className='fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center px-4 py-8'
      onClick={onClose}
    >
      <div
        className='bg-white rounded-3xl shadow-2xl max-w-4xl w-full overflow-hidden max-h-[90vh] flex flex-col'
        onClick={(e) => e.stopPropagation()}
      >
        <div className='bg-gradient-to-r from-primary to-primary/80 text-white p-6'>
          <div className='flex items-start justify-between gap-6'>
            <div>
              <p className='uppercase text-xs tracking-[0.2em] text-white/80 mb-2'>
                {new Date(classItem.class_date) > new Date()
                  ? 'Upcoming class'
                  : 'Past class'}
              </p>
              <h2 className='text-3xl font-semibold leading-tight'>
                {classItem.title}
              </h2>
              {classItem.subtitle && (
                <p className='text-lg text-white/85 mt-1'>{classItem.subtitle}</p>
              )}
              <p className='flex items-center gap-2 mt-4 text-sm text-white/90'>
                <Calendar className='w-4 h-4' />
                {formatDate(classItem.class_date)}
              </p>
              <p className='flex items-center gap-2 text-sm text-white/90 mt-1'>
                <MapPin className='w-4 h-4' />
                {classItem.location}
              </p>
            </div>
            <button
              onClick={onClose}
              className='bg-white/20 hover:bg-white/30 text-white p-2 rounded-full transition'
            >
              <X className='w-5 h-5' />
            </button>
          </div>
        </div>

        <div className='grid gap-6 p-6 overflow-y-auto lg:grid-cols-2'>
          <div className='space-y-6'>
            <div className='border border-gray-200 rounded-2xl p-5'>
              <div className='flex items-center gap-3 mb-4'>
                <Users className='text-primary w-5 h-5' />
                <div>
                  <p className='text-base font-semibold text-black'>
                    Attendance check-in
                  </p>
                  <p className='text-sm text-gray-500'>
                    {attendees.length} brothers & sisters already checked in
                  </p>
                </div>
              </div>
              <button
                type='button'
                onClick={currentAttendance ? handleUnattend : handleAttend}
                disabled={attending || !attendeeName || !user}
                className={
                  currentAttendance
                    ? 'border border-gray-200 text-gray-700 rounded-xl py-3 font-semibold hover:bg-gray-50 transition disabled:opacity-60 disabled:cursor-not-allowed w-full'
                    : 'bg-primary text-white rounded-xl py-3 font-semibold hover:bg-primary/90 transition disabled:opacity-60 disabled:cursor-not-allowed w-full'
                }
              >
                {attending
                  ? currentAttendance
                    ? 'Removing your check-in...'
                    : 'Checking you in...'
                  : currentAttendance
                    ? 'Uncheck me'
                    : 'Check me in'}
              </button>
              {attendees.length > 0 && (
                <ul className='mt-4 space-y-2 max-h-44 overflow-y-auto pr-2 text-sm text-gray-600'>
                  {attendees.map((person) => (
                    <li key={person.id} className='flex items-center gap-2'>
                      <User className='w-4 h-4 text-primary/70' />
                      <span>{person.attendee_name}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className='border border-gray-200 rounded-2xl p-5'>
              <div className='flex items-center gap-3 mb-4'>
                <CheckCircle2 className='text-primary w-5 h-5' />
                <div>
                  <p className='text-base font-semibold text-black'>
                    Suggest a guest speaker
                  </p>
                  <p className='text-sm text-gray-500'>
                    Share who you want to learn from next
                  </p>
                </div>
              </div>
              <form onSubmit={handleSuggestion} className='flex flex-col gap-3'>
                <input
                  type='text'
                  placeholder='Instructor name (required)'
                  value={profName}
                  onChange={(e) => setProfName(e.target.value)}
                  className='border border-gray-200 rounded-xl px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-primary/40'
                />
                <input
                  type='text'
                  placeholder='Topic you would like covered (required)'
                  value={profTopic}
                  onChange={(e) => setProfTopic(e.target.value)}
                  className='border border-gray-200 rounded-xl px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-primary/40'
                />
                {suggestionError && (
                  <p className='text-sm text-red-500'>{suggestionError}</p>
                )}
                <button
                  type='submit'
                  disabled={suggesting}
                  className='bg-black text-white rounded-xl py-3 font-semibold hover:bg-black/80 transition disabled:opacity-60 disabled:cursor-not-allowed'
                >
                  {suggesting ? 'Sending...' : 'Submit suggestion'}
                </button>
              </form>
            </div>
          </div>

          <div className='border border-gray-200 rounded-2xl p-5'>
            <p className='text-base font-semibold text-black mb-4'>
              Suggestions from the community
            </p>
            {suggestions.length === 0 ? (
              <p className='text-gray-500 text-sm'>
                No suggestions yet. Be the first to share who should teach the
                next halaqa!
              </p>
            ) : (
              <ul className='space-y-4'>
                {suggestions.map((suggestion) => (
                  <li
                    key={suggestion.id}
                    className='border border-gray-100 rounded-xl p-4'
                  >
                    <p className='font-semibold text-black'>{suggestion.name}</p>
                    <p className='text-sm text-gray-500 mt-1'>
                      {suggestion.topic}
                    </p>
                    <button
                      onClick={() => handleVote(suggestion.id)}
                      disabled={
                        !user ||
                        voting === suggestion.id ||
                        userVotes.has(suggestion.id)
                      }
                      className='mt-3 inline-flex items-center gap-2 text-sm font-semibold text-primary px-3 py-1.5 border border-primary rounded-full hover:bg-primary hover:text-white transition disabled:opacity-60 disabled:cursor-not-allowed'
                    >
                      + {suggestion.votes ?? 0} votes
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ClassDetailsModal
