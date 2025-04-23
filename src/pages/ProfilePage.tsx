import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, Loader2, Eye, EyeOff, User, Mail, Lock } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import ProfileMenu from '../components/ProfileMenu';
import Logo from '../components/Logo';
import { useTranslation } from 'react-i18next';

const ProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { user, signOut } = useAuth();
  const [name, setName] = useState('');
  const [avatar, setAvatar] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [initialName, setInitialName] = useState('');
  const [initialAvatar, setInitialAvatar] = useState<string | null>(null);
  const [hasChanges, setHasChanges] = useState(false);

  // Password update states
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    const fetchProfile = async () => {
      try {
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('name, avatar_url')
          .eq('id', user.id)
          .single();

        if (profileError) throw profileError;

        if (profile) {
          setName(profile.name || '');
          setAvatar(profile.avatar_url);
          setInitialName(profile.name || '');
          setInitialAvatar(profile.avatar_url);
        }
      } catch (error) {
        console.error('Error loading profile:', error);
        setError('Error loading profile');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [user, navigate]);

  const uploadAvatar = async (file: File): Promise<string> => {
    try {
      if (avatar) {
        const oldAvatarPath = avatar.split('/').pop();
        if (oldAvatarPath) {
          await supabase.storage
            .from('avatars')
            .remove([`avatars/${oldAvatarPath}`]);
        }
      }

      const fileExt = file.name.split('.').pop()?.toLowerCase();
      const fileName = `${Math.random().toString(36).slice(2)}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      const { error: uploadError, data } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) throw uploadError;
      if (!data) throw new Error('No data received from server');

      const { data: { publicUrl }, error: urlError } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      if (urlError) throw urlError;

      return publicUrl;
    } catch (error) {
      console.error('Error in uploadAvatar:', error);
      throw error;
    }
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      if (!user) {
        toast.error('No user found. Please log in again.');
        navigate('/login');
        return;
      }

      const file = e.target.files?.[0];
      if (!file) throw new Error('No file selected');

      if (file.size > 5 * 1024 * 1024) {
        throw new Error('Image cannot exceed 5MB');
      }

      const validTypes = ['image/jpeg', 'image/png'];
      if (!validTypes.includes(file.type)) {
        throw new Error('Only JPG and PNG files are allowed');
      }

      setIsSaving(true);
      setError(null);

      const avatarUrl = await uploadAvatar(file);
      
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: avatarUrl })
        .eq('id', user.id);

      if (updateError) throw updateError;

      setAvatar(avatarUrl);
      setInitialAvatar(avatarUrl);
      toast.success('Profile picture updated successfully');
    } catch (error) {
      console.error('Error in handleAvatarChange:', error);
      toast.error(error instanceof Error ? error.message : 'Error updating avatar');
    } finally {
      setIsSaving(false);
    }
  };

  // Effect to check for changes
  useEffect(() => {
    const nameChanged = name !== initialName;
    setHasChanges(nameChanged);
  }, [name, initialName]);

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast.error('No user found. Please log in again.');
      navigate('/login');
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ name })
        .eq('id', user.id);

      if (updateError) throw updateError;

      toast.success('Profile updated successfully');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Error updating profile');
    } finally {
      setIsSaving(false);
    }
  };

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast.error('No user found. Please log in again.');
      navigate('/login');
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    setIsUpdatingPassword(true);
    setError(null);

    try {
      // First verify the current password by attempting to sign in
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: currentPassword,
      });

      if (signInError) {
        throw new Error('Current password is incorrect');
      }

      // Update the password
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (updateError) throw updateError;

      toast.success('Password updated successfully. Please log in again.');
      
      // Clear form fields
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');

      // Force logout
      await signOut();
      
      // Redirect to login page
      navigate('/login');
    } catch (error) {
      console.error('Error updating password:', error);
      toast.error(error instanceof Error ? error.message : 'Error updating password');
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-rose-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="fixed top-0 left-0 right-0 z-50">
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <Logo />
              <ProfileMenu />
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-2xl mx-auto px-4 py-24">
        <div className="space-y-8">
          {/* Personal Information Section */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-sm">
            <div className="space-y-8">
              <div className="flex items-center gap-3">
                <User className="w-5 h-5 text-rose-500" />
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
                  Informazioni Personali
                </h2>
              </div>

              {error && (
                <div className="bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 p-4 rounded-xl text-sm">
                  {error}
                </div>
              )}

              <div className="space-y-6">
                <div className="flex items-center gap-6">
                  <div className="relative">
                    {avatar ? (
                      <img
                        src={avatar}
                        alt="Avatar"
                        className="w-24 h-24 rounded-full object-cover bg-gray-100"
                      />
                    ) : (
                      <div className="w-24 h-24 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                        <span className="text-2xl text-gray-500 dark:text-gray-400">
                          {name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                    <label
                      htmlFor="avatar"
                      className={`absolute bottom-0 right-0 bg-white dark:bg-gray-700 rounded-full p-2 shadow-md cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors ${
                        isSaving ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                    >
                      {isSaving ? (
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
                        disabled={isSaving}
                      />
                    </label>
                  </div>

                  <div className="flex-1">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                      Foto Profilo
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      JPG o PNG. Max 5MB.
                    </p>
                  </div>
                </div>

                <form onSubmit={handleProfileUpdate} className="space-y-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                      Nome
                    </label>
                    <input
                      type="text"
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 dark:focus:border-rose-500 focus:outline-none transition-all"
                      placeholder="Il tuo nome"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSaving || !hasChanges}
                    className="w-full bg-rose-500 text-white py-3 px-6 rounded-xl hover:bg-rose-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    <span>Salva Modifiche</span>
                    {isSaving && <Loader2 className="w-5 h-5 animate-spin" />}
                  </button>
                </form>
              </div>
            </div>
          </div>

          {/* Password Section */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-sm">
            <div className="space-y-8">
              <div className="flex items-center gap-3">
                <Lock className="w-5 h-5 text-rose-500" />
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
                  Modidica password
                </h2>
              </div>

              <form onSubmit={handlePasswordUpdate} className="space-y-6">
                <div>
                  <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                    Password Attuale
                  </label>
                  <div className="relative">
                    <input
                      type={showCurrentPassword ? "text" : "password"}
                      id="currentPassword"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 dark:focus:border-rose-500 focus:outline-none transition-all pr-10"
                      placeholder="Inserisci la password attuale"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                    >
                      {showCurrentPassword ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                </div>

                <div>
                  <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                    Nuova Password
                  </label>
                  <div className="relative">
                    <input
                      type={showNewPassword ? "text" : "password"}
                      id="newPassword"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 dark:focus:border-rose-500 focus:outline-none transition-all pr-10"
                      placeholder="Inserisci la nuova password"
                      required
                      minLength={8}
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                    >
                      {showNewPassword ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                  <p className="mt-1 text-sm text-gray-500">
                    Deve essere di almeno 8 caratteri
                  </p>
                </div>

                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                    Conferma Nuova Password
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      id="confirmPassword"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 dark:focus:border-rose-500 focus:outline-none transition-all pr-10"
                      placeholder="Conferma la nuova password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isUpdatingPassword || !currentPassword || !newPassword || !confirmPassword}
                  className="w-full bg-rose-500 text-white py-3 px-6 rounded-xl hover:bg-rose-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <span>Aggiorna Password</span>
                  {isUpdatingPassword && <Loader2 className="w-5 h-5 animate-spin" />}
                </button>
              </form>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ProfilePage;