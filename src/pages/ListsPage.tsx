import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Plus, Pencil, Trash2, Share2, MoreVertical, Loader2, Gift, UserCircle } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import Navbar from '../components/Navbar';
import ListFormDialog from '../components/ListFormDialog';
import ShareListDialog from '../components/ShareListDialog';

interface GiftList {
  id: string;
  name: string;
  cover_image: string | null;
  icon: string | null;
  person_id: string | null;
  person?: {
    name: string;
    relationship: string;
    avatar_url: string | null;
  };
  count: number;
}

const ListsPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [lists, setLists] = useState<GiftList[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showFormDialog, setShowFormDialog] = useState(false);
  const [editingList, setEditingList] = useState<GiftList | null>(null);
  const [sharingList, setSharingList] = useState<GiftList | null>(null);
  const [menuOpen, setMenuOpen] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    fetchLists();
  }, [user, navigate]);

  const fetchLists = async () => {
    try {
      const { data, error } = await supabase
        .from('gift_lists')
        .select(`
          id,
          name,
          cover_image,
          icon,
          person_id,
          people (
            name,
            relationship,
            avatar_url
          ),
          list_gifts (count)
        `)
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setLists(data.map(list => ({
        ...list,
        person: list.people,
        count: list.list_gifts?.[0]?.count || 0
      })));
    } catch (error) {
      console.error('Error fetching lists:', error);
      toast.error('Error loading lists');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (listId: string) => {
    setIsDeleting(listId);
    try {
      const { error } = await supabase
        .from('gift_lists')
        .delete()
        .eq('id', listId);

      if (error) throw error;

      setLists(lists.filter(list => list.id !== listId));
      toast.success('List deleted successfully');
    } catch (error) {
      console.error('Error deleting list:', error);
      toast.error('Error deleting list');
    } finally {
      setIsDeleting(null);
      setMenuOpen(null);
    }
  };

  const handleFormSubmit = () => {
    setShowFormDialog(false);
    setEditingList(null);
    fetchLists();
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
            Gift Lists
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Organize your gift ideas in personalized lists
          </p>
        </header>

        <div className="space-y-6">
          {lists.length < 10 && (
            <button
              onClick={() => setShowFormDialog(true)}
              className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-white dark:bg-gray-800 rounded-2xl shadow-sm hover:shadow-md transition-all text-gray-600 dark:text-gray-300"
            >
              <Plus className="w-5 h-5" />
              <span>Create new list</span>
            </button>
          )}

          {lists.length === 0 ? (
            <div className="text-center py-12">
              <div className="flex justify-center mb-4">
                <Gift className="w-12 h-12 text-gray-400" />
              </div>
              <h2 className="text-xl font-medium text-gray-900 dark:text-white mb-2">
                No lists created yet
              </h2>
              <p className="text-gray-600 dark:text-gray-300">
                Start organizing your gift ideas in lists
              </p>
            </div>
          ) : (
            <div className="grid gap-6">
              {lists.map(list => (
                <div
                  key={list.id}
                  className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm"
                >
                  <div className="flex items-start gap-4">
                    {/* List Cover/Icon */}
                    {list.cover_image ? (
                      <img
                        src={list.cover_image}
                        alt={list.name}
                        className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
                      />
                    ) : list.icon ? (
                      <div className="w-16 h-16 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-3xl flex-shrink-0">
                        {list.icon}
                      </div>
                    ) : (
                      <div className="w-16 h-16 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-3xl flex-shrink-0">
                        🎁
                      </div>
                    )}

                    {/* List Info */}
                    <div className="flex-1 min-w-0">
                      <button
                        onClick={() => navigate(`/lists/${list.id}`)}
                        className="text-left w-full"
                      >
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white truncate">
                          {list.name}
                        </h2>
                        
                        {/* Person Badge */}
                        {list.person && (
                          <div className="flex items-center gap-2 mt-2 mb-1">
                            <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 dark:bg-gray-700/50 rounded-full">
                              {list.person.avatar_url ? (
                                <img
                                  src={list.person.avatar_url}
                                  alt={list.person.name}
                                  className="w-5 h-5 rounded-full object-cover"
                                />
                              ) : (
                                <UserCircle className="w-5 h-5 text-gray-400" />
                              )}
                              <span className="text-sm text-gray-700 dark:text-gray-200">
                                {list.person.name}
                              </span>
                              <span className="text-sm text-gray-500 dark:text-gray-400">
                                • {list.person.relationship}
                              </span>
                            </div>
                          </div>
                        )}

                        <p className="text-gray-600 dark:text-gray-300 mt-1">
                          {list.count} {list.count === 1 ? 'gift' : 'gifts'}
                        </p>
                      </button>
                    </div>

                    {/* Actions Menu */}
                    <div className="relative flex-shrink-0">
                      <button
                        onClick={() => setMenuOpen(menuOpen === list.id ? null : list.id)}
                        className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        <MoreVertical className="w-5 h-5" />
                      </button>
                      {menuOpen === list.id && (
                        <>
                          <div
                            className="fixed inset-0 z-10"
                            onClick={() => setMenuOpen(null)}
                          />
                          <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-lg z-20">
                            <button
                              onClick={() => {
                                setEditingList(list);
                                setMenuOpen(null);
                              }}
                              className="w-full flex items-center gap-2 px-4 py-2 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                            >
                              <Pencil className="w-4 h-4" />
                              <span>Edit</span>
                            </button>
                            <button
                              onClick={() => {
                                setSharingList(list);
                                setMenuOpen(null);
                              }}
                              className="w-full flex items-center gap-2 px-4 py-2 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                            >
                              <Share2 className="w-4 h-4" />
                              <span>Share</span>
                            </button>
                            <button
                              onClick={() => handleDelete(list.id)}
                              disabled={isDeleting === list.id}
                              className="w-full flex items-center gap-2 px-4 py-2 text-red-600 dark:text-red-400 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                            >
                              {isDeleting === list.id ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <Trash2 className="w-4 h-4" />
                              )}
                              <span>Delete</span>
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <ListFormDialog
          isOpen={showFormDialog || !!editingList}
          onClose={() => {
            setShowFormDialog(false);
            setEditingList(null);
          }}
          onSubmit={handleFormSubmit}
          list={editingList}
        />

        {sharingList && (
          <ShareListDialog
            isOpen={true}
            onClose={() => setSharingList(null)}
            list={sharingList}
          />
        )}
      </main>
    </div>
  );
};

export default ListsPage;