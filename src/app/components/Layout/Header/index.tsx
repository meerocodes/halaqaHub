'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import Logo from './Logo'
import HeaderLink from '../Header/Navigation/HeaderLink'
import MobileHeaderLink from '../Header/Navigation/MobileHeaderLink'
import Signin from '@/app/components/Auth/SignIn'
import { Icon } from '@iconify/react/dist/iconify.js'
import { HeaderItem } from '@/app/types/menu'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import toast from 'react-hot-toast'

const Header: React.FC = () => {
  const [headerData, setHeaderData] = useState<HeaderItem[]>([])

  const [navbarOpen, setNavbarOpen] = useState(false)
  const [sticky, setSticky] = useState(false)
  const [isSignInOpen, setIsSignInOpen] = useState(false)
  const { user, isAdmin, signOut } = useAuth()
  const signInRef = useRef<HTMLDivElement>(null)
  const mobileMenuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('/api/data')
        if (!res.ok) throw new Error('Failed to fetch')
        const data = await res.json()
        setHeaderData(data.HeaderData)
      } catch (error) {
        console.error('Error fetching services:', error)
      }
    }
    fetchData()
  }, [])

  const handleScroll = useCallback(() => {
    setSticky(window.scrollY >= 10)
  }, [])

  const handleClickOutside = useCallback(
    (event: MouseEvent) => {
      if (
        signInRef.current &&
        !signInRef.current.contains(event.target as Node)
      ) {
        setIsSignInOpen(false)
      }
      if (
        mobileMenuRef.current &&
        !mobileMenuRef.current.contains(event.target as Node) &&
        navbarOpen
      ) {
        setNavbarOpen(false)
      }
    },
    [navbarOpen]
  )

  useEffect(() => {
    window.addEventListener('scroll', handleScroll)
    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      window.removeEventListener('scroll', handleScroll)
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [handleClickOutside, handleScroll])

  useEffect(() => {
    if (isSignInOpen || navbarOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
  }, [isSignInOpen, navbarOpen])

  const handleSignOut = async () => {
    try {
      await signOut()
      toast.success('Signed out')
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Unable to sign out'
      toast.error(message)
    }
  }

  return (
    <header
      className={`fixed top-0 z-40 w-full transition-all duration-300 ${
        sticky ? ' shadow-lg bg-white py-4' : 'shadow-none py-4'
      }`}>
      <div>
        <div className='container mx-auto max-w-7xl px-4 flex items-center justify-between'>
          <Logo />
          <nav className='hidden lg:flex grow items-center gap-8 justify-start ml-14'>
            {headerData.map((item, index) => (
              <HeaderLink key={index} item={item} />
            ))}
          </nav>
          <div className='flex items-center gap-4'>
            {isAdmin && (
              <Link
                href='/admin'
                className='hidden lg:block bg-transparent text-primary border hover:bg-primary border-primary hover:text-white duration-300 px-6 py-2 rounded-lg hover:cursor-pointer'>
                Admin Panel
              </Link>
            )}
            {user ? (
              <button
                className='hidden lg:block bg-primary text-white text-base font-medium hover:bg-transparent duration-300 hover:text-primary border border-primary px-6 py-2 rounded-lg hover:cursor-pointer'
                onClick={handleSignOut}>
                Sign Out
              </button>
            ) : (
              <button
                className='hidden lg:block bg-primary text-white text-base font-medium hover:bg-transparent duration-300 hover:text-primary border border-primary px-6 py-2 rounded-lg hover:cursor-pointer'
                onClick={() => setIsSignInOpen(true)}>
                Admin Sign In
              </button>
            )}
            {isSignInOpen && (
              <div className='fixed top-0 left-0 w-full h-full bg-black/50 flex items-center justify-center z-50'>
                <div
                  ref={signInRef}
                  className='relative mx-auto w-full max-w-md overflow-hidden rounded-lg px-8 pt-14 pb-8 text-center bg-dark_grey/90 backdrop-blur-md bg-white'>
                  <button
                    onClick={() => setIsSignInOpen(false)}
                    className='absolute top-0 right-0 mr-8 mt-8 dark:invert'
                    aria-label='Close Sign In Modal'>
                    <Icon
                      icon='material-symbols:close-rounded'
                      width={24}
                      height={24}
                      className='text-black hover:text-primary inline-block hover:cursor-pointer'
                    />
                  </button>
                  <Signin
                    onSuccess={() => {
                      setIsSignInOpen(false)
                    }}
                  />
                </div>
              </div>
            )}
            <button
              onClick={() => setNavbarOpen(!navbarOpen)}
              className='block lg:hidden p-2 rounded-lg'
              aria-label='Toggle mobile menu'>
              <span className='block w-6 h-0.5 bg-black'></span>
              <span className='block w-6 h-0.5 bg-black mt-1.5'></span>
              <span className='block w-6 h-0.5 bg-black mt-1.5'></span>
            </button>
          </div>
        </div>
        {navbarOpen && (
          <div className='fixed top-0 left-0 w-full h-full bg-black/50 z-40' />
        )}
        <div
          ref={mobileMenuRef}
          className={`lg:hidden fixed top-0 right-0 h-full w-full bg-white shadow-lg transform transition-transform duration-300 max-w-xs ${
            navbarOpen ? 'translate-x-0' : 'translate-x-full'
          } z-50`}>
          <div className='flex items-center justify-between p-4'>
            <h2 className='text-lg font-bold text-midnight_text'>
              <Logo />
            </h2>
            {/*  */}
            <button
              onClick={() => setNavbarOpen(false)}
              className='bg-black/30 rounded-full p-1 text-white'
              aria-label='Close menu Modal'>
              <Icon
                icon={'material-symbols:close-rounded'}
                width={24}
                height={24}
              />
            </button>
          </div>
          <nav className='flex flex-col items-start p-4'>
            {headerData.map((item, index) => (
              <MobileHeaderLink key={index} item={item} />
            ))}
            {isAdmin && (
              <Link
                href='/admin'
                className='text-primary font-semibold mt-4'
                onClick={() => setNavbarOpen(false)}>
                Admin Panel
              </Link>
            )}
            <div className='mt-4 flex flex-col gap-4 w-full'>
              <button
                className='bg-primary text-white px-4 py-2 rounded-lg border  border-primary hover:text-primary hover:bg-transparent hover:cursor-pointer transition duration-300 ease-in-out'
                onClick={() => {
                  if (user) {
                    handleSignOut()
                  } else {
                    setIsSignInOpen(true)
                  }
                  setNavbarOpen(false)
                }}>
                {user ? 'Sign Out' : 'Admin Sign In'}
              </button>
            </div>
          </nav>
        </div>
      </div>
    </header>
  )
}

export default Header
