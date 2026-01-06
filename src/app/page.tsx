import React from 'react'
import Hero from '@/app/components/Home/Hero'
import Companies from '@/app/components/Home/Companies'
import ClassSchedule from '@/app/components/Home/Courses'
import SlidesSection from '@/app/components/Home/Mentor'
import QASession from '@/app/components/Home/Testimonial'
import Newsletter from '@/app/components/Home/Newsletter'
import { Metadata } from 'next'
import ContactForm from './components/Contact/Form'
export const metadata: Metadata = {
  title: 'Si Educational',
}

export default function Home() {
  return (
    <main>
      <Hero />
      <Companies />
      <ClassSchedule />
      <SlidesSection />
      <QASession />
      <ContactForm />
      <Newsletter />
    </main>
  )
}
