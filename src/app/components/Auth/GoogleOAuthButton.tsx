'use client'

import { useState } from 'react'
import toast from 'react-hot-toast'
import { supabase } from '@/lib/supabaseClient'
import Loader from '../Common/Loader'

type GoogleOAuthButtonProps = {
  label?: string
}

const GoogleOAuthButton = ({ label = 'Continue with Google' }: GoogleOAuthButtonProps) => {
  const [loading, setLoading] = useState(false)

  const handleGoogleSignUp = async () => {
    try {
      setLoading(true)
      const redirectTo =
        typeof window !== 'undefined' ? window.location.origin : undefined
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo },
      })
      if (error) {
        throw error
      }
      toast.loading('Redirecting to Google…', { id: 'google-auth' })
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Unable to sign in with Google'
      toast.error(message)
    } finally {
      setTimeout(() => {
        toast.dismiss('google-auth')
        setLoading(false)
      }, 1200)
    }
  }

  return (
    <button
      type='button'
      onClick={handleGoogleSignUp}
      disabled={loading}
      className='flex w-full items-center justify-center gap-3 rounded-lg p-3.5 border border-gray-200 text-black hover:bg-neutral-100 hover:cursor-pointer disabled:opacity-60'>
      <svg
        width='20'
        height='20'
        viewBox='0 0 256 262'
        xmlns='http://www.w3.org/2000/svg'
        aria-hidden='true'>
        <path
          d='M255.68 133.5c0-10.9-.98-18.8-3.08-27H130.5v49.6h71.47c-1.44 12-9.22 30.05-26.5 42.2l-.24 1.57 38.47 29.85 2.66.27c24.5-22.6 38.42-55.8 38.42-97.9'
          fill='#4285F4'
        />
        <path
          d='M130.5 261c35.1 0 64.6-11.6 86.1-31.6l-41.03-31.84c-11 7.7-25.92 13.1-45.08 13.1-34.52 0-63.8-23-74.2-54.97l-1.53.13-40.17 30.9-.52 1.45C36.29 231.4 79.64 261 130.5 261'
          fill='#34A853'
        />
        <path
          d='M56.3 155.7C53.55 147.7 52 139.1 52 130c0-9.1 1.55-17.6 4.1-25.7l-.07-1.72-40.69-31.3-1.33.63C5.27 87.7 0 108.2 0 130c0 21.8 5.27 42.3 14 57.1l42.3-31.4'
          fill='#FBBC05'
        />
        <path
          d='M130.5 50.5c24.44 0 40.93 10.5 50.34 19.3l36.74-35.9C195.07 12.4 165.6 0 130.5 0 79.64 0 36.29 29.6 14.47 72.1l41.63 32.2c10.54-31.9 39.88-53.8 74.4-53.8'
          fill='#EA4335'
        />
      </svg>
      {label} {loading && <Loader />}
    </button>
  )
}

export default GoogleOAuthButton
