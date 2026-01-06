import { useState, useEffect } from 'react';
import { FileText, ExternalLink, Calendar } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Database } from '../lib/database.types';

type Slide = Database['public']['Tables']['slides']['Row'] & {
  classes?: { title: string } | null;
};

export function SlidesSection() {
  const [slides, setSlides] = useState<Slide[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSlides();
  }, []);

  const loadSlides = async () => {
    const { data, error } = await supabase
      .from('slides')
      .select('*, classes(title)')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setSlides(data as Slide[]);
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  return (
    <section className="mb-8 sm:mb-12">
      <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
        <FileText className="text-emerald-600" size={24} />
        <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800">Class Materials</h2>
      </div>

      {slides.length === 0 ? (
        <div className="text-center py-8 sm:py-12 bg-gray-50 rounded-xl">
          <FileText size={40} className="sm:w-12 sm:h-12 mx-auto text-gray-400 mb-3" />
          <p className="text-sm sm:text-base text-gray-600 px-4">No slides or materials available yet</p>
        </div>
      ) : (
        <div className="grid gap-3 sm:gap-4 md:grid-cols-2 lg:grid-cols-3">
          {slides.map((slide) => (
            <a
              key={slide.id}
              href={slide.url || '#'}
              target={slide.url ? "_blank" : undefined}
              rel={slide.url ? "noopener noreferrer" : undefined}
              className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all p-4 sm:p-6 border-2 border-gray-200 hover:border-emerald-400 group"
              onClick={(e) => {
                if (!slide.url) {
                  e.preventDefault();
                }
              }}
            >
              <div className="flex items-start justify-between mb-3">
                <FileText className="text-emerald-600 group-hover:scale-110 transition-transform" size={28} />
                <ExternalLink className="text-gray-400 group-hover:text-emerald-600 transition-colors" size={18} />
              </div>

              <h3 className="text-base sm:text-lg font-bold text-gray-800 mb-2 group-hover:text-emerald-600 transition-colors">
                {slide.title || 'Coming soon...'}
              </h3>

              {slide.classes && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Calendar size={14} />
                  <span>{slide.classes.title}</span>
                </div>
              )}

              <div className="mt-4 text-sm text-gray-500">
                Added {new Date(slide.created_at).toLocaleDateString()}
              </div>
            </a>
          ))}
        </div>
      )}
    </section>
  );
}
