import { useState, useEffect } from 'react';
import { Settings, Plus, Edit, Trash2, Save, X, Users, GraduationCap } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Database } from '../lib/database.types';

type Class = Database['public']['Tables']['classes']['Row'];
type Slide = Database['public']['Tables']['slides']['Row'];
type Attendance = Database['public']['Tables']['attendance']['Row'];
type ProfessorSuggestion = Database['public']['Tables']['professor_suggestions']['Row'];

interface ClassWithAttendance extends Class {
  attendanceCount: number;
  attendees: Attendance[];
  suggestions: ProfessorSuggestion[];
}

interface AdminPanelProps {
  onUpdate?: () => void;
}

export function AdminPanel({ onUpdate }: AdminPanelProps) {
  const [activeTab, setActiveTab] = useState<'classes' | 'slides'>('classes');
  const [classes, setClasses] = useState<ClassWithAttendance[]>([]);
  const [slides, setSlides] = useState<Slide[]>([]);
  const [editingClass, setEditingClass] = useState<Partial<Class> | null>(null);
  const [editingSlide, setEditingSlide] = useState<Partial<Slide> | null>(null);
  const [viewingAttendance, setViewingAttendance] = useState<ClassWithAttendance | null>(null);
  const [viewingSuggestions, setViewingSuggestions] = useState<ClassWithAttendance | null>(null);
  const [editingSuggestion, setEditingSuggestion] = useState<Partial<ProfessorSuggestion> | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (editingClass || editingSlide) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [editingClass, editingSlide]);

  const loadData = async () => {
    const [classesRes, slidesRes] = await Promise.all([
      supabase.from('classes').select('*').order('class_date', { ascending: false }),
      supabase.from('slides').select('*').order('created_at', { ascending: false }),
    ]);

    if (classesRes.data) {
      const classesWithAttendance = await Promise.all(
        classesRes.data.map(async (cls) => {
          const [{ data: attendees }, { data: suggestions }] = await Promise.all([
            supabase
              .from('attendance')
              .select('*')
              .eq('class_id', cls.id)
              .order('checked_in_at', { ascending: false }),
            supabase
              .from('professor_suggestions')
              .select('*')
              .eq('class_id', cls.id)
              .order('votes', { ascending: false }),
          ]);

          return {
            ...cls,
            attendanceCount: attendees?.length || 0,
            attendees: attendees || [],
            suggestions: suggestions || [],
          };
        })
      );
      setClasses(classesWithAttendance);
    }
    if (slidesRes.data) setSlides(slidesRes.data);
  };

  const saveClass = async () => {
    if (!editingClass) return;

    const { error } = editingClass.id
      ? await supabase
          .from('classes')
          .update(editingClass)
          .eq('id', editingClass.id)
      : await supabase.from('classes').insert(editingClass as Database['public']['Tables']['classes']['Insert']);

    if (error) {
      console.error('Error saving class:', error);
      alert(`Error saving class: ${error.message}`);
      return;
    }

    setEditingClass(null);
    await loadData();
    onUpdate?.();
  };

  const deleteClass = async (id: string) => {
    if (!confirm('Delete this class?')) return;
    await supabase.from('classes').delete().eq('id', id);
    loadData();
    onUpdate?.();
  };

  const saveSlide = async () => {
    if (!editingSlide) return;

    const { error } = editingSlide.id
      ? await supabase
          .from('slides')
          .update(editingSlide)
          .eq('id', editingSlide.id)
      : await supabase.from('slides').insert(editingSlide as Database['public']['Tables']['slides']['Insert']);

    if (error) {
      console.error('Error saving slide:', error);
      alert(`Error saving slide: ${error.message}`);
      return;
    }

    setEditingSlide(null);
    await loadData();
    onUpdate?.();
  };

  const deleteSlide = async (id: string) => {
    if (!confirm('Delete this slide?')) return;
    await supabase.from('slides').delete().eq('id', id);
    loadData();
    onUpdate?.();
  };

  const deleteAttendee = async (id: string) => {
    if (!confirm('Delete this attendee?')) return;
    await supabase.from('attendance').delete().eq('id', id);
    loadData();
    onUpdate?.();
  };

  const deleteSuggestion = async (id: string) => {
    if (!confirm('Delete this suggestion?')) return;
    await supabase.from('professor_suggestions').delete().eq('id', id);
    loadData();
  };

  const saveSuggestion = async () => {
    if (!editingSuggestion) return;

    const { error } = editingSuggestion.id
      ? await supabase
          .from('professor_suggestions')
          .update(editingSuggestion)
          .eq('id', editingSuggestion.id)
      : await supabase.from('professor_suggestions').insert(editingSuggestion as Database['public']['Tables']['professor_suggestions']['Insert']);

    if (error) {
      console.error('Error saving suggestion:', error);
      alert(`Error saving suggestion: ${error.message}`);
      return;
    }

    setEditingSuggestion(null);
    await loadData();
  };


  return (
    <section className="mb-8 sm:mb-12">
      <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
        <Settings className="text-emerald-600" size={24} />
        <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800">Admin Panel</h2>
      </div>

      <div className="bg-white rounded-xl shadow-lg overflow-hidden border-2 border-emerald-200">
        <div className="flex border-b">
          <button
            onClick={() => setActiveTab('classes')}
            className={`flex-1 py-3 sm:py-4 font-semibold text-sm sm:text-base transition-colors ${
              activeTab === 'classes'
                ? 'bg-emerald-600 text-white'
                : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
            }`}
          >
            <span className="hidden sm:inline">Manage </span>Classes
          </button>
          <button
            onClick={() => setActiveTab('slides')}
            className={`flex-1 py-3 sm:py-4 font-semibold text-sm sm:text-base transition-colors ${
              activeTab === 'slides'
                ? 'bg-emerald-600 text-white'
                : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
            }`}
          >
            <span className="hidden sm:inline">Manage </span>Slides
          </button>
        </div>

        <div className="p-4 sm:p-6">
          {activeTab === 'classes' && (
            <div>
              <button
                onClick={() =>
                  setEditingClass({
                    title: '',
                    description: '',
                    location: '',
                    class_date: new Date().toISOString(),
                    duration_minutes: 60,
                    qa_is_open: false,
                  })
                }
                className="mb-4 bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors font-medium flex items-center gap-2"
              >
                <Plus size={18} />
                Add New Class
              </button>

              <div className="space-y-4">
                {classes.map((classItem) => (
                  <div key={classItem.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="font-bold text-lg">{classItem.title}</h3>
                        <p className="text-gray-600 text-sm">{classItem.description}</p>
                        <p className="text-gray-500 text-sm mt-2">
                          {new Date(classItem.class_date).toLocaleString()} - {classItem.location}
                        </p>
                        <div className="flex items-center gap-4 mt-2 flex-wrap">
                          <button
                            onClick={() => setViewingAttendance(classItem)}
                            className="flex items-center gap-1 text-emerald-600 hover:bg-emerald-50 px-3 py-1 rounded text-sm font-medium"
                          >
                            <Users size={16} />
                            Attendance: {classItem.attendanceCount}
                          </button>
                          <button
                            onClick={() => setViewingSuggestions(classItem)}
                            className="flex items-center gap-1 text-blue-600 hover:bg-blue-50 px-3 py-1 rounded text-sm font-medium"
                          >
                            <GraduationCap size={16} />
                            Suggestions: {classItem.suggestions.length}
                          </button>
                          <button
                            onClick={async () => {
                              await supabase
                                .from('classes')
                                .update({ qa_open: !classItem.qa_open })
                                .eq('id', classItem.id);
                              loadData();
                              onUpdate?.();
                            }}
                            className={`text-xs px-3 py-1 rounded font-medium transition-colors ${
                              classItem.qa_open
                                ? 'bg-green-100 text-green-700 hover:bg-green-200'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                          >
                            Q&A: {classItem.qa_open ? 'Open' : 'Closed'} - Click to {classItem.qa_open ? 'Close' : 'Open'}
                          </button>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setEditingClass(classItem)}
                          className="text-blue-600 hover:bg-blue-50 p-2 rounded"
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          onClick={() => deleteClass(classItem.id)}
                          className="text-red-600 hover:bg-red-50 p-2 rounded"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'slides' && (
            <div>
              <button
                onClick={() => setEditingSlide({ title: '', url: '', class_id: null })}
                className="mb-4 bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors font-medium flex items-center gap-2"
              >
                <Plus size={18} />
                Add New Slide
              </button>

              <div className="space-y-4">
                {slides.map((slide) => (
                  <div key={slide.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-bold">{slide.title}</h3>
                        <a
                          href={slide.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-emerald-600 hover:underline text-sm"
                        >
                          {slide.url}
                        </a>
                        {slide.class_id && (
                          <p className="text-xs text-gray-500 mt-1">
                            Linked to: {classes.find(c => c.id === slide.class_id)?.title || 'Unknown Class'}
                          </p>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setEditingSlide(slide)}
                          className="text-blue-600 hover:bg-blue-50 p-2 rounded"
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          onClick={() => deleteSlide(slide.id)}
                          className="text-red-600 hover:bg-red-50 p-2 rounded"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {editingClass && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setEditingClass(null)}>
          <div className="bg-white rounded-xl p-6 w-full max-w-2xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-2xl font-bold mb-4">
              {editingClass.id ? 'Edit Class' : 'Add New Class'}
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                <input
                  type="text"
                  placeholder="Title"
                  value={editingClass.title || ''}
                  onChange={(e) => setEditingClass({ ...editingClass, title: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg text-gray-900"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Subtitle</label>
                <input
                  type="text"
                  placeholder="Brief description or tagline"
                  value={editingClass.subtitle || ''}
                  onChange={(e) => setEditingClass({ ...editingClass, subtitle: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg text-gray-900"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  placeholder="Description"
                  value={editingClass.description || ''}
                  onChange={(e) => setEditingClass({ ...editingClass, description: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg h-24 text-gray-900"
                />
              </div>
              <input
                type="text"
                placeholder="Location"
                value={editingClass.location || ''}
                onChange={(e) => setEditingClass({ ...editingClass, location: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg text-gray-900"
              />
              <input
                type="datetime-local"
                value={editingClass.class_date ? (() => {
                  const date = new Date(editingClass.class_date);
                  const year = date.getFullYear();
                  const month = String(date.getMonth() + 1).padStart(2, '0');
                  const day = String(date.getDate()).padStart(2, '0');
                  const hours = String(date.getHours()).padStart(2, '0');
                  const minutes = String(date.getMinutes()).padStart(2, '0');
                  return `${year}-${month}-${day}T${hours}:${minutes}`;
                })() : ''}
                onChange={(e) => setEditingClass({ ...editingClass, class_date: new Date(e.target.value).toISOString() })}
                className="w-full px-4 py-2 border rounded-lg text-gray-900"
              />
              <input
                type="number"
                placeholder="Duration (minutes)"
                value={editingClass.duration_minutes || 60}
                onChange={(e) => setEditingClass({ ...editingClass, duration_minutes: parseInt(e.target.value) })}
                className="w-full px-4 py-2 border rounded-lg text-gray-900"
              />
              <label className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={editingClass.qa_is_open || false}
                  onChange={(e) => setEditingClass({ ...editingClass, qa_is_open: e.target.checked })}
                  className="w-5 h-5 text-emerald-600"
                />
                <span className="font-medium text-gray-700">Enable Q&A for this class</span>
              </label>
              <label className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={editingClass.qa_open !== undefined ? editingClass.qa_open : true}
                  onChange={(e) => setEditingClass({ ...editingClass, qa_open: e.target.checked })}
                  className="w-5 h-5 text-emerald-600"
                />
                <span className="font-medium text-gray-700">Q&A is Open (manual control)</span>
              </label>
              <div className="flex gap-3">
                <button
                  onClick={() => setEditingClass(null)}
                  className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50 flex items-center justify-center gap-2"
                >
                  <X size={18} />
                  Cancel
                </button>
                <button
                  onClick={saveClass}
                  className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 flex items-center justify-center gap-2"
                >
                  <Save size={18} />
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {editingSlide && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setEditingSlide(null)}>
          <div className="bg-white rounded-xl p-6 w-full max-w-2xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-2xl font-bold mb-4">
              {editingSlide.id ? 'Edit Slide' : 'Add New Slide'}
            </h3>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Title"
                value={editingSlide.title || ''}
                onChange={(e) => setEditingSlide({ ...editingSlide, title: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg text-gray-900"
              />
              <input
                type="url"
                placeholder="URL"
                value={editingSlide.url || ''}
                onChange={(e) => setEditingSlide({ ...editingSlide, url: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg text-gray-900"
              />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Link to Class (Optional)
                </label>
                <select
                  value={editingSlide.class_id || ''}
                  onChange={(e) => setEditingSlide({ ...editingSlide, class_id: e.target.value || null })}
                  className="w-full px-4 py-2 border rounded-lg text-gray-900 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                >
                  <option value="">No Class</option>
                  {classes.map((cls) => (
                    <option key={cls.id} value={cls.id}>
                      {cls.title} - {new Date(cls.class_date).toLocaleDateString()}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setEditingSlide(null)}
                  className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50 flex items-center justify-center gap-2"
                >
                  <X size={18} />
                  Cancel
                </button>
                <button
                  onClick={saveSlide}
                  className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 flex items-center justify-center gap-2"
                >
                  <Save size={18} />
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {viewingAttendance && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setViewingAttendance(null)}>
          <div className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-2xl font-bold">Attendance for {viewingAttendance.title}</h3>
              <button
                onClick={() => setViewingAttendance(null)}
                className="text-gray-500 hover:bg-gray-100 p-2 rounded"
              >
                <X size={24} />
              </button>
            </div>
            <p className="text-gray-600 mb-4">Total: {viewingAttendance.attendanceCount} attendees</p>
            {viewingAttendance.attendees.length === 0 ? (
              <p className="text-center text-gray-500 py-8">No attendees yet</p>
            ) : (
              <div className="space-y-2">
                {viewingAttendance.attendees.map((attendee) => (
                  <div
                    key={attendee.id}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
                  >
                    <p className="font-medium">{attendee.attendee_name}</p>
                    <button
                      onClick={() => {
                        deleteAttendee(attendee.id);
                        setViewingAttendance(null);
                      }}
                      className="text-red-600 hover:bg-red-50 p-2 rounded"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {viewingSuggestions && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setViewingSuggestions(null)}>
          <div className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-2xl font-bold">Professor Suggestions for {viewingSuggestions.title}</h3>
              <button
                onClick={() => setViewingSuggestions(null)}
                className="text-gray-500 hover:bg-gray-100 p-2 rounded"
              >
                <X size={24} />
              </button>
            </div>
            <p className="text-gray-600 mb-4">Total: {viewingSuggestions.suggestions.length} suggestions</p>
            {viewingSuggestions.suggestions.length === 0 ? (
              <p className="text-center text-gray-500 py-8">No suggestions yet</p>
            ) : (
              <div className="space-y-3">
                {viewingSuggestions.suggestions.map((suggestion) => (
                  <div
                    key={suggestion.id}
                    className="p-4 border rounded-lg hover:bg-gray-50"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <p className="font-bold text-gray-800">{suggestion.topic}</p>
                        <p className="text-sm text-gray-600 mt-1">Suggested by {suggestion.name}</p>
                        <p className="text-sm text-emerald-600 font-medium mt-1">{suggestion.votes} votes</p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setEditingSuggestion(suggestion)}
                          className="text-blue-600 hover:bg-blue-50 p-2 rounded"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => {
                            deleteSuggestion(suggestion.id);
                            setViewingSuggestions(null);
                          }}
                          className="text-red-600 hover:bg-red-50 p-2 rounded"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {editingSuggestion && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setEditingSuggestion(null)}>
          <div className="bg-white rounded-xl p-6 w-full max-w-2xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-2xl font-bold mb-4">Edit Professor Suggestion</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                <input
                  type="text"
                  placeholder="Name"
                  value={editingSuggestion.name || ''}
                  onChange={(e) => setEditingSuggestion({ ...editingSuggestion, name: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg text-gray-900"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Topic</label>
                <textarea
                  placeholder="Topic"
                  value={editingSuggestion.topic || ''}
                  onChange={(e) => setEditingSuggestion({ ...editingSuggestion, topic: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg h-24 text-gray-900"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Votes</label>
                <input
                  type="number"
                  placeholder="Votes"
                  value={editingSuggestion.votes || 0}
                  onChange={(e) => setEditingSuggestion({ ...editingSuggestion, votes: parseInt(e.target.value) })}
                  className="w-full px-4 py-2 border rounded-lg text-gray-900"
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setEditingSuggestion(null)}
                  className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50 flex items-center justify-center gap-2"
                >
                  <X size={18} />
                  Cancel
                </button>
                <button
                  onClick={saveSuggestion}
                  className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 flex items-center justify-center gap-2"
                >
                  <Save size={18} />
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
