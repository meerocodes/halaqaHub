'use client'

import { useEffect, useRef, useState } from 'react'
import Logo from './Logo'
import Signin from '@/app/components/Auth/SignIn'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import toast from 'react-hot-toast'
import { Icon } from '@iconify/react/dist/iconify.js'

const Header: React.FC = () => {
  const [hidden, setHidden] = useState(false)
  const [isSignInOpen, setIsSignInOpen] = useState(false)
  const signInRef = useRef<HTMLDivElement>(null)
  const { user, isAdmin, isSuperAdmin, signOut } = useAuth()
  const lastScrollY = useRef(0)

  useEffect(() => {
    const handleScroll = () => {
      const current = window.scrollY
      if (current > lastScrollY.current + 10) {
        setHidden(true)
      } else if (current < lastScrollY.current - 10) {
        setHidden(false)
      }
      lastScrollY.current = current
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    const handler = (event: MouseEvent) => {
      if (
        signInRef.current &&
        !signInRef.current.contains(event.target as Node)
      ) {
        setIsSignInOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  useEffect(() => {
    document.body.style.overflow = isSignInOpen ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [isSignInOpen])

  const handleSignOut = async () => {
    try {
      await signOut()
      toast.success('Signed out')
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Unable to sign out'
      )
    }
  }

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-40 bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg transition-transform duration-300 ${
        hidden ? '-translate-y-full' : 'translate-y-0'
      }`}>
      <div className='container px-4 py-3 md:py-4 mt-0 relative flex flex-col items-center text-center gap-2'>
        <div className='absolute top-4 left-4 flex flex-wrap gap-2'>
          {isAdmin && (
            <Link
              href='/admin'
              className='px-3 py-1.5 rounded-lg border border-white/40 text-sm hover:bg-white/15 transition'>
              Admin Panel
            </Link>
          )}
          {isSuperAdmin && (
            <Link
              href='/superadmin'
              className='px-3 py-1.5 rounded-lg border border-white/40 text-sm hover:bg-white/15 transition'>
              Superadmin
            </Link>
          )}
        </div>
        <div className='absolute top-4 right-4 flex gap-2'>
          {user ? (
            <button
              onClick={handleSignOut}
              className='px-3 py-1.5 rounded-lg border border-white/40 text-sm font-semibold hover:bg-white/15 transition'>
              Sign Out
            </button>
          ) : (
            <button
              onClick={() => setIsSignInOpen(true)}
              className='px-3 py-1.5 rounded-lg border border-white/40 text-sm font-semibold hover:bg-white/15 transition'>
              Sign In
            </button>
          )}
        </div>
        <Logo />
        <p className='text-emerald-100 text-xs sm:text-sm'>
          Learning Together, Growing Together
        </p>
      </div>
      {isSignInOpen && (
        <div className='fixed inset-0 bg-black/50 flex items-center justify-center z-50'>
          <div
            ref={signInRef}
            className='relative mx-auto w-full max-w-md overflow-hidden rounded-xl px-8 pt-14 pb-8 bg-white text-center'>
            <button
              onClick={() => setIsSignInOpen(false)}
              className='absolute top-4 right-4 text-gray-500 hover:text-primary'
              aria-label='Close Sign In Modal'>
              <Icon icon='material-symbols:close-rounded' width={24} height={24} />
            </button>
            <Signin
              onSuccess={() => {
                setIsSignInOpen(false)
              }}
            />
          </div>
        </div>
      )}
    </header>
  )
}

export default Header
