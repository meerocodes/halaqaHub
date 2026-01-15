'use client'

import { useEffect, useState, useMemo } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { supabase } from '@/lib/supabaseClient'
import type { Database } from '@/types/database.types'

type ClassRow = Database['public']['Tables']['classes']['Row']

const EventCalendar = () => {
  const [classes, setClasses] = useState<ClassRow[]>([])
  const [loading, setLoading] = useState(true)
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)

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

  const daysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
  }

  const firstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay()
  }

  const classesOnDate = (day: number) => {
    const dateStr = new Date(currentDate.getFullYear(), currentDate.getMonth(), day)
      .toISOString()
      .split('T')[0]
    return classes.filter((cls) => cls.class_date.split('T')[0] === dateStr)
  }

  const monthYear = currentDate.toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  })

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))
  }

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))
  }

  const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  const days = []

  for (let i = 0; i < firstDayOfMonth(currentDate); i++) {
    days.push(null)
  }

  for (let i = 1; i <= daysInMonth(currentDate); i++) {
    days.push(i)
  }

  const classesForSelectedDate = selectedDate
    ? classes.filter(
        (cls) => cls.class_date.split('T')[0] === selectedDate.toISOString().split('T')[0]
      )
    : []

  return (
    <section id='calendar-section' className='py-16 md:py-20'>
      <div className='container'>
        <div className='mb-8'>
          <p className='text-sm uppercase tracking-[0.3em] text-primary'>
            Upcoming Events
          </p>
          <h2 className='font-bold tracking-tight mb-2'>
            Event Calendar
          </h2>
          <p className='text-base text-gray-500'>
            Browse our halaqat schedule by month. Click on any date to see the events scheduled.
          </p>
        </div>

        <div className='grid gap-6 lg:grid-cols-3'>
          <div className='lg:col-span-2 bg-white border border-gray-100 rounded-3xl p-6 shadow-sm'>
            <div className='flex items-center justify-between mb-6'>
              <h3 className='text-lg font-semibold text-black'>{monthYear}</h3>
              <div className='flex gap-2'>
                <button
                  onClick={previousMonth}
                  className='p-2 hover:bg-gray-100 rounded-lg transition'
                  aria-label='Previous month'
                >
                  <ChevronLeft className='w-5 h-5 text-gray-600' />
                </button>
                <button
                  onClick={nextMonth}
                  className='p-2 hover:bg-gray-100 rounded-lg transition'
                  aria-label='Next month'
                >
                  <ChevronRight className='w-5 h-5 text-gray-600' />
                </button>
              </div>
            </div>

            {loading ? (
              <div className='animate-pulse space-y-4'>
                {Array.from({ length: 6 }).map((_, idx) => (
                  <div key={idx} className='h-16 bg-gray-100 rounded-lg'></div>
                ))}
              </div>
            ) : (
              <>
                <div className='grid grid-cols-7 gap-2 mb-4'>
                  {dayLabels.map((day) => (
                    <div
                      key={day}
                      className='h-10 flex items-center justify-center text-sm font-semibold text-gray-600'
                    >
                      {day}
                    </div>
                  ))}
                </div>

                <div className='grid grid-cols-7 gap-2'>
                  {days.map((day, idx) => {
                    const classesOnThisDay = day ? classesOnDate(day) : []
                    const isToday =
                      day &&
                      new Date(currentDate.getFullYear(), currentDate.getMonth(), day).toDateString() ===
                        new Date().toDateString()
                    const isSelected =
                      day &&
                      selectedDate?.toDateString() ===
                        new Date(currentDate.getFullYear(), currentDate.getMonth(), day).toDateString()

                    return (
                      <div
                        key={idx}
                        onClick={() => {
                          if (day) {
                            setSelectedDate(
                              new Date(currentDate.getFullYear(), currentDate.getMonth(), day)
                            )
                          }
                        }}
                        className={`aspect-square rounded-lg border flex flex-col items-center justify-center text-sm font-medium cursor-pointer transition ${
                          !day
                            ? 'bg-transparent border-transparent'
                            : isSelected
                              ? 'bg-primary text-white border-primary'
                              : isToday
                                ? 'bg-primary/10 border-primary text-black'
                                : classesOnThisDay.length > 0
                                  ? 'bg-gray-50 border-primary/30 text-black hover:bg-gray-100'
                                  : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                        }`}
                      >
                        {day && (
                          <>
                            <div>{day}</div>
                            {classesOnThisDay.length > 0 && (
                              <div className={`text-xs mt-1 font-semibold ${
                                isSelected ? 'text-white' : 'text-primary'
                              }`}>
                                {classesOnThisDay.length} event{classesOnThisDay.length > 1 ? 's' : ''}
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    )
                  })}
                </div>
              </>
            )}
          </div>

          <div className='bg-white border border-gray-100 rounded-3xl p-6 shadow-sm'>
            <h3 className='text-lg font-semibold text-black mb-4'>
              {selectedDate
                ? selectedDate.toLocaleDateString('en-US', {
                    weekday: 'long',
                    month: 'short',
                    day: 'numeric',
                  })
                : 'Select a date'}
            </h3>

            {selectedDate ? (
              classesForSelectedDate.length > 0 ? (
                <div className='space-y-3'>
                  {classesForSelectedDate.map((cls) => {
                    const classDate = new Date(cls.class_date)
                    return (
                      <div
                        key={cls.id}
                        className='border border-gray-200 rounded-lg p-4 hover:border-primary transition'
                      >
                        <p className='text-sm font-semibold text-primary mb-1'>
                          {classDate.toLocaleTimeString('en-US', {
                            hour: 'numeric',
                            minute: '2-digit',
                            hour12: true,
                          })}
                        </p>
                        <p className='text-sm font-semibold text-black mb-2'>{cls.title}</p>
                        {cls.subtitle && (
                          <p className='text-xs text-gray-600 mb-2'>{cls.subtitle}</p>
                        )}
                        {cls.location && (
                          <p className='text-xs text-gray-500'>📍 {cls.location}</p>
                        )}
                      </div>
                    )
                  })}
                </div>
              ) : (
                <p className='text-sm text-gray-500 text-center py-8'>
                  No events scheduled for this date.
                </p>
              )
            ) : (
              <p className='text-sm text-gray-500 text-center py-8'>
                Click on a date to see events.
              </p>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}

export default EventCalendar
