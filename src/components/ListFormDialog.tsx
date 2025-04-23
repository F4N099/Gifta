import React, { useState, useEffect } from 'react';
import { X, Plus, Loader2, Image as ImageIcon } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Person } from '../types/people';

const PREDEFINED_ICONS = ['🎁', '🎂', '🎄', '❤️', '🎓', '🎉', '🌟', '🎈', '🎊', '🎗️'];

interface ListFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: () => void;
  list?: {
    id: string;
    name: string;
    cover_image?: string | null;
    icon?: string | null;
    person_id?: string | null;
  } | null;
}

const ListFormDialog: React.FC<ListFormDialogProps> = ({
  isOpen,
  onClose,
  onSubmit,
  list
}) => {
  const { user } = useAuth();
  const [name, setName] = useState('');
  const [selectedIcon, setSelectedIcon] = useState<string | null>(null);
  const [coverImage, setCoverImage] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [people, setPeople] = useState<Person[]>([]);
  const [selectedPerson, setSelectedPerson] = useState<string | null>(null);

  useEffect(() => {
    if (list) {
      setName(list.name);
      setCoverImage(list.cover_image || null);
      setSelectedIcon(list.icon || null);
      setSelectedPerson(list.person_id || null);
    } else {
      setName('');
      setCoverImage(null);
      setSelectedIcon(null);
      setSelectedPerson(null);
    }
  }, [list]);

  useEffect(() => {
    if (user) {
      fetchPeople();
    }
  }, [user]);

  const fetchPeople = async () => {
    try {
      const { data, error } = await supabase
        .from('people')
        .select('*')
        .eq('user_id', user?.id)
        .order('name');

      if (error) throw error;
      setPeople(data || []);
    } catch (error) {
      console.error('Error fetching people:', error);
      toast.error('Failed to load people');
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
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

      setIsUploading(true);

      // Remove old image if exists
      if (coverImage) {
        const oldPath = coverImage.split('/').pop();
        if (oldPath) {
          await supabase.storage
            .from('list-covers')
            .remove([`covers/${oldPath}`]);
        }
      }

      const fileExt = file.name.split('.').pop()?.toLowerCase();
      const fileName = `${Math.random().toString(36).slice(2)}.${fileExt}`;
      const filePath = `covers/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('list-covers')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('list-covers')
        .getPublicUrl(filePath);

      setCoverImage(publicUrl);
      setSelectedIcon(null);
      toast.success('Cover image updated');
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error(error instanceof Error ? error.message : 'Error uploading image');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsLoading(true);
    try {
      if (list) {
        const { error } = await supabase
          .from('gift_lists')
          .update({
            name: name.trim(),
            cover_image: coverImage,
            icon: selectedIcon,
            person_id: selectedPerson,
            updated_at: new Date().toISOString()
          })
          .eq('id', list.id)
          .eq('user_id', user.id);

        if (error) throw error;
        toast.success('List updated successfully');
      } else {
        const { error } = await supabase
          .from('gift_lists')
          .insert({
            user_id: user.id,
            name: name.trim(),
            cover_image: coverImage,
            icon: selectedIcon,
            person_id: selectedPerson
          });

        if (error) {
          if (error.code === '23505') {
            throw new Error('A list with this name already exists');
          }
          throw error;
        }
        toast.success('List created successfully');
      }

      onSubmit();
    } catch (error) {
      console.error('Error saving list:', error);
      toast.error(error instanceof Error ? error.message : 'Error saving list');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div 
        className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-md animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              {list ? 'Edit List' : 'Create New List'}
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
            >
              <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                List Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter list name"
                maxLength={50}
                className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 dark:focus:border-rose-500 focus:outline-none transition-all"
                required
              />
            </div>

            <div className="space-y-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                Cover Image or Icon
              </label>
              
              {/* Image upload */}
              <div className="flex items-center gap-4">
                {coverImage ? (
                  <img
                    src={coverImage}
                    alt="Cover"
                    className="w-16 h-16 rounded-lg object-cover"
                  />
                ) : selectedIcon ? (
                  <div className="w-16 h-16 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-3xl">
                    {selectedIcon}
                  </div>
                ) : (
                  <div className="w-16 h-16 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                    <ImageIcon className="w-8 h-8 text-gray-400" />
                  </div>
                )}
                
                <div className="flex-1">
                  <label
                    htmlFor="cover"
                    className={`block w-full px-4 py-2 text-sm text-center bg-gray-100 dark:bg-gray-700 rounded-lg cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors ${
                      isUploading ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    {isUploading ? (
                      <Loader2 className="w-5 h-5 mx-auto animate-spin" />
                    ) : (
                      'Upload Image'
                    )}
                    <input
                      type="file"
                      id="cover"
                      className="hidden"
                      accept="image/jpeg,image/png"
                      onChange={handleImageUpload}
                      disabled={isUploading}
                    />
                  </label>
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    JPG or PNG. Max 5MB.
                  </p>
                </div>
              </div>

              {/* Icon selection */}
              <div className="space-y-2">
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Or choose an icon:
                </p>
                <div className="flex flex-wrap gap-2">
                  {PREDEFINED_ICONS.map((icon) => (
                    <button
                      key={icon}
                      type="button"
                      onClick={() => {
                        setSelectedIcon(icon);
                        setCoverImage(null);
                      }}
                      className={`w-10 h-10 text-xl rounded-lg transition-colors ${
                        selectedIcon === icon
                          ? 'bg-rose-100 dark:bg-rose-500/20'
                          : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600'
                      }`}
                    >
                      {icon}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {people.length > 0 && (
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                  Link to Person (Optional)
                </label>
                <select
                  value={selectedPerson || ''}
                  onChange={(e) => setSelectedPerson(e.target.value || null)}
                  className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 dark:focus:border-rose-500 focus:outline-none transition-all"
                >
                  <option value="">No person selected</option>
                  {people.map((person) => (
                    <option key={person.id} value={person.id}>
                      {person.name} ({person.relationship})
                    </option>
                  ))}
                </select>
              </div>
            )}

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
                disabled={isLoading || !name.trim()}
                className="flex-1 px-4 py-2 bg-rose-500 text-white rounded-xl hover:bg-rose-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <span>{list ? 'Update' : 'Create'}</span>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ListFormDialog;