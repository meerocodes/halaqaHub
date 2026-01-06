'use client'

import { useEffect, useMemo, useState } from 'react'
import { CalendarDays, Clock4, MapPin, NotebookText } from 'lucide-react'
import { supabase } from '@/lib/supabaseClient'
import type { Database } from '@/types/database.types'
import ClassDetailsModal from '../ClassDetailsModal'

type ClassRow = Database['public']['Tables']['classes']['Row']

const ClassSchedule = () => {
  const [classes, setClasses] = useState<ClassRow[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedClass, setSelectedClass] = useState<ClassRow | null>(null)

  useEffect(() => {
    const loadClasses = async () => {
      setLoading(true)
      const { data } = await supabase
        .from('classes')
        .select('*')
        .order('class_date', { ascending: true })
      setClasses(data ?? [])
      setLoading(false)
    }

    loadClasses()
  }, [])

  const upcomingClasses = useMemo(() => {
    const now = new Date()
    return classes
      .filter((cls) => new Date(cls.class_date) >= now)
      .slice(0, 6)
  }, [classes])

  const todayClasses = useMemo(() => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)
    return classes.filter((cls) => {
      const classDate = new Date(cls.class_date)
      return classDate >= today && classDate < tomorrow
    })
  }, [classes])

  const nextClass = upcomingClasses[0]

  return (
    <section id='classes-section'>
      <div className='container'>
        <div className='flex flex-col sm:flex-row justify-between sm:items-center gap-3 mb-8'>
          <div>
            <p className='text-sm uppercase tracking-[0.3em] text-primary'>
              Tonight&apos;s programming
            </p>
            <h2 className='font-bold tracking-tight'>
              Class schedule & community meetup
            </h2>
            <p className='text-base text-gray-500 mt-2'>
              {todayClasses.length > 0
                ? 'Use the list to see where and when we are meeting, then tap into the details for RSVPs and slides.'
                : 'There are no classes today. Browse the upcoming halaqat and tap for more details.'}
            </p>
          </div>
          {nextClass && (
            <button
              onClick={() => setSelectedClass(nextClass)}
              className='bg-primary text-white font-medium px-6 py-3 rounded-full border border-primary hover:bg-transparent hover:text-primary transition duration-300'
            >
              View next class
            </button>
          )}
        </div>

        <div className='grid gap-6 lg:grid-cols-[2fr,1fr]'>
          <div className='bg-white border border-gray-100 rounded-3xl p-6 shadow-sm'>
            <div className='flex items-center gap-3 mb-6'>
              <CalendarDays className='text-primary w-6 h-6' />
              <div>
                <p className='text-sm uppercase tracking-[0.3em] text-gray-500'>
                  Upcoming
                </p>
                <p className='text-lg font-semibold text-black'>
                  {upcomingClasses.length === 0
                    ? 'No classes scheduled yet'
                    : 'Next halaqat'}
                </p>
              </div>
            </div>

            {loading ? (
              <div className='animate-pulse space-y-4'>
                {Array.from({ length: 3 }).map((_, idx) => (
                  <div
                    key={idx}
                    className='h-24 bg-gray-100 rounded-2xl'
                  ></div>
                ))}
              </div>
            ) : upcomingClasses.length === 0 ? (
              <div className='rounded-2xl border border-dashed border-gray-200 p-6 text-center text-gray-500'>
                No future classes have been published. Check again later today.
              </div>
            ) : (
              <div className='space-y-4'>
                {upcomingClasses.map((classItem) => {
                  const classDate = new Date(classItem.class_date)
                  return (
                    <button
                      key={classItem.id}
                      onClick={() => setSelectedClass(classItem)}
                      className='w-full text-left border border-gray-200 rounded-2xl p-5 hover:border-primary transition duration-200 flex flex-col sm:flex-row sm:items-center gap-4'
                    >
                      <div className='sm:w-44'>
                        <p className='text-sm text-gray-500'>
                          {classDate.toLocaleDateString('en-US', {
                            weekday: 'short',
                            month: 'short',
                            day: 'numeric',
                          })}
                        </p>
                        <p className='text-base font-semibold text-black flex items-center gap-1'>
                          <Clock4 className='w-4 h-4 text-primary' />
                          {classDate.toLocaleTimeString('en-US', {
                            hour: 'numeric',
                            minute: '2-digit',
                          })}
                        </p>
                      </div>
                      <div className='flex-1 space-y-2'>
                        <p className='text-lg font-semibold text-black'>
                          {classItem.title}
                        </p>
                        {classItem.subtitle && (
                          <p className='text-sm text-gray-500'>
                            {classItem.subtitle}
                          </p>
                        )}
                        <p className='text-sm text-gray-500 flex items-center gap-2'>
                          <MapPin className='w-4 h-4 text-primary/70' />
                          {classItem.location}
                        </p>
                      </div>
                      <div className='shrink-0'>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            classItem.qa_open
                              ? 'bg-primary/10 text-primary'
                              : 'bg-gray-100 text-gray-500'
                          }`}
                        >
                          {classItem.qa_open ? 'Q&A open' : 'Q&A closed'}
                        </span>
                      </div>
                    </button>
                  )
                })}
              </div>
            )}
          </div>

          <div className='bg-cream rounded-3xl p-6 border border-orange/30'>
            <div className='flex items-center gap-3 mb-4'>
              <NotebookText className='text-primary w-6 h-6' />
              <div>
                <p className='text-sm uppercase tracking-[0.3em] text-gray-500'>
                  Today at a glance
                </p>
                <p className='text-lg font-semibold text-black'>
                  {todayClasses.length > 0
                    ? `${todayClasses.length} sessions`
                    : 'No sessions today'}
                </p>
              </div>
            </div>
            {todayClasses.length === 0 ? (
              <p className='text-gray-500 text-sm'>
                We&apos;ll post the next halaqa in this space. In the meantime,
                browse the upcoming schedule or revisit slide decks below.
              </p>
            ) : (
              <ul className='space-y-3'>
                {todayClasses.map((classItem) => (
                  <li
                    key={classItem.id}
                    className='bg-white rounded-2xl p-4 border border-white hover:border-primary/40 transition'
                  >
                    <div className='flex items-center justify-between'>
                      <div>
                        <p className='text-sm text-gray-500'>
                          {new Date(classItem.class_date).toLocaleTimeString(
                            'en-US',
                            {
                              hour: 'numeric',
                              minute: '2-digit',
                            }
                          )}
                        </p>
                        <p className='text-base font-semibold'>
                          {classItem.title}
                        </p>
                      </div>
                      <button
                        onClick={() => setSelectedClass(classItem)}
                        className='text-sm text-primary font-semibold'
                      >
                        Details
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>

      {selectedClass && (
        <ClassDetailsModal
          classItem={selectedClass}
          onClose={() => setSelectedClass(null)}
        />
      )}
    </section>
  )
}

export default ClassSchedule
