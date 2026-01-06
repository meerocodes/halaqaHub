'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Icon } from '@iconify/react/dist/iconify.js'

const navigation = [
  {
    title: 'Platform',
    links: [
      { label: 'Class schedule', href: '/' },
      { label: 'Slides & resources', href: '/' },
      { label: 'Live Q&A', href: '/' },
    ],
  },
  {
    title: 'Community',
    links: [
      { label: 'Volunteer hub', href: '/' },
      { label: 'Youth circles', href: '/' },
      { label: 'Sisters program', href: '/' },
    ],
  },
  {
    title: 'Support',
    links: [
      { label: 'Contact team', href: 'mailto:salaam@halaqahub.com' },
      { label: 'Privacy', href: '/' },
      { label: 'Platform status', href: '/' },
    ],
  },
]

const socialLinks = [
  { icon: 'tabler:brand-instagram', href: 'https://instagram.com' },
  { icon: 'tabler:brand-twitter-filled', href: 'https://twitter.com' },
  { icon: 'tabler:brand-youtube-filled', href: 'https://youtube.com' },
]

const Footer = () => {
  return (
    <footer className='bg-primary text-white'>
      <div className='container py-16'>
        <div className='grid gap-12 lg:grid-cols-12'>
          <div className='lg:col-span-5 space-y-5'>
            <Image
              src='/images/logo/logo2.svg'
              alt='Halaqa Hub Logo'
              width={56}
              height={70}
              className='h-auto w-12'
            />
            <p className='text-lg font-semibold leading-7'>
              Halaqa Hub keeps our masjid’s nightly gatherings organized,
              accessible, and heartfelt—no matter where you are.
            </p>
            <div className='flex gap-3'>
              {socialLinks.map((social) => (
                <Link
                  key={social.icon}
                  href={social.href}
                  target='_blank'
                  className='bg-white/15 border border-white/20 rounded-full p-2 hover:bg-white hover:text-primary transition'>
                  <Icon icon={social.icon} className='text-2xl inline-block' />
                </Link>
              ))}
            </div>
          </div>

          <div className='lg:col-span-4 grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-3'>
            {navigation.map((section) => (
              <div key={section.title}>
                <p className='text-sm uppercase tracking-[0.3em] text-white/60 mb-4'>
                  {section.title}
                </p>
                <ul className='space-y-3'>
                  {section.links.map((link) => (
                    <li key={link.label}>
                      <Link
                        href={link.href}
                        className='text-white/80 hover:text-white text-sm'>
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className='lg:col-span-3 space-y-5'>
            <p className='text-sm uppercase tracking-[0.3em] text-white/60'>
              Stay connected
            </p>
            <p className='text-sm text-white/80'>
              Receive the weekly halaqa digest, featured slides, and reminders for
              special sessions.
            </p>
            <form className='space-y-3'>
              <input
                type='email'
                required
                placeholder='Email address'
                className='w-full rounded-2xl bg-white/15 border border-white/20 px-4 py-3 text-sm text-white placeholder:text-white/60 focus:outline-none focus:ring-2 focus:ring-white/60'
              />
              <button
                type='submit'
                className='w-full rounded-2xl bg-white text-primary font-semibold py-3 hover:bg-white/90 transition'>
                Subscribe
              </button>
            </form>
            <div className='text-sm text-white/70'>
              <p>salaam@halaqahub.com</p>
              <p>+1 (555) 812-2185</p>
            </div>
          </div>
        </div>
      </div>
      <div className='border-t border-white/20'>
        <div className='container py-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between text-sm text-white/70'>
          <p>© {new Date().getFullYear()} Halaqa Hub. All rights reserved.</p>
          <div className='flex gap-6'>
            <Link href='/privacy' className='hover:text-white'>
              Privacy
            </Link>
            <Link href='/terms' className='hover:text-white'>
              Terms
            </Link>
            <Link href='/contact' className='hover:text-white'>
              Contact
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
