'use client'

import { useEffect, useState } from 'react'
import { CalendarDays, Sparkles } from 'lucide-react'
import Signin from '@/app/components/Auth/SignIn'
import SignUp from '@/app/components/Auth/SignUp'
import { supabase } from '@/lib/supabaseClient'

const LandingExperience = () => {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin')
  const [previewClasses, setPreviewClasses] = useState<
    { id: string; title: string; class_date: string }[]
  >([])

  useEffect(() => {
    const fetchPreview = async () => {
      const now = new Date().toISOString()
      const { data } = await supabase
        .from('classes')
        .select('id,title,class_date')
        .gte('class_date', now)
        .order('class_date', { ascending: true })
        .limit(3)
      setPreviewClasses(
        (data ?? []).map((cls) => ({
          id: cls.id,
          title: cls.title,
          class_date: cls.class_date,
        }))
      )
    }
    fetchPreview()
  }, [])

  return (
    <>
      <section className='bg-gradient-to-b from-cream to-white py-16 min-h-[calc(100vh-6rem)] flex items-center'>
        <div className='container grid gap-12 lg:grid-cols-2 items-center'>
          <div className='space-y-6'>
            <span className='inline-flex items-center gap-2 px-4 py-1 rounded-full bg-white shadow text-sm font-semibold text-primary'>
              <Sparkles className='w-4 h-4' />
              Private community preview
            </span>
            <h1 className='text-4xl sm:text-5xl font-bold text-gray-900 leading-tight'>
              Stay connected to every nightly halaqa—even before you walk in.
            </h1>
            <p className='text-lg text-gray-600 max-w-2xl'>
              Sign in to browse the live schedule, follow along with slides, and
              drop questions for your instructors. Everything the community needs,
              in one calm dashboard.
            </p>
            <div className='rounded-3xl bg-white shadow-lg border border-gray-100 p-6 space-y-4'>
              <p className='text-sm font-semibold text-gray-700 flex items-center gap-2'>
                <CalendarDays className='w-4 h-4 text-primary' />
                Upcoming classes (preview)
              </p>
              <ul className='space-y-3'>
                {previewClasses.length === 0 ? (
                  <li className='text-sm text-gray-500'>
                    Schedule unlocks soon—sign in for early access.
                  </li>
                ) : (
                  previewClasses.map((item) => (
                    <li
                      key={item.id}
                      className='flex flex-col rounded-2xl border border-gray-100 px-4 py-3'>
                      <span className='text-sm font-semibold text-gray-900'>
                        {item.title}
                      </span>
                      <span className='text-xs text-gray-500'>
                        {new Date(item.class_date).toLocaleString('en-US', {
                          weekday: 'short',
                          month: 'short',
                          day: 'numeric',
                          hour: 'numeric',
                          minute: '2-digit',
                        })}
                      </span>
                    </li>
                  ))
                )}
              </ul>
              <p className='text-xs text-gray-500'>
                Sign in to see full details, Q&A status, and class materials.
              </p>
            </div>
          </div>

          <div className='bg-white rounded-3xl shadow-2xl border border-white/70 p-6 w-full max-w-sm mx-auto'>
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
    </>
  )
}

export default LandingExperience
