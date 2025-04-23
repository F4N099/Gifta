import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Loader2, Eye, EyeOff, Check, X } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '../lib/supabase';
import Navbar from '../components/Navbar';

const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Password validation
  const hasUpperCase = /[A-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  const passwordsMatch = password === confirmPassword;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (!hasUpperCase || !hasNumber || !hasSpecialChar) {
      toast.error('La password non soddisfa i requisiti minimi');
      setIsLoading(false);
      return;
    }

    if (!passwordsMatch) {
      toast.error('Le password non coincidono');
      setIsLoading(false);
      return;
    }

    try {
      const { error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          emailRedirectTo: 'https://poetic-sprite-599a11.netlify.app/',
          data: {
            name: name.trim()
          }
        }
      });

      if (error) throw error;

      navigate('/signup-confirmation');
    } catch (error) {
      console.error('Registration error:', error);
      toast.error('Errore durante la registrazione');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col lg:flex-row">
      {/* Form Section */}
      <div className="flex-1 flex flex-col">
        <Navbar />

        <div className="flex-1 flex items-center justify-center p-4">
          <div className="w-full max-w-md">
            {/* Mobile Image */}
            <div className="lg:hidden mb-8">
              <div className="aspect-[4/3] relative rounded-2xl overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1513885535751-8b9238bd345a?q=80&w=2070&auto=format&fit=crop"
                  alt="Decorative"
                  className="absolute inset-0 w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-rose-500/10 backdrop-blur-[2px]" />
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-sm">
              <h1 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
                Crea il tuo account
              </h1>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Name Input */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                    Nome
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 dark:focus:border-rose-500 focus:outline-none transition-all"
                    required
                  />
                </div>

                {/* Email Input */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 dark:focus:border-rose-500 focus:outline-none transition-all"
                    required
                  />
                </div>

                {/* Password Input */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 dark:focus:border-rose-500 focus:outline-none transition-all pr-10"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                  </div>

                  {/* Password Requirements */}
                  <div className="mt-2 space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      {hasUpperCase ? (
                        <Check className="w-4 h-4 text-green-500" />
                      ) : (
                        <X className="w-4 h-4 text-gray-300" />
                      )}
                      <span className={hasUpperCase ? 'text-green-600' : 'text-gray-500'}>
                        Almeno una lettera maiuscola
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      {hasNumber ? (
                        <Check className="w-4 h-4 text-green-500" />
                      ) : (
                        <X className="w-4 h-4 text-gray-300" />
                      )}
                      <span className={hasNumber ? 'text-green-600' : 'text-gray-500'}>
                        Almeno un numero
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      {hasSpecialChar ? (
                        <Check className="w-4 h-4 text-green-500" />
                      ) : (
                        <X className="w-4 h-4 text-gray-300" />
                      )}
                      <span className={hasSpecialChar ? 'text-green-600' : 'text-gray-500'}>
                        Almeno un carattere speciale
                      </span>
                    </div>
                  </div>
                </div>

                {/* Confirm Password Input */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                    Conferma Password
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className={`w-full px-4 py-2 rounded-xl border focus:ring-2 focus:ring-rose-500/20 focus:outline-none transition-all pr-10 ${
                        confirmPassword && !passwordsMatch
                          ? 'border-red-500 dark:border-red-500'
                          : 'border-gray-200 dark:border-gray-700'
                      } dark:bg-gray-700 dark:text-white`}
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
                  {confirmPassword && !passwordsMatch && (
                    <p className="mt-2 text-sm text-red-500">
                      Le password non coincidono
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isLoading || !passwordsMatch || !hasUpperCase || !hasNumber || !hasSpecialChar}
                  className="w-full bg-rose-500 text-white py-3 px-6 rounded-xl hover:bg-rose-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Registrazione in corso...</span>
                    </>
                  ) : (
                    <span>Registrati</span>
                  )}
                </button>

                <p className="text-center text-sm text-gray-600 dark:text-gray-300">
                  Hai già un account?{' '}
                  <Link to="/login" className="text-rose-500 hover:text-rose-600 font-medium">
                    Accedi qui
                  </Link>
                </p>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Desktop Image Section */}
      <div className="hidden lg:flex items-center justify-center w-[55%] p-12">
        <div className="w-full max-w-2xl aspect-[16/10] relative rounded-2xl overflow-hidden">
          <img
            src="https://images.unsplash.com/photo-1513885535751-8b9238bd345a?q=80&w=2070&auto=format&fit=crop"
            alt="Decorative"
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-rose-500/10 backdrop-blur-[2px]" />
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;