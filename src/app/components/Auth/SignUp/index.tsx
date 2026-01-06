'use client'

import Link from 'next/link'
import { useState, type FormEvent } from 'react'
import toast from 'react-hot-toast'
import SocialSignUp from '../SocialSignUp'
import Logo from '@/app/components/Layout/Header/Logo'
import Loader from '@/app/components/Common/Loader'
import { supabase } from '@/lib/supabaseClient'
import { useAuth } from '@/contexts/AuthContext'

type SignUpProps = {
  onSuccess?: () => void
  hideLogo?: boolean
}

const SignUp = ({ onSuccess, hideLogo = false }: SignUpProps) => {
  const { signIn } = useAuth()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  })
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    try {
      const { error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.name,
            role: 'basic',
          },
        },
      })
      if (error) {
        throw error
      }
      await signIn(formData.email, formData.password)
      toast.success('Account created! You are now signed in.')
      setFormData({ name: '', email: '', password: '' })
      onSuccess?.()
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Unable to sign up right now'
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

      <SocialSignUp />

      <span className="z-1 relative my-8 block text-center before:content-[''] before:absolute before:h-px before:w-[40%] before:bg-black/20 before:left-0 before:top-3 after:content-[''] after:absolute after:h-px after:w-[40%] after:bg-black/20 after:top-3 after:right-0">
        <span className='text-body-secondary relative z-10 inline-block px-3 text-base text-black'>
          OR
        </span>
      </span>

      <form onSubmit={handleSubmit}>
        <div className='mb-[22px]'>
          <input
            type='text'
            placeholder='Name'
            name='name'
            value={formData.name}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, name: e.target.value }))
            }
            required
            className='w-full rounded-md border border-solid bg-transparent px-5 py-3 text-base text-dark outline-hidden transition border-gray-200 placeholder:text-black/30 focus:border-primary focus-visible:shadow-none text-black'
          />
        </div>
        <div className='mb-[22px]'>
          <input
            type='email'
            placeholder='Email'
            name='email'
            value={formData.email}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, email: e.target.value }))
            }
            required
            className='w-full rounded-md border border-solid bg-transparent px-5 py-3 text-base text-dark outline-hidden transition border-gray-200 placeholder:text-black/30 focus:border-primary focus-visible:shadow-none text-black'
          />
        </div>
        <div className='mb-[22px] relative'>
          <input
            type={showPassword ? 'text' : 'password'}
            placeholder='Password'
            name='password'
            value={formData.password}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, password: e.target.value }))
            }
            required
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
            type='submit'
            className='flex w-full items-center text-18 font-medium justify-center rounded-md  text-white bg-primary px-5 py-3 text-darkmode transition duration-300 ease-in-out hover:bg-transparent hover:text-primary border-primary border hover:cursor-pointer'>
            Sign Up {loading && <Loader />}
          </button>
        </div>
      </form>

      <p className='text-body-secondary mb-4 text-black text-base'>
        By creating an account you are agree with our{' '}
        <Link href='/#' className='text-primary hover:underline'>
          Privacy
        </Link>{' '}
        and{' '}
        <Link href='/#' className='text-primary hover:underline'>
          Policy
        </Link>
      </p>

      <p className='text-body-secondary text-black text-base'>
        Already have an account?
        <Link href='/signin' className='pl-2 text-primary hover:underline'>
          Sign In
        </Link>
      </p>
    </>
  )
}

export default SignUp
