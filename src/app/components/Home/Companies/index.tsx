'use client'

import { type ReactNode, useEffect, useMemo, useState } from 'react'
import { CalendarDays, Clock, FileText } from 'lucide-react'
import { supabase } from '@/lib/supabaseClient'

type StatCard = {
  label: string
  value: string
  description: string
  icon: ReactNode
}

const Companies = () => {
  const [upcomingCount, setUpcomingCount] = useState<number | null>(null)
  const [todayCount, setTodayCount] = useState<number | null>(null)
  const [slidesCount, setSlidesCount] = useState<number | null>(null)

  useEffect(() => {
    const loadStats = async () => {
      const now = new Date()
      const startOfToday = new Date(now)
      startOfToday.setHours(0, 0, 0, 0)
      const endOfToday = new Date(startOfToday)
      endOfToday.setDate(endOfToday.getDate() + 1)

      const [{ count: upcoming }, { count: today }, { count: slides }] =
        await Promise.all([
          supabase
            .from('classes')
            .select('*', { count: 'exact', head: true })
            .gte('class_date', now.toISOString()),
          supabase
            .from('classes')
            .select('*', { count: 'exact', head: true })
            .gte('class_date', startOfToday.toISOString())
            .lt('class_date', endOfToday.toISOString()),
          supabase
            .from('slides')
            .select('*', { count: 'exact', head: true }),
        ])

      setUpcomingCount(upcoming ?? 0)
      setTodayCount(today ?? 0)
      setSlidesCount(slides ?? 0)
    }

    loadStats()
  }, [])

  const statCards = useMemo<StatCard[]>(
    () => [
      {
        label: 'Upcoming Sessions',
        value:
          upcomingCount === null ? '—' : upcomingCount === 0 ? 'No classes' : `${upcomingCount}`,
        description:
          upcomingCount === null
            ? 'Fetching live schedule'
            : upcomingCount === 0
              ? 'Check back tonight for the next halaqa'
              : 'Classes scheduled in the next few days',
        icon: <CalendarDays className='w-6 h-6 text-primary' />,
      },
      {
        label: "Today's Halaqat",
        value: todayCount === null ? '—' : todayCount.toString(),
        description:
          todayCount && todayCount > 0
            ? 'Live tonight at the masjid'
            : 'No sessions scheduled for today',
        icon: <Clock className='w-6 h-6 text-primary' />,
      },
      {
        label: 'Shared Resources',
        value: slidesCount === null ? '—' : slidesCount.toString(),
        description: 'Slides, notes, and links published by instructors',
        icon: <FileText className='w-6 h-6 text-primary' />,
      },
    ],
    [todayCount, upcomingCount, slidesCount]
  )

  return (
    <section>
      <div className='container'>
        <div className='text-center mb-10'>
          <h2 className='text-lg text-black/60 uppercase tracking-[0.24em]'>
            Live community snapshot
          </h2>
          <p className='text-2xl font-semibold mt-2 text-black'>
            Everything you need before you head to class
          </p>
        </div>
        <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-3'>
          {statCards.map((card) => (
            <div
              key={card.label}
              className='bg-white border border-gray-200 rounded-2xl p-6 flex items-start gap-4 shadow-sm'
            >
              <div className='bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center'>
                {card.icon}
              </div>
              <div>
                <p className='text-sm uppercase tracking-widest text-gray-500'>
                  {card.label}
                </p>
                <p className='text-3xl font-bold text-black mt-1'>{card.value}</p>
                <p className='text-sm text-gray-500 mt-1'>{card.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default Companies
