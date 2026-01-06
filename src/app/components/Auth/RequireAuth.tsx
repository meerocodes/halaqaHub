'use client'

import { type ReactNode, useState } from 'react'
import Signin from '@/app/components/Auth/SignIn'
import SignUp from '@/app/components/Auth/SignUp'
import { useAuth } from '@/contexts/AuthContext'

type RequireAuthProps = {
  children: ReactNode
}

const RequireAuth = ({ children }: RequireAuthProps) => {
  const { user, loading } = useAuth()
  const [mode, setMode] = useState<'signin' | 'signup'>('signin')

  if (loading) {
    return (
      <section className='container py-20 text-center'>
        <p className='text-gray-500 text-lg'>Checking your access…</p>
      </section>
    )
  }

  if (!user) {
    return (
      <section className='container py-20'>
        <div className='max-w-3xl mx-auto text-center mb-10 space-y-3'>
          <h1 className='text-3xl font-bold text-gray-900'>Sign in required</h1>
          <p className='text-gray-600'>
            This part of Halaqa Hub is private. Please sign in or create an
            account to continue.
          </p>
        </div>
        <div className='max-w-4xl mx-auto bg-white border border-gray-100 rounded-3xl shadow-xl p-8'>
          <div className='flex gap-3 bg-gray-100 rounded-full p-1 mb-8 max-w-md mx-auto'>
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
            <div className='max-w-md mx-auto'>
              <Signin hideLogo />
            </div>
          ) : (
            <div className='max-w-md mx-auto'>
              <SignUp hideLogo />
            </div>
          )}
        </div>
      </section>
    )
  }

  return <>{children}</>
}

export default RequireAuth
