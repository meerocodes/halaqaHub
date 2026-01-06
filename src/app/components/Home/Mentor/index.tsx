'use client'

import { useEffect, useState } from 'react'
import { FileText, Link2 } from 'lucide-react'
import { supabase } from '@/lib/supabaseClient'
import type { Database } from '@/types/database.types'

type SlideRow = Database['public']['Tables']['slides']['Row'] & {
  classes?: { title: string } | null
}

const SlidesSection = () => {
  const [slides, setSlides] = useState<SlideRow[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadSlides = async () => {
      const { data } = await supabase
        .from('slides')
        .select('*, classes(title)')
        .order('created_at', { ascending: false })
        .limit(6)
      setSlides((data as SlideRow[]) ?? [])
      setLoading(false)
    }

    loadSlides()
  }, [])

  return (
    <section id='resources-section'>
      <div className='container'>
        <div className='flex flex-col sm:flex-row gap-5 justify-between sm:items-center mb-12'>
          <div>
            <p className='text-sm uppercase tracking-[0.3em] text-primary'>
              Class materials
            </p>
            <h2 className='font-bold tracking-tight'>
              Slides, notes, and shared resources
            </h2>
            <p className='text-base text-gray-500 mt-2'>
              Catch up on what you missed or review tonight&apos;s session.
            </p>
          </div>
        </div>

        {loading ? (
          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'>
            {Array.from({ length: 3 }).map((_, idx) => (
              <div
                key={idx}
                className='bg-white rounded-3xl border border-gray-100 h-48 animate-pulse'
              />
            ))}
          </div>
        ) : slides.length === 0 ? (
          <div className='rounded-3xl border border-dashed border-gray-200 p-8 text-center text-gray-500'>
            Materials will appear here as soon as an instructor uploads them.
          </div>
        ) : (
          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'>
            {slides.map((slide) => (
              <a
                key={slide.id}
                href={slide.url || '#'}
                target={slide.url ? '_blank' : undefined}
                rel={slide.url ? 'noreferrer' : undefined}
                className='bg-white rounded-3xl border border-gray-100 p-6 shadow-sm hover:border-primary hover:-translate-y-1 transition duration-200 flex flex-col justify-between gap-4'
              >
                <div className='flex items-center gap-3'>
                  <span className='bg-primary/10 text-primary rounded-full p-3'>
                    <FileText className='w-5 h-5' />
                  </span>
                  <div>
                    <p className='text-xs uppercase tracking-[0.3em] text-gray-500'>
                      {slide.classes?.title ?? 'General'}
                    </p>
                    <p className='text-lg font-semibold text-black'>
                      {slide.title}
                    </p>
                  </div>
                </div>
                <div className='flex items-center justify-between text-sm text-gray-500'>
                  <p>
                    {new Date(slide.created_at).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                    })}
                  </p>
                  <span className='inline-flex items-center gap-1 text-primary font-semibold'>
                    <Link2 className='w-4 h-4' />
                    Open
                  </span>
                </div>
              </a>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

export default SlidesSection
