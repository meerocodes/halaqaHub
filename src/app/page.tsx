import React from 'react'
import ClassSchedule from '@/app/components/Home/Courses'
import SlidesSection from '@/app/components/Home/Mentor'
import QASession from '@/app/components/Home/Testimonial'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Halaqa Hub',
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
