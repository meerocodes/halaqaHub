'use client'

import Link from 'next/link'
import { useState } from 'react'
import toast from 'react-hot-toast'
import Logo from '@/app/components/Layout/Header/Logo'
import Loader from '@/app/components/Common/Loader'
import { useAuth } from '@/contexts/AuthContext'

type SigninProps = {
  onSuccess?: () => void
  hideLogo?: boolean
}

const Signin = ({ onSuccess, hideLogo = false }: SigninProps) => {
  const { signIn } = useAuth()

  const [loginData, setLoginData] = useState({
    email: '',
    password: '',
  })
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const loginUser = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await signIn(loginData.email, loginData.password)
      toast.success('Welcome back!')
      onSuccess?.()
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Unable to sign in right now'
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      {!hideLogo && (
        <div className='mb-10 text-center mx-auto inline-block max-w-[160px]'>
          <Logo />
        </div>
      )}

      <form onSubmit={loginUser}>
        <div className='mb-[22px]'>
          <input
            type='email'
            placeholder='Email'
            onChange={(e) =>
              setLoginData({ ...loginData, email: e.target.value })
            }
            className='w-full rounded-md border border-solid bg-transparent px-5 py-3 text-base text-dark outline-hidden transition border-gray-200 placeholder:text-black/30 focus:border-primary focus-visible:shadow-none text-black'
          />
        </div>
        <div className='mb-[22px] relative'>
          <input
            type={showPassword ? 'text' : 'password'}
            placeholder='Password'
            onChange={(e) =>
              setLoginData({ ...loginData, password: e.target.value })
            }
            className='w-full rounded-md border border-solid bg-transparent px-5 py-3 pr-12 text-base text-dark outline-hidden transition border-gray-200 placeholder:text-black/30 focus:border-primary focus-visible:shadow-none text-black'
          />
          <button
            type='button'
            onClick={() => setShowPassword((prev) => !prev)}
            className='absolute inset-y-0 right-3 text-sm text-gray-500 hover:text-primary'
          >
            {showPassword ? 'Hide' : 'Show'}
          </button>
        </div>
        <div className='mb-9'>
          <button
            onClick={loginUser}
            type='submit'
            className='bg-primary w-full py-3 rounded-lg text-18 font-medium border text-white border-primary hover:text-primary hover:bg-transparent hover:cursor-pointer transition duration-300 ease-in-out'>
            Sign In {loading && <Loader />}
          </button>
        </div>
      </form>

      <Link
        href='/#'
        className='mb-2 inline-block text-base text-primary hover:underline'>
        Forgot Password?
      </Link>
      <p className='text-body-secondary text-black text-base'>
        Not a member yet?{' '}
        <Link href='/signup' className='text-primary hover:underline'>
          Sign Up
        </Link>
      </p>
    </>
  )
}

export default Signin
