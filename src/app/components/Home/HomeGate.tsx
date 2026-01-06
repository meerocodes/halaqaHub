'use client'

import ClassSchedule from '@/app/components/Home/Courses'
import EventCalendar from '@/app/components/Home/Calendar'
import SlidesSection from '@/app/components/Home/Mentor'
import QASession from '@/app/components/Home/Testimonial'
import LandingExperience from '@/app/components/Home/Landing'
import { useAuth } from '@/contexts/AuthContext'

const HomeGate = () => {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <section className='container py-24 text-center'>
        <p className='text-gray-500 text-lg'>Loading your experience…</p>
      </section>
    )
  }

  if (!user) {
    return <LandingExperience />
  }

  return (
    <>
      <ClassSchedule />
      <EventCalendar />
      <SlidesSection />
      <QASession />
    </>
  )
}

export default HomeGate
