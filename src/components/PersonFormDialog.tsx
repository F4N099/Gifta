import React, { useState, useEffect } from 'react';
import { X, Plus, Loader2, Calendar, Tag, Camera } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Person, PersonFormData, RELATIONSHIPS } from '../types/people';

interface PersonFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: () => void;
  person?: Person | null;
}

const PersonFormDialog: React.FC<PersonFormDialogProps> = ({
  isOpen,
  onClose,
  onSubmit,
  person
}) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState<PersonFormData>({
    name: '',
    avatar_url: null,
    relationship: RELATIONSHIPS[0],
    interests: [],
    dates: []
  });
  const [isLoading, setIsLoading] = useState(false);
  const [newInterest, setNewInterest] = useState('');
  const [newDate, setNewDate] = useState({
    title: '',
    date: ''
  });
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

  useEffect(() => {
    if (person) {
      const fetchDates = async () => {
        try {
          const { data: dates, error } = await supabase
            .from('important_dates')
            .select('*')
            .eq('person_id', person.id);

          if (error) throw error;

          setFormData({
            name: person.name,
            avatar_url: person.avatar_url,
            relationship: person.relationship,
            interests: person.interests,
            dates: dates.map(d => ({
              title: d.title,
              date: d.date
            }))
          });
        } catch (error) {
          console.error('Error fetching dates:', error);
          toast.error('Failed to load dates');
        }
      };

      fetchDates();
    } else {
      setFormData({
        name: '',
        avatar_url: null,
        relationship: RELATIONSHIPS[0],
        interests: [],
        dates: []
      });
    }
  }, [person]);

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const file = e.target.files?.[0];
      if (!file) return;

      if (file.size > 5 * 1024 * 1024) {
        throw new Error('Image size must be less than 5MB');
      }

      const validTypes = ['image/jpeg', 'image/png'];
      if (!validTypes.includes(file.type)) {
        throw new Error('Only JPG and PNG files are allowed');
      }

      setIsUploadingAvatar(true);

      // Remove old avatar if exists
      if (formData.avatar_url) {
        const oldPath = formData.avatar_url.split('/').pop();
        if (oldPath) {
          await supabase.storage
            .from('avatars')
            .remove([`avatars/${oldPath}`]);
        }
      }

      // Upload new avatar
      const fileExt = file.name.split('.').pop()?.toLowerCase();
      const fileName = `${Math.random().toString(36).slice(2)}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      setFormData(prev => ({
        ...prev,
        avatar_url: publicUrl
      }));

      toast.success('Profile picture updated');
    } catch (error) {
      console.error('Error uploading avatar:', error);
      toast.error(error instanceof Error ? error.message : 'Error uploading image');
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsLoading(true);
    try {
      if (person) {
        // Update existing person
        const { error: updateError } = await supabase
          .from('people')
          .update({
            name: formData.name,
            avatar_url: formData.avatar_url,
            relationship: formData.relationship,
            interests: formData.interests,
            updated_at: new Date().toISOString()
          })
          .eq('id', person.id)
          .eq('user_id', user.id);

        if (updateError) throw updateError;

        // Delete existing dates
        await supabase
          .from('important_dates')
          .delete()
          .eq('person_id', person.id);

        // Insert new dates
        if (formData.dates.length > 0) {
          const { error: datesError } = await supabase
            .from('important_dates')
            .insert(
              formData.dates.map(date => ({
                person_id: person.id,
                ...date
              }))
            );

          if (datesError) throw datesError;
        }

        toast.success('Person updated successfully');
      } else {
        // Create new person
        const { data: newPerson, error: personError } = await supabase
          .from('people')
          .insert({
            user_id: user.id,
            name: formData.name,
            avatar_url: formData.avatar_url,
            relationship: formData.relationship,
            interests: formData.interests
          })
          .select()
          .single();

        if (personError) throw personError;

        // Insert dates
        if (formData.dates.length > 0) {
          const { error: datesError } = await supabase
            .from('important_dates')
            .insert(
              formData.dates.map(date => ({
                person_id: newPerson.id,
                ...date
              }))
            );

          if (datesError) throw datesError;
        }

        toast.success('Person added successfully');
      }

      onSubmit();
    } catch (error) {
      console.error('Error saving person:', error);
      toast.error('Failed to save person');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddInterest = () => {
    if (!newInterest.trim()) return;
    setFormData(prev => ({
      ...prev,
      interests: [...prev.interests, newInterest.trim()]
    }));
    setNewInterest('');
  };

  const handleRemoveInterest = (index: number) => {
    setFormData(prev => ({
      ...prev,
      interests: prev.interests.filter((_, i) => i !== index)
    }));
  };

  const handleAddDate = () => {
    if (!newDate.title.trim() || !newDate.date) return;
    setFormData(prev => ({
      ...prev,
      dates: [...prev.dates, { ...newDate }]
    }));
    setNewDate({
      title: '',
      date: ''
    });
  };

  const handleRemoveDate = (index: number) => {
    setFormData(prev => ({
      ...prev,
      dates: prev.dates.filter((_, i) => i !== index)
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div
        className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            {person ? 'Edit Person' : 'Add New Person'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="flex items-center gap-6">
            <div className="relative">
              {formData.avatar_url ? (
                <img
                  src={formData.avatar_url}
                  alt="Avatar"
                  className="w-24 h-24 rounded-full object-cover"
                />
              ) : (
                <div className="w-24 h-24 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                  <span className="text-2xl text-gray-500 dark:text-gray-400">
                    {formData.name.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
              <label
                htmlFor="avatar"
                className={`absolute bottom-0 right-0 p-2 bg-white dark:bg-gray-700 rounded-full shadow-md cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors ${
                  isUploadingAvatar ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {isUploadingAvatar ? (
                  <Loader2 className="w-4 h-4 text-gray-600 dark:text-gray-300 animate-spin" />
                ) : (
                  <Camera className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                )}
                <input
                  type="file"
                  id="avatar"
                  className="hidden"
                  accept="image/jpeg,image/png"
                  onChange={handleAvatarChange}
                  disabled={isUploadingAvatar}
                />
              </label>
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                Profile Picture
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                JPG or PNG. Max 5MB.
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
              Name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 dark:focus:border-rose-500 focus:outline-none transition-all"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
              Relationship
            </label>
            <select
              value={formData.relationship}
              onChange={(e) => setFormData(prev => ({ ...prev, relationship: e.target.value }))}
              className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 dark:focus:border-rose-500 focus:outline-none transition-all"
            >
              {RELATIONSHIPS.map(rel => (
                <option key={rel} value={rel}>{rel}</option>
              ))}
            </select>
          </div>

          <div className="space-y-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
              Interests
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={newInterest}
                onChange={(e) => setNewInterest(e.target.value)}
                placeholder="Add an interest"
                className="flex-1 px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 dark:focus:border-rose-500 focus:outline-none transition-all"
              />
              <button
                type="button"
                onClick={handleAddInterest}
                className="px-4 py-2 bg-rose-500 text-white rounded-xl hover:bg-rose-600 transition-colors flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                <span>Add</span>
              </button>
            </div>
            {formData.interests.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {formData.interests.map((interest, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 dark:bg-gray-700 rounded-full"
                  >
                    <Tag className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                    <span className="text-gray-700 dark:text-gray-200">{interest}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveInterest(index)}
                      className="text-gray-400 hover:text-red-500 dark:text-gray-500 dark:hover:text-red-400"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
              Important Dates
            </label>
            <div className="grid gap-4">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newDate.title}
                  onChange={(e) => setNewDate(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Event title"
                  className="flex-1 px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 dark:focus:border-rose-500 focus:outline-none transition-all"
                />
                <input
                  type="date"
                  value={newDate.date}
                  onChange={(e) => setNewDate(prev => ({ ...prev, date: e.target.value }))}
                  className="px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 dark:focus:border-rose-500 focus:outline-none transition-all"
                />
                <button
                  type="button"
                  onClick={handleAddDate}
                  className="px-4 py-2 bg-rose-500 text-white rounded-xl hover:bg-rose-600 transition-colors flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add</span>
                </button>
              </div>
              {formData.dates.length > 0 && (
                <div className="space-y-2">
                  {formData.dates.map((date, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between px-4 py-2 bg-gray-50 dark:bg-gray-700/50 rounded-xl"
                    >
                      <div className="flex items-center gap-3">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {date.title}
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {new Date(date.date).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveDate(index)}
                        className="text-gray-400 hover:text-red-500 dark:text-gray-500 dark:hover:text-red-400"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-3 pt-6">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-700 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || !formData.name}
              className="flex-1 px-4 py-2 bg-rose-500 text-white rounded-xl hover:bg-rose-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <span>{person ? 'Update' : 'Create'}</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PersonFormDialog