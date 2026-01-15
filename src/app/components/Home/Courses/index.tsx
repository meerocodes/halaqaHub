'use client'

import { useEffect, useMemo, useState } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { CalendarDays, ChevronDown, ChevronUp, Clock4, MapPin } from 'lucide-react'
import { supabase } from '@/lib/supabaseClient'
import type { Database } from '@/types/database.types'
import ClassDetailsModal from '../ClassDetailsModal'

type ClassRow = Database['public']['Tables']['classes']['Row']

const ClassSchedule = () => {
  const [classes, setClasses] = useState<ClassRow[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedClass, setSelectedClass] = useState<ClassRow | null>(null)
  const [showUpcomingExpanded, setShowUpcomingExpanded] = useState(false)
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

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

  useEffect(() => {
    const classId = searchParams.get('class')
    if (!classId) {
      if (selectedClass) {
        setSelectedClass(null)
      }
      return
    }

    if (selectedClass?.id && String(selectedClass.id) === classId) {
      return
    }

    const match = classes.find((cls) => String(cls.id) === classId)
    if (match) {
      setSelectedClass(match)
    }
  }, [classes, searchParams, selectedClass])

  const updateUrlForClass = (classId?: string | null) => {
    const params = new URLSearchParams(searchParams.toString())
    if (classId) {
      params.set('class', classId)
    } else {
      params.delete('class')
    }
    const query = params.toString()
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false })
  }

  const openClassDetails = (classItem: ClassRow) => {
    setSelectedClass(classItem)
    updateUrlForClass(String(classItem.id))
  }

  const upcomingClasses = useMemo(() => {
    const now = new Date()
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    return classes
      .filter((cls) => new Date(cls.class_date) >= startOfToday)
      .slice(0, 3)
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
              onClick={() => openClassDetails(nextClass)}
              className='bg-primary text-white font-medium px-6 py-3 rounded-full border border-primary hover:bg-transparent hover:text-primary transition duration-300'
            >
              View next class
            </button>
          )}
        </div>

        <div className='grid gap-6'>
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
            <div className='flex items-center justify-between gap-3 mb-4'>
              <button
                type='button'
                onClick={() => setShowUpcomingExpanded((prev) => !prev)}
                className='inline-flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-primary transition'
                aria-expanded={showUpcomingExpanded}
              >
                {showUpcomingExpanded ? 'Show fewer' : 'Show more'}
                <span className='inline-flex items-center justify-center w-8 h-8 rounded-full border border-gray-200 bg-white shadow-sm'>
                  {showUpcomingExpanded ? (
                    <ChevronUp className='w-4 h-4 text-gray-700' />
                  ) : (
                    <ChevronDown className='w-4 h-4 text-gray-700' />
                  )}
                </span>
              </button>
              <a
                href='#calendar-section'
                className='text-sm font-semibold text-primary hover:underline'
              >
                View full schedule
              </a>
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
                {upcomingClasses
                  .slice(0, showUpcomingExpanded ? 3 : 1)
                  .map((classItem) => {
                  const classDate = new Date(classItem.class_date)
                  return (
                    <button
                      key={classItem.id}
                      onClick={() => openClassDetails(classItem)}
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

        </div>
      </div>

      {selectedClass && (
        <ClassDetailsModal
          classItem={selectedClass}
          onClose={() => {
            setSelectedClass(null)
            updateUrlForClass(null)
          }}
        />
      )}
    </section>
  )
}

export default ClassSchedule
