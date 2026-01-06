'use client'

import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'

const Footer = () => {
  const { user } = useAuth()
  return (
    <footer className='bg-primary text-white'>
      <div className='container py-12 flex flex-col items-center gap-4 text-center'>
        <p className='text-sm uppercase tracking-[0.3em] text-white/70'>
          Learning Together, Growing Together
        </p>
        <p className='text-lg font-semibold text-white/90'>
          Log in to see tonight&rsquo;s schedule and stay connected with our halaqat.
        </p>
        {!user ? (
          <Link
            href='/'
            className='px-6 py-3 rounded-full bg-white text-primary font-semibold hover:bg-white/90 transition'>
            Sign In
          </Link>
        ) : (
          <Link
            href='/admin'
            className='px-6 py-3 rounded-full bg-white text-primary font-semibold hover:bg-white/90 transition'>
            Go to Dashboard
          </Link>
        )}
        <p className='text-xs text-white/70 pt-4'>
          © {new Date().getFullYear()} Halaqa Hub
        </p>
      </div>
    </footer>
  )
}

export default Footer
