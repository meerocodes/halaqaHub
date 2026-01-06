import { useState, useEffect } from 'react';
import { Calendar, ChevronLeft, ChevronRight, ChevronDown, ChevronUp, Clock, MapPin } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Database } from '../lib/database.types';
import { ClassDetailsModal } from './ClassDetailsModal';

type Class = Database['public']['Tables']['classes']['Row'];

interface CalendarDay {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  classes: Class[];
}

export function ClassCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [classes, setClasses] = useState<Class[]>([]);
  const [selectedDay, setSelectedDay] = useState<CalendarDay | null>(null);
  const [loading, setLoading] = useState(true);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    loadClasses();
  }, []);

  const loadClasses = async () => {
    const { data, error } = await supabase
      .from('classes')
      .select('*')
      .order('class_date', { ascending: true });

    if (!error && data) {
      setClasses(data);
    }
    setLoading(false);
  };

  const getCalendarDays = (): CalendarDay[] => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());

    const days: CalendarDay[] = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 0; i < 42; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);

      const dateYear = date.getFullYear();
      const dateMonth = date.getMonth() + 1;
      const dateDay = date.getDate();
      const dateStr = `${dateYear}-${String(dateMonth).padStart(2, '0')}-${String(dateDay).padStart(2, '0')}`;

      const dayClasses = classes.filter(cls => {
        const classDate = new Date(cls.class_date);
        const classDateStr = `${classDate.getFullYear()}-${String(classDate.getMonth() + 1).padStart(2, '0')}-${String(classDate.getDate()).padStart(2, '0')}`;
        return classDateStr === dateStr;
      });

      days.push({
        date: new Date(date),
        isCurrentMonth: date.getMonth() === month,
        isToday: date.getTime() === today.getTime(),
        classes: dayClasses,
      });
    }

    return days;
  };

  const changeMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(newDate.getMonth() + (direction === 'next' ? 1 : -1));
      return newDate;
    });
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const getColorForClass = (index: number) => {
    const colors = [
      'bg-emerald-500',
      'bg-teal-500',
      'bg-cyan-500',
      'bg-blue-500',
      'bg-sky-500',
    ];
    return colors[index % colors.length];
  };

  const getUpcomingClasses = () => {
    const now = new Date();
    return classes
      .filter(cls => new Date(cls.class_date) >= now)
      .sort((a, b) => new Date(a.class_date).getTime() - new Date(b.class_date).getTime())
      .slice(0, 5);
  };

  const formatClassTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  const formatClassDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  };

  const handleClassClick = (classItem: Class) => {
    const classDate = new Date(classItem.class_date);
    const calendarDay: CalendarDay = {
      date: classDate,
      isCurrentMonth: classDate.getMonth() === currentDate.getMonth(),
      isToday: classDate.toDateString() === new Date().toDateString(),
      classes: [classItem],
    };
    setSelectedDay(calendarDay);
  };

  const calendarDays = getCalendarDays();
  const monthYear = currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const upcomingClasses = getUpcomingClasses();

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  return (
    <section className="mb-8 sm:mb-12">
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <div className="flex items-center gap-2 sm:gap-3">
          <Calendar className="text-emerald-600" size={24} />
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800">Class Schedule</h2>
        </div>
        <div className="flex gap-2">
          <button
            onClick={goToToday}
            className="bg-emerald-600 text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg hover:bg-emerald-700 transition-colors font-medium text-xs sm:text-sm"
          >
            Today
          </button>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="bg-gray-200 text-gray-700 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg hover:bg-gray-300 transition-colors font-medium text-xs sm:text-sm flex items-center gap-1"
          >
            {isExpanded ? (
              <>
                <ChevronUp size={16} />
                <span className="hidden sm:inline">Collapse</span>
              </>
            ) : (
              <>
                <ChevronDown size={16} />
                <span className="hidden sm:inline">Expand</span>
              </>
            )}
          </button>
        </div>
      </div>

      {!isExpanded ? (
        <div className="bg-white rounded-xl shadow-lg overflow-hidden border-2 border-gray-200">
          <div className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white p-4 sm:p-6">
            <h3 className="text-lg sm:text-xl md:text-2xl font-bold">Upcoming Classes</h3>
          </div>

          <div className="p-4 sm:p-6">
            {upcomingClasses.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <Calendar className="mx-auto mb-4 text-gray-400" size={48} />
                <p className="text-lg font-medium">No upcoming classes scheduled</p>
                <p className="text-sm mt-2">Check back soon for new classes!</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {upcomingClasses.map((classItem, index) => (
                  <button
                    key={classItem.id}
                    onClick={() => handleClassClick(classItem)}
                    className="w-full text-left bg-gradient-to-r from-emerald-50 to-teal-50 hover:from-emerald-100 hover:to-teal-100 border-2 border-emerald-200 rounded-xl p-4 sm:p-6 transition-all hover:shadow-lg hover:scale-[1.02]"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className={`w-3 h-3 rounded-full ${getColorForClass(index)}`}></span>
                          <span className="text-xs font-semibold text-emerald-700 uppercase tracking-wide">
                            {formatClassDate(classItem.class_date)}
                          </span>
                        </div>
                        <h4 className="text-lg sm:text-xl font-bold text-gray-800 mb-1">
                          {classItem.title}
                        </h4>
                        {classItem.subtitle && (
                          <p className="text-sm sm:text-base text-gray-600 mb-2">{classItem.subtitle}</p>
                        )}
                        <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <Clock size={16} className="text-emerald-600" />
                            <span>{formatClassTime(classItem.class_date)}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <MapPin size={16} className="text-emerald-600" />
                            <span>{classItem.location}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-lg overflow-hidden border-2 border-gray-200">
          <div className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <button
                onClick={() => changeMonth('prev')}
                className="p-1.5 sm:p-2 hover:bg-white/20 rounded-lg transition-colors"
              >
                <ChevronLeft size={20} className="sm:w-6 sm:h-6" />
              </button>
              <h3 className="text-lg sm:text-xl md:text-2xl font-bold">{monthYear}</h3>
              <button
                onClick={() => changeMonth('next')}
                className="p-1.5 sm:p-2 hover:bg-white/20 rounded-lg transition-colors"
              >
                <ChevronRight size={20} className="sm:w-6 sm:h-6" />
              </button>
            </div>
          </div>

          <div className="p-3 sm:p-6">
          <div className="grid grid-cols-7 gap-1 sm:gap-2 mb-2">
            {weekDays.map(day => (
              <div key={day} className="text-center font-bold text-gray-700 py-1 sm:py-2 text-xs sm:text-sm">
                <span className="hidden sm:inline">{day}</span>
                <span className="sm:hidden">{day.charAt(0)}</span>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1 sm:gap-2">
            {calendarDays.map((day, index) => {
              const hasClasses = day.classes.length > 0;
              const isClickable = hasClasses;

              return (
                <button
                  key={index}
                  onClick={() => isClickable && setSelectedDay(day)}
                  disabled={!isClickable}
                  className={`
                    aspect-square p-2 sm:p-3 rounded-xl border-2 transition-all relative
                    ${!day.isCurrentMonth ? 'bg-gray-50 text-gray-400 border-gray-100' : 'border-gray-200'}
                    ${day.isToday ? 'ring-2 sm:ring-3 ring-emerald-500 ring-offset-2' : ''}
                    ${isClickable ? 'cursor-pointer hover:shadow-xl hover:scale-105 border-emerald-400 bg-emerald-50' : ''}
                    ${!isClickable && day.isCurrentMonth ? 'bg-white text-gray-800' : ''}
                  `}
                >
                  <div className="flex flex-col h-full">
                    <span className={`text-xs sm:text-sm font-bold ${day.isToday ? 'text-emerald-600' : hasClasses ? 'text-emerald-700' : ''}`}>
                      {day.date.getDate()}
                    </span>

                    {hasClasses && (
                      <div className="flex-1 flex flex-col justify-center gap-1 mt-1">
                        {day.classes.slice(0, 3).map((cls, idx) => (
                          <div
                            key={cls.id}
                            className={`h-2 sm:h-2.5 rounded-full ${getColorForClass(idx)} shadow-sm`}
                            title={cls.title}
                          />
                        ))}
                        {day.classes.length > 3 && (
                          <span className="text-xs text-emerald-700 font-bold mt-0.5">
                            +{day.classes.length - 3}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {classes.length === 0 && (
            <div className="text-center py-6 text-gray-500">
              <p>No classes scheduled yet. Check back soon!</p>
            </div>
          )}
          </div>

          <div className="bg-gray-50 px-6 py-4 border-t">
            <div className="flex items-center justify-center gap-6 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-emerald-500"></div>
                <span className="text-gray-700">Class scheduled</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full border-2 border-emerald-500"></div>
                <span className="text-gray-700">Today</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {selectedDay && (
        <ClassDetailsModal
          day={selectedDay}
          onClose={() => setSelectedDay(null)}
          onUpdate={loadClasses}
        />
      )}
    </section>
  );
}
