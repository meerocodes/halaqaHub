'use client'

import { useEffect, useMemo, useState } from 'react'
import {
  MessageSquare,
  BookOpenCheck,
  CalendarDays,
  Sparkles,
  Mic2,
  ArrowRight,
  Clock4,
} from 'lucide-react'
import Signin from '@/app/components/Auth/SignIn'
import SignUp from '@/app/components/Auth/SignUp'
import { supabase } from '@/lib/supabaseClient'
import type { Database } from '@/types/database.types'

const featureItems = [
  {
    icon: CalendarDays,
    title: 'Guided nightly schedule',
    description:
      'Preview what is being taught each evening, who is leading, and where to join—online or on-site.',
  },
  {
    icon: BookOpenCheck,
    title: 'Live slide tracking',
    description:
      'Follow the exact slides your instructor is presenting so you never lose your place.',
  },
  {
    icon: MessageSquare,
    title: 'Interactive Q&A wall',
    description:
      'Drop questions, upvote important topics, and keep a threaded history of every answer.',
  },
  {
    icon: Sparkles,
    title: 'Community heartbeat',
    description:
      'Attendance, announcements, and reminders flow into one timeline so everyone stays aligned.',
  },
]

const storyFlow = [
  {
    title: 'Plan your night',
    description:
      'Receive a curated overview of topics, instructors, and locations before maghrib even sets.',
  },
  {
    title: 'Follow along live',
    description:
      'Slides, notes, and audio timestamps update as the instructor advances so remote members never miss a beat.',
  },
  {
    title: 'Reflect together',
    description:
      'Continue the Q&A thread after class, mark questions as answered, and build a living knowledge base.',
  },
]

type SpotlightClass = Pick<
  Database['public']['Tables']['classes']['Row'],
  'id' | 'title' | 'class_date' | 'qa_open'
>

const LandingExperience = () => {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin')
  const [classes, setClasses] = useState<SpotlightClass[]>([])
  const [activeClassIndex, setActiveClassIndex] = useState(0)

  useEffect(() => {
    const fetchClasses = async () => {
      const now = new Date().toISOString()
      const { data } = await supabase
        .from('classes')
        .select('id,title,class_date,qa_open')
        .gte('class_date', now)
        .order('class_date', { ascending: true })
        .limit(3)
      setClasses(data ?? [])
      setActiveClassIndex(0)
    }
    fetchClasses()
  }, [])

  useEffect(() => {
    if (!classes.length) return
    const interval = setInterval(() => {
      setActiveClassIndex((prev) => (prev + 1) % classes.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [classes])

  const activeClass = useMemo(
    () => (classes.length ? classes[activeClassIndex] : null),
    [classes, activeClassIndex]
  )

  return (
    <>
      <section className='relative overflow-hidden bg-gradient-to-br from-primary/5 via-cream to-white py-20'>
        <div
          className='pointer-events-none absolute -right-24 top-10 h-72 w-72 bg-primary/15 blur-3xl rounded-full'
          aria-hidden='true'
        />
        <div
          className='pointer-events-none absolute -left-16 bottom-0 h-64 w-64 bg-primary/10 blur-3xl rounded-full'
          aria-hidden='true'
        />
        <div className='container relative grid gap-12 lg:grid-cols-[1.1fr,0.9fr] items-center'>
          <div className='space-y-8'>
            <span className='inline-flex items-center gap-2 px-4 py-1 rounded-full bg-white shadow text-sm font-semibold text-primary'>
              <Sparkles className='w-4 h-4' />
              Unified Halaqa Command Center
            </span>
            <div className='space-y-5'>
              <h1 className='text-4xl sm:text-5xl font-bold text-gray-900 leading-tight'>
                Every class. Every slide. Every dua in one beautiful home.
              </h1>
              <p className='text-lg text-gray-600 max-w-2xl'>
                From pre-Fajr reflections to late-night tafsir, Halaqa Hub keeps our
                masjid synchronized. Track schedules, follow slides remotely, and
                nurture the questions that push our community forward.
              </p>
            </div>
            <div className='grid md:grid-cols-2 gap-4'>
              {featureItems.map(({ icon: Icon, title, description }) => (
                <div
                  key={title}
                  className='rounded-2xl border border-white/70 bg-white/90 p-4 shadow-sm flex gap-3'>
                  <Icon className='w-5 h-5 text-primary mt-1' />
                  <div>
                    <p className='text-sm font-semibold text-gray-900'>{title}</p>
                    <p className='text-xs text-gray-600'>{description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className='bg-white rounded-3xl shadow-2xl border border-white/70 p-6 relative w-full max-w-sm mx-auto lg:mx-0 lg:ml-auto'>
            <div className='flex gap-3 bg-gray-100 rounded-full p-1 mb-8'>
              <button
                type='button'
                onClick={() => setMode('signin')}
                className={`flex-1 rounded-full py-2 text-sm font-semibold ${
                  mode === 'signin'
                    ? 'bg-white shadow text-primary'
                    : 'text-gray-500'
                }`}>
                Sign In
              </button>
              <button
                type='button'
                onClick={() => setMode('signup')}
                className={`flex-1 rounded-full py-2 text-sm font-semibold ${
                  mode === 'signup'
                    ? 'bg-white shadow text-primary'
                    : 'text-gray-500'
                }`}>
                Create Account
              </button>
            </div>
            {mode === 'signin' ? <Signin hideLogo /> : <SignUp hideLogo />}
          </div>
        </div>
      </section>

      <section className='bg-white py-16'>
        <div className='container grid lg:grid-cols-[1.1fr,0.9fr] gap-12 items-center'>
          <div className='space-y-6'>
            <p className='text-sm uppercase tracking-[0.3em] text-primary'>
              Live pulse
            </p>
            <h2 className='text-3xl font-bold text-gray-900'>
              Tonight’s halaqat rotate every few minutes so you always know what’s next
            </h2>
            <p className='text-gray-600'>
              The dashboard highlights the classes that are opening soon, along with
              the Q&A status. You can even check in with one tap so instructors know
              who is following along virtually.
            </p>
            <ul className='space-y-4'>
              {storyFlow.map((item) => (
                <li
                  key={item.title}
                  className='flex gap-3 items-start p-4 rounded-2xl border border-gray-100 shadow-sm'>
                  <ArrowRight className='w-4 h-4 text-primary mt-1' />
                  <div>
                    <p className='font-semibold text-gray-900'>{item.title}</p>
                    <p className='text-sm text-gray-600'>{item.description}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
          <div className='bg-gradient-to-br from-primary/10 to-white border border-gray-100 rounded-3xl p-6 shadow-xl'>
            {activeClass ? (
              <>
                <div className='flex justify-between items-center mb-6'>
                  <div>
                    <p className='text-xs uppercase text-gray-500'>
                      Rotating spotlight
                    </p>
                    <p className='text-2xl font-semibold text-gray-900'>
                      {activeClass.title}
                    </p>
                  </div>
                  <span
                    className={`px-3 py-1 text-xs font-semibold rounded-full ${
                      activeClass.qa_open
                        ? 'bg-primary/10 text-primary'
                        : 'bg-gray-100 text-gray-500'
                    }`}>
                    {activeClass.qa_open ? 'Q&A open' : 'Q&A closed'}
                  </span>
                </div>
                <div className='space-y-3 text-sm text-gray-700'>
                  <p className='flex items-center gap-2'>
                    <Clock4 className='w-4 h-4 text-primary' />
                    {new Date(activeClass.class_date).toLocaleTimeString('en-US', {
                      hour: 'numeric',
                      minute: '2-digit',
                    })}
                  </p>
                  <p className='flex items-center gap-2 text-primary font-medium'>
                    <Mic2 className='w-4 h-4' />
                    {activeClass.qa_open
                      ? 'Accepting new questions now'
                      : 'Questions open once class begins'}
                  </p>
                </div>
              </>
            ) : (
              <div className='space-y-4'>
                <p className='text-xs uppercase text-gray-500'>Rotating spotlight</p>
                <p className='text-2xl font-semibold text-gray-900'>
                  Classes resume soon
                </p>
                <p className='text-sm text-gray-600'>
                  The moment a new halaqa is scheduled, it will appear here with full
                  details. Check back shortly or sign in to receive notifications.
                </p>
              </div>
            )}
            <div className='pt-6 mt-6 border-t border-white/60 grid gap-3 text-sm text-gray-600'>
              {classes.length === 0 ? (
                <p className='text-center text-gray-500 text-sm'>
                  No upcoming classes are published yet.
                </p>
              ) : (
                classes.map((item, index) => (
                  <button
                    key={item.id}
                    onClick={() => setActiveClassIndex(index)}
                    className={`flex items-center justify-between w-full rounded-2xl px-4 py-3 border transition ${
                      index === activeClassIndex
                        ? 'border-primary text-primary bg-white'
                        : 'border-white/60 hover:border-primary/40'
                    }`}>
                    <span className='text-left'>
                      <p className='text-sm font-semibold'>{item.title}</p>
                      <span className='text-xs text-gray-500'>
                        {new Date(item.class_date).toLocaleString('en-US', {
                          weekday: 'short',
                          hour: 'numeric',
                          minute: '2-digit',
                        })}
                      </span>
                    </span>
                    <ArrowRight className='w-4 h-4' />
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      </section>

      <section className='bg-cream py-16'>
        <div className='container grid md:grid-cols-2 gap-10 items-center'>
          <div className='space-y-5'>
            <p className='text-sm uppercase tracking-[0.3em] text-primary'>
              Built for community teams
            </p>
            <h2 className='text-3xl font-bold text-gray-900'>
              Effortless stewardship for the volunteers keeping our halaqat alive
            </h2>
            <p className='text-gray-600'>
              Halaqa Hub condenses the spreadsheets, WhatsApp threads, and saved
              Instagram posts into a single calm canvas. Every class update
              instantly notifies attendees while keeping administrative controls in
              the hands of the right people.
            </p>
            <ul className='space-y-3 text-sm text-gray-600'>
              <li className='flex gap-2'>
                <span className='text-primary font-semibold'>✓</span> Role-aware
                permissions keep admin tools private
              </li>
              <li className='flex gap-2'>
                <span className='text-primary font-semibold'>✓</span> Reusable slide
                decks and attendance logs
              </li>
              <li className='flex gap-2'>
                <span className='text-primary font-semibold'>✓</span> Real-time
                status for Q&A, recordings, and reminders
              </li>
            </ul>
          </div>
          <div className='bg-white rounded-3xl border border-gray-100 p-6 shadow-xl space-y-6'>
            <div className='flex items-center gap-3'>
              <div className='w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center'>
                <MessageSquare className='w-5 h-5 text-primary' />
              </div>
              <div>
                <p className='text-sm font-semibold text-gray-900'>
                  “Halaqa Hub takes hours of coordination off our team.”
                </p>
                <p className='text-xs text-gray-500'>Community Programs Lead</p>
              </div>
            </div>
            <p className='text-gray-600 text-sm leading-relaxed'>
              “Instead of blasting reminders everywhere, I update the schedule once,
              attach slides, and the entire community is aligned. Volunteers sign in
              to mark attendance, respond to questions, and keep the knowledge
              chain alive.”
            </p>
            <div className='rounded-2xl bg-primary/5 border border-primary/20 p-4 text-sm text-primary font-semibold'>
              Ready to join the nightly flow? Sign in or create an account to see
              the live dashboard.
            </div>
          </div>
        </div>
      </section>
    </>
  )
}

export default LandingExperience
