import { useState, useEffect } from 'react';
import { X, Clock, MapPin, Calendar, Users, CheckCircle, User, ThumbsUp, GraduationCap } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Database } from '../lib/database.types';

type Class = Database['public']['Tables']['classes']['Row'];
type Attendance = Database['public']['Tables']['attendance']['Row'];
type ProfessorSuggestion = Database['public']['Tables']['professor_suggestions']['Row'];

interface CalendarDay {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  classes: Class[];
}

interface ClassDetailsModalProps {
  day: CalendarDay;
  onClose: () => void;
  onUpdate: () => void;
}

export function ClassDetailsModal({ day, onClose, onUpdate }: ClassDetailsModalProps) {
  const [selectedClass, setSelectedClass] = useState<Class | null>(day.classes[0] || null);
  const [attendees, setAttendees] = useState<Attendance[]>([]);
  const [name, setName] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<ProfessorSuggestion[]>([]);
  const [profName, setProfName] = useState('');
  const [profTopic, setProfTopic] = useState('');
  const [suggestionSubmitted, setSuggestionSubmitted] = useState(false);
  const [votingLoading, setVotingLoading] = useState<string | null>(null);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  useEffect(() => {
    if (selectedClass) {
      loadAttendees(selectedClass.id);
      loadSuggestions(selectedClass.id);
    }
  }, [selectedClass]);

  const loadAttendees = async (classId: string) => {
    const { data } = await supabase
      .from('attendance')
      .select('*')
      .eq('class_id', classId)
      .order('checked_in_at', { ascending: false });

    if (data) {
      setAttendees(data);
    }
  };

  const loadSuggestions = async (classId: string) => {
    const { data } = await supabase
      .from('professor_suggestions')
      .select('*')
      .eq('class_id', classId)
      .order('votes', { ascending: false });

    if (data) {
      setSuggestions(data);
    }
  };

  const handleAttendance = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClass) return;

    setLoading(true);
    const { error } = await supabase
      .from('attendance')
      .insert({
        class_id: selectedClass.id,
        attendee_name: name,
      });

    if (!error) {
      setName('');
      setSubmitted(true);
      loadAttendees(selectedClass.id);
      onUpdate();
      setTimeout(() => setSubmitted(false), 3000);
    }
    setLoading(false);
  };

  const handleSuggestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClass) return;

    setLoading(true);
    const { error } = await supabase
      .from('professor_suggestions')
      .insert({
        class_id: selectedClass.id,
        name: profName,
        topic: profTopic,
      });

    if (!error) {
      setProfName('');
      setProfTopic('');
      setSuggestionSubmitted(true);
      loadSuggestions(selectedClass.id);
      setTimeout(() => setSuggestionSubmitted(false), 3000);
    }
    setLoading(false);
  };

  const handleVote = async (suggestionId: string, currentVotes: number) => {
    setVotingLoading(suggestionId);
    const { error } = await supabase
      .from('professor_suggestions')
      .update({ votes: currentVotes + 1 })
      .eq('id', suggestionId);

    if (!error && selectedClass) {
      loadSuggestions(selectedClass.id);
    }
    setVotingLoading(null);
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const formatFullDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const isUpcoming = (dateString: string) => {
    return new Date(dateString) >= new Date();
  };

  if (!selectedClass) return null;

  return (
    <div
      className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-2 sm:p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl sm:rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white p-4 sm:p-6 md:p-8">
          <div className="flex items-start justify-between mb-3 sm:mb-4">
            <div className="flex-1 pr-2">
              <div className="inline-block bg-white/20 px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium mb-2 sm:mb-3">
                {isUpcoming(selectedClass.class_date) ? 'Upcoming Class' : 'Past Class'}
              </div>
              <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-1 sm:mb-2">{selectedClass.title}</h2>
              {selectedClass.subtitle && (
                <p className="text-emerald-50 text-base sm:text-lg md:text-xl font-medium mb-2">{selectedClass.subtitle}</p>
              )}
              <p className="text-emerald-100 text-sm sm:text-base md:text-lg">{formatFullDate(selectedClass.class_date)}</p>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:bg-white/20 rounded-lg p-1.5 sm:p-2 transition-colors flex-shrink-0"
            >
              <X size={24} className="sm:w-7 sm:h-7" />
            </button>
          </div>

          {day.classes.length > 1 && (
            <div className="flex gap-2 mt-4 flex-wrap">
              {day.classes.map((cls) => (
                <button
                  key={cls.id}
                  onClick={() => setSelectedClass(cls)}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${
                    selectedClass.id === cls.id
                      ? 'bg-white text-emerald-600'
                      : 'bg-white/20 text-white hover:bg-white/30'
                  }`}
                >
                  {cls.title}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8">
          <div className="grid md:grid-cols-2 gap-4 sm:gap-6 md:gap-8 mb-6 sm:mb-8">
            <div>
              <h3 className="text-xl font-bold text-gray-800 mb-4">Class Details</h3>

              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="bg-emerald-100 p-2 rounded-lg">
                    <Calendar className="text-emerald-600" size={20} />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 font-medium">Date & Time</p>
                    <p className="text-gray-800 font-semibold">
                      {formatFullDate(selectedClass.class_date)}
                    </p>
                    <p className="text-gray-700">
                      {formatTime(selectedClass.class_date)}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="bg-emerald-100 p-2 rounded-lg">
                    <Clock className="text-emerald-600" size={20} />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 font-medium">Duration</p>
                    <p className="text-gray-800 font-semibold">
                      {selectedClass.duration_minutes} minutes
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="bg-emerald-100 p-2 rounded-lg">
                    <MapPin className="text-emerald-600" size={20} />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 font-medium">Location</p>
                    <p className="text-gray-800 font-semibold">
                      {selectedClass.location || 'To be announced'}
                    </p>
                  </div>
                </div>

                {selectedClass.description && (
                  <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600 font-medium mb-2">Description</p>
                    <p className="text-gray-800 leading-relaxed">
                      {selectedClass.description}
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div>
              <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Users className="text-emerald-600" size={24} />
                Attendance ({attendees.length})
              </h3>

              <form onSubmit={handleAttendance} className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mark Your Attendance
                </label>
                <div className="flex gap-3">
                  <div className="relative flex-1">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Enter your name"
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="bg-emerald-600 text-white px-6 py-3 rounded-lg hover:bg-emerald-700 transition-colors font-medium disabled:opacity-50 whitespace-nowrap"
                  >
                    {loading ? 'Submitting...' : 'Submit'}
                  </button>
                </div>
                {submitted && (
                  <div className="mt-3 flex items-center gap-2 text-emerald-600">
                    <CheckCircle size={20} />
                    <span className="font-medium">Attendance marked successfully!</span>
                  </div>
                )}
              </form>

              <div className="border-t pt-4">
                <p className="text-sm font-medium text-gray-700 mb-3">Registered Attendees</p>
                {attendees.length === 0 ? (
                  <p className="text-gray-500 text-center py-8 text-sm">
                    No attendees yet. Be the first to register!
                  </p>
                ) : (
                  <div className="space-y-2 max-h-80 overflow-y-auto">
                    {attendees.map((attendee) => (
                      <div
                        key={attendee.id}
                        className="flex items-center gap-3 bg-gray-50 px-4 py-3 rounded-lg hover:bg-gray-100 transition-colors"
                      >
                        <div className="bg-emerald-100 p-2 rounded-full">
                          <User className="text-emerald-600" size={16} />
                        </div>
                        <span className="font-medium text-gray-800">
                          {attendee.attendee_name}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="border-t pt-6 mt-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <GraduationCap className="text-emerald-600" size={24} />
              Want to be a prof?
            </h3>

            <form onSubmit={handleSuggestion} className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Suggest a class topic
              </label>
              <div className="space-y-3">
                <input
                  type="text"
                  value={profName}
                  onChange={(e) => setProfName(e.target.value)}
                  placeholder="Your name"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  required
                />
                <textarea
                  value={profTopic}
                  onChange={(e) => setProfTopic(e.target.value)}
                  placeholder="Suggested class topic"
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none"
                  required
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-emerald-600 text-white px-6 py-3 rounded-lg hover:bg-emerald-700 transition-colors font-medium disabled:opacity-50"
                >
                  {loading ? 'Submitting...' : 'Submit Suggestion'}
                </button>
              </div>
              {suggestionSubmitted && (
                <div className="mt-3 flex items-center gap-2 text-emerald-600">
                  <CheckCircle size={20} />
                  <span className="font-medium">Suggestion submitted successfully!</span>
                </div>
              )}
            </form>

            <div className="border-t pt-4">
              <p className="text-sm font-medium text-gray-700 mb-3">Suggested Topics</p>
              {suggestions.length === 0 ? (
                <p className="text-gray-500 text-center py-8 text-sm">
                  No suggestions yet. Be the first to suggest a topic!
                </p>
              ) : (
                <div className="space-y-3 max-h-80 overflow-y-auto">
                  {suggestions.map((suggestion) => (
                    <div
                      key={suggestion.id}
                      className="bg-gray-50 px-4 py-4 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <div className="flex-1">
                          <p className="font-semibold text-gray-800">{suggestion.topic}</p>
                          <p className="text-sm text-gray-600 mt-1">Suggested by {suggestion.name}</p>
                        </div>
                        <button
                          onClick={() => handleVote(suggestion.id, suggestion.votes)}
                          disabled={votingLoading === suggestion.id}
                          className="flex items-center gap-2 px-3 py-2 bg-emerald-100 text-emerald-700 rounded-lg hover:bg-emerald-200 transition-colors font-medium disabled:opacity-50"
                        >
                          <ThumbsUp size={16} />
                          <span>{suggestion.votes}</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="bg-gray-50 px-8 py-4 border-t flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
