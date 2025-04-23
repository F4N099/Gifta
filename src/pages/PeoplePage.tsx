import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Loader2, UserX, Calendar, Tag, MoreVertical, Pencil, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Person, ImportantDate, RELATIONSHIPS } from '../types/people';
import Navbar from '../components/Navbar';
import PersonFormDialog from '../components/PersonFormDialog';

const PeoplePage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [people, setPeople] = useState<(Person & { dates: ImportantDate[] })[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showFormDialog, setShowFormDialog] = useState(false);
  const [editingPerson, setEditingPerson] = useState<Person | null>(null);
  const [menuOpen, setMenuOpen] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    fetchPeople();
  }, [user, navigate]);

  const fetchPeople = async () => {
    try {
      const { data: peopleData, error: peopleError } = await supabase
        .from('people')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (peopleError) throw peopleError;

      const peopleWithDates = await Promise.all(
        (peopleData || []).map(async (person) => {
          const { data: dates, error: datesError } = await supabase
            .from('important_dates')
            .select('*')
            .eq('person_id', person.id)
            .order('date', { ascending: true });

          if (datesError) throw datesError;

          return {
            ...person,
            dates: dates || []
          };
        })
      );

      setPeople(peopleWithDates);
    } catch (error) {
      console.error('Error fetching people:', error);
      toast.error('Failed to load people');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (personId: string) => {
    try {
      const { error } = await supabase
        .from('people')
        .delete()
        .eq('id', personId)
        .eq('user_id', user?.id);

      if (error) throw error;

      setPeople(prev => prev.filter(p => p.id !== personId));
      toast.success('Person deleted successfully');
    } catch (error) {
      console.error('Error deleting person:', error);
      toast.error('Failed to delete person');
    }
  };

  const handleFormSubmit = () => {
    setShowFormDialog(false);
    setEditingPerson(null);
    fetchPeople();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Navbar />
        <main className="max-w-4xl mx-auto px-4 py-24">
          <div className="flex items-center justify-center">
            <Loader2 className="w-8 h-8 text-rose-500 animate-spin" />
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />
      <main className="max-w-4xl mx-auto px-4 py-24">
        <header className="text-center mb-12">
          <h1 className="text-3xl font-semibold text-gray-900 dark:text-white mb-4">
            People
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Manage your gift recipients
          </p>
        </header>

        <div className="space-y-6">
          <button
            onClick={() => setShowFormDialog(true)}
            className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-white dark:bg-gray-800 rounded-2xl shadow-sm hover:shadow-md transition-all text-gray-600 dark:text-gray-300"
          >
            <Plus className="w-5 h-5" />
            <span>Add new person</span>
          </button>

          {people.length === 0 ? (
            <div className="text-center py-12">
              <div className="flex justify-center mb-4">
                <UserX className="w-12 h-12 text-gray-400" />
              </div>
              <h2 className="text-xl font-medium text-gray-900 dark:text-white mb-2">
                No people added yet
              </h2>
              <p className="text-gray-600 dark:text-gray-300">
                Start adding people to manage your gift ideas
              </p>
            </div>
          ) : (
            <div className="grid gap-6">
              {people.map(person => (
                <div
                  key={person.id}
                  className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm space-y-4"
                >
                  <div className="flex items-center gap-4">
                    {person.avatar_url ? (
                      <img
                        src={person.avatar_url}
                        alt={person.name}
                        className="w-16 h-16 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                        <span className="text-2xl text-gray-500 dark:text-gray-400">
                          {person.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                        {person.name}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-300">
                        {person.relationship}
                      </p>
                    </div>
                    <div className="relative">
                      <button
                        onClick={() => setMenuOpen(menuOpen === person.id ? null : person.id)}
                        className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        <MoreVertical className="w-5 h-5" />
                      </button>
                      {menuOpen === person.id && (
                        <>
                          <div
                            className="fixed inset-0 z-10"
                            onClick={() => setMenuOpen(null)}
                          />
                          <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-lg z-20">
                            <button
                              onClick={() => {
                                setEditingPerson(person);
                                setMenuOpen(null);
                              }}
                              className="w-full flex items-center gap-2 px-4 py-2 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                            >
                              <Pencil className="w-4 h-4" />
                              <span>Edit</span>
                            </button>
                            <button
                              onClick={() => {
                                handleDelete(person.id);
                                setMenuOpen(null);
                              }}
                              className="w-full flex items-center gap-2 px-4 py-2 text-red-600 dark:text-red-400 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                              <span>Delete</span>
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  {person.interests.length > 0 && (
                    <div className="flex items-center gap-2 text-sm">
                      <Tag className="w-4 h-4 text-gray-400" />
                      <div className="flex flex-wrap gap-2">
                        {person.interests.map((interest, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded-full text-gray-600 dark:text-gray-300"
                          >
                            {interest}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {person.dates.length > 0 && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                        <Calendar className="w-4 h-4" />
                        <span>Important Dates</span>
                      </div>
                      <div className="grid gap-2">
                        {person.dates.map(date => (
                          <div
                            key={date.id}
                            className="flex items-center justify-between px-3 py-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
                          >
                            <div>
                              <p className="font-medium text-gray-900 dark:text-white">
                                {date.title}
                              </p>
                              <p className="text-sm text-gray-500 dark:text-gray-400">
                                {new Date(date.date).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <PersonFormDialog
          isOpen={showFormDialog || !!editingPerson}
          onClose={() => {
            setShowFormDialog(false);
            setEditingPerson(null);
          }}
          onSubmit={handleFormSubmit}
          person={editingPerson}
        />
      </main>
    </div>
  );
};

export default PeoplePage