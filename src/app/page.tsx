import React from 'react'
import ClassSchedule from '@/app/components/Home/Courses'
import SlidesSection from '@/app/components/Home/Mentor'
import QASession from '@/app/components/Home/Testimonial'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Halaqa Hub - Live Classes & Community Knowledge',
  description: 'Join daily halaqat, follow along with slides, and ask questions in real time. Connect with our community through knowledge and spiritual growth.',
  openGraph: {
    title: 'Halaqa Hub - Live Classes & Community Knowledge',
    description: 'Join daily halaqat, follow along with slides, and ask questions in real time.',
    images: [
      {
        url: 'https://halaqahub.com/social-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Halaqa Hub - Community Learning Platform',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Halaqa Hub - Live Classes & Community Knowledge',
    description: 'Join daily halaqat, follow along with slides, and ask questions in real time.',
    images: ['https://halaqahub.com/social-image.jpg'],
  },
}

export default function Home() {
  return (
    <main>
      <ClassSchedule />
      <SlidesSection />
      <QASession />
    </main>
  )
}
