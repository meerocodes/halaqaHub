'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Logo from './Logo'
import { useAuth } from '@/contexts/AuthContext'
import toast from 'react-hot-toast'

const Header: React.FC = () => {
  const [hidden, setHidden] = useState(false)
  const { user, isAdmin, isSuperAdmin, signOut } = useAuth()

  useEffect(() => {
    let lastScrollY = 0
    const handleScroll = () => {
      const current = window.scrollY
      if (current > lastScrollY + 10) {
        setHidden(true)
      } else if (current < lastScrollY - 10) {
        setHidden(false)
      }
      lastScrollY = current
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

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
      <div className='container px-4 py-3 md:py-4 relative flex flex-col items-center text-center gap-2'>
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
          {user && (
            <button
              onClick={handleSignOut}
              className='px-3 py-1.5 rounded-lg border border-white/40 text-sm font-semibold hover:bg-white/15 transition'>
              Sign Out
            </button>
          )}
        </div>
        <Logo />
        <p className='text-emerald-100 text-xs sm:text-sm'>
          Learning Together, Growing Together
        </p>
      </div>
    </header>
  )
}

export default Header
