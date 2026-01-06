'use client'

import { useState } from 'react'
import {
  MessageSquare,
  BookOpenCheck,
  CalendarDays,
  Sparkles,
} from 'lucide-react'
import Signin from '@/app/components/Auth/SignIn'
import SignUp from '@/app/components/Auth/SignUp'

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

const LandingExperience = () => {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin')

  return (
    <section className='bg-cream min-h-[calc(100vh-6rem)] flex items-center py-16'>
      <div className='container grid lg:grid-cols-2 gap-12 items-center'>
        <div className='space-y-6'>
          <p className='text-primary font-semibold uppercase tracking-[0.3em] text-sm'>
            The digital home for our halaqat
          </p>
          <h1 className='text-4xl sm:text-5xl font-bold text-gray-900 leading-tight'>
            Stay in the circle even when you cannot be in the room
          </h1>
          <p className='text-lg text-gray-600'>
            Halaqa Hub brings our nightly lessons, slides, and live questions
            into one elegant space. Sign in to keep learning, share reflections,
            and catch up on what you missed—wherever you are.
          </p>
          <div className='grid sm:grid-cols-2 gap-4'>
            {featureItems.map(({ icon: Icon, title, description }) => (
              <div
                key={title}
                className='p-4 rounded-2xl border border-white/60 bg-white/70 shadow-sm backdrop-blur'>
                <Icon className='w-5 h-5 text-primary mb-2' />
                <p className='font-semibold text-gray-900'>{title}</p>
                <p className='text-sm text-gray-500'>{description}</p>
              </div>
            ))}
          </div>
        </div>

        <div className='bg-white rounded-3xl shadow-2xl border border-white/70 p-8 relative'>
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
          {mode === 'signin' ? (
            <Signin hideLogo />
          ) : (
            <SignUp hideLogo />
          )}
        </div>
      </div>
    </section>
  )
}

export default LandingExperience
