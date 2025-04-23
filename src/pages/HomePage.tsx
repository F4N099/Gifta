import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Gift, Loader2, Heart, Loader, LayoutTemplate, Users } from 'lucide-react';
import { toast } from 'sonner';
import AuthModal from '../components/AuthModal';
import Illustration from '../components/Illustration';
import GiftCard from '../components/GiftCard';
import InterestChip from '../components/InterestChip';
import LoadingSkeleton from '../components/LoadingSkeleton';
import Navbar from '../components/Navbar';
import PersonSelector from '../components/PersonSelector';
import SurpriseToggle from '../components/SurpriseToggle';
import SurpriseGiftCard from '../components/SurpriseGiftCard';
import GenerationLimitModal from '../components/GenerationLimitModal';
import { GiftSuggestion } from '../types/gift';
import { Person } from '../types/people';
import { getGiftSuggestions } from '../services/giftService';
import { extractInterests } from '../services/keywordService';
import { mockGiftSuggestions } from '../services/mockData';
import { useSavedGifts } from '../contexts/SavedGiftsContext';
import { useSurpriseGift } from '../contexts/SurpriseGiftContext';
import { useGenerationLimit } from '../contexts/GenerationLimitContext';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

const HomePage = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { isSurpriseEnabled, showAuthModal, setShowAuthModal } = useSurpriseGift();
  const { savedGifts, saveGift, unsaveGift } = useSavedGifts();
  const { canGenerate, incrementCount } = useGenerationLimit();
  const [recipient, setRecipient] = useState('');
  const [description, setDescription] = useState('');
  const [interests, setInterests] = useState<string[]>([]);
  const [suggestedInterests, setSuggestedInterests] = useState<string[]>([]);
  const [budget, setBudget] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [giftSuggestions, setGiftSuggestions] = useState<GiftSuggestion[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [showTestLoading, setShowTestLoading] = useState(false);
  const [showTestResults, setShowTestResults] = useState(false);
  const [people, setPeople] = useState<Person[]>([]);
  const [selectedPerson, setSelectedPerson] = useState<Person | null>(null);

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

  const handlePersonSelect = async (personId: string) => {
    if (!personId) {
      setSelectedPerson(null);
      setRecipient('');
      setDescription('');
      setInterests([]);
      return;
    }

    const person = people.find(p => p.id === personId);
    if (!person) return;

    setSelectedPerson(person);
    setRecipient(person.name);
    setDescription(`${person.name} is my ${person.relationship.toLowerCase()}. They are interested in ${person.interests.join(', ')}.`);
    setInterests(person.interests);
  };

  const handleSaveToggle = async (gift: GiftSuggestion) => {
    try {
      if (savedGifts.has(gift.buyLink)) {
        unsaveGift(gift);
        toast.success('Gift removed from saved items');
      } else {
        saveGift(gift);
        toast.success('Gift saved successfully');
      }
    } catch (error) {
      console.error('Error toggling save:', error);
      toast.error('Failed to save gift');
    }
  };

  const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newDescription = e.target.value;
    setDescription(newDescription);

    if (newDescription.length > 10) {
      const extracted = extractInterests(newDescription);
      setSuggestedInterests(extracted);
    }
  };

  const handleInterestClick = (interest: string) => {
    setInterests(prev => 
      prev.includes(interest)
        ? prev.filter(i => i !== interest)
        : [...prev, interest]
    );
  };

  const handleBudgetClick = (amount: number) => {
    setBudget(amount);
  };

  const handleBudgetChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === '' || (/^\d+$/.test(value) && parseInt(value) >= 0)) {
      setBudget(value === '' ? 0 : parseInt(value));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!canGenerate) {
      return;
    }

    setIsLoading(true);
    setShowResults(true);
    setError(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });

    try {
      const response = await getGiftSuggestions({
        recipient,
        description,
        interests,
        budget,
        includeSurprise: isSurpriseEnabled
      });

      setGiftSuggestions(response.suggestions.map(gift => ({
        ...gift,
        isSaved: savedGifts.has(gift.buyLink)
      })));

      incrementCount();
    } catch (error) {
      console.error('Failed to get gift suggestions:', error);
      setError('Unable to generate gift suggestions at the moment. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTopicClick = async (topic: string) => {
    if (!canGenerate) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await getGiftSuggestions({
        recipient,
        description: `Interest in ${topic}`,
        interests: [topic],
        budget
      });

      setGiftSuggestions(response.suggestions.map(gift => ({
        ...gift,
        isSaved: savedGifts.has(gift.buyLink)
      })));

      incrementCount();
    } catch (error) {
      console.error('Failed to get gift suggestions:', error);
      setError('Unable to generate gift suggestions at the moment. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartOver = () => {
    setShowResults(false);
    setIsLoading(false);
    setGiftSuggestions([]);
    setError(null);
    setRecipient('');
    setDescription('');
    setBudget(0);
    setInterests([]);
    setSuggestedInterests([]);
    setShowTestLoading(false);
    setShowTestResults(false);
    setSelectedPerson(null);
  };

  if (showTestLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Navbar />
        <main className="max-w-4xl mx-auto px-4 py-24 space-y-8">
          <LoadingSkeleton />
          <button
            onClick={handleStartOver}
            className="block mx-auto text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white transition-colors"
          >
            ← Back to form
          </button>
        </main>
      </div>
    );
  }

  if (showTestResults) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Navbar />
        <main className="max-w-4xl mx-auto px-4 py-24 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mockGiftSuggestions.map((gift, index) => (
              <GiftCard
                key={index}
                {...gift}
                isSaved={savedGifts.has(gift.buyLink)}
                onTopicClick={handleTopicClick}
                onSaveToggle={handleSaveToggle}
              />
            ))}
          </div>
          <button
            onClick={handleStartOver}
            className="block mx-auto text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white transition-colors"
          >
            ← Back to form
          </button>
        </main>
      </div>
    );
  }

  if (showResults) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Navbar />

        <main className="max-w-4xl mx-auto px-4 py-24 space-y-8">
          {error ? (
            <div className="bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 p-4 rounded-xl text-center">
              <p className="mb-4">{error}</p>
              <button
                onClick={handleStartOver}
                className="text-sm hover:underline"
              >
                ← Start over
              </button>
            </div>
          ) : isLoading ? (
            <LoadingSkeleton />
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {giftSuggestions.map((gift, index) => {
                  const isLastAndSurprise = index === giftSuggestions.length - 1 && isSurpriseEnabled;
                  const CardComponent = isLastAndSurprise ? SurpriseGiftCard : GiftCard;
                  
                  return (
                    <CardComponent
                      key={index}
                      {...gift}
                      isSaved={savedGifts.has(gift.buyLink)}
                      onTopicClick={handleTopicClick}
                      onSaveToggle={handleSaveToggle}
                    />
                  );
                })}
              </div>
              
              <button
                onClick={handleStartOver}
                className="block mx-auto text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white transition-colors"
              >
                ← Start over
              </button>
            </>
          )}
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 py-24 space-y-8">
        <header className="text-center space-y-6 animate-fade-in">
          <div className="flex justify-center animate-slide-down">
            <Illustration className="w-24 h-24 text-gray-900 dark:text-white" />
          </div>
          <h1 className="text-4xl font-semibold tracking-tight text-gray-900 dark:text-white animate-slide-down [animation-delay:200ms]">
            Trova idee regalo personalizzate
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto animate-slide-down [animation-delay:400ms]">
            {t('app.description')}
          </p>
        </header>

        <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm space-y-6 animate-slide-up [animation-delay:600ms]">
          {user && people.length > 0 && (
            <PersonSelector
              people={people}
              selectedPerson={selectedPerson}
              onSelect={handlePersonSelect}
            />
          )}

          {!selectedPerson && (
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                Per chi è il regalo?
              </label>
              <input
                type="text"
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                placeholder="mia madre, una mia amica, il mio fidanzato"
                className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 dark:focus:border-rose-500 focus:outline-none transition-all"
                required
              />
            </div>
          )}

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
              {t('form.description.label')}
            </label>
            <textarea
              value={description}
              onChange={handleDescriptionChange}
              placeholder={t('form.description.placeholder')}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 dark:focus:border-rose-500 focus:outline-none transition-all resize-none"
              rows={3}
              required
            />
          </div>

          {suggestedInterests.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {suggestedInterests.map((interest) => (
                <InterestChip
                  key={interest}
                  interest={interest}
                  onClick={() => handleInterestClick(interest)}
                  isSelected={interests.includes(interest)}
                />
              ))}
            </div>
          )}

          <div className="space-y-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
              {t('form.budget.label')}
            </label>
            
            <div className="flex gap-4 items-center">
              <div className="relative flex-1">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400">€</span>
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="\d*"
                  value={budget || ''}
                  onChange={handleBudgetChange}
                  placeholder={t('form.budget.placeholder')}
                  className="w-full pl-8 pr-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 dark:focus:border-rose-500 focus:outline-none transition-all"
                />
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {[10, 30, 50, 70, 100, 200, 300].map((amount) => (
                <InterestChip
                  key={amount}
                  interest={`€${amount}`}
                  onClick={() => handleBudgetClick(amount)}
                  isSelected={budget === amount}
                />
              ))}
            </div>
          </div>

          <SurpriseToggle />

          <button
            type="submit"
            disabled={!recipient || !description || !budget || isLoading || !canGenerate}
            className="w-full bg-rose-500 text-white py-3 px-6 rounded-xl hover:bg-rose-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Generating suggestions...</span>
              </>
            ) : (
              <>
                <Gift className="w-5 h-5" />
                <span>{t('form.submit')}</span>
              </>
            )}
          </button>
        </form>

        <footer className="text-center pt-8 border-t border-gray-100 dark:border-gray-800 space-y-6">
          <a
            href="https://ko-fi.com"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300 hover:text-rose-500 dark:hover:text-rose-400 transition-colors"
          >
            <span>{t('footer.support')}</span>
            <Heart className="w-4 h-4" />
          </a>

          <div className="flex flex-wrap justify-center gap-3">
            <button
              onClick={() => {
                setShowTestLoading(true);
                setShowTestResults(false);
                setShowResults(false);
              }}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm text-gray-600 dark:text-gray-300 hover:text-rose-500 dark:hover:text-rose-400 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors"
            >
              <Loader className="w-4 h-4" />
              <span>Test Loading</span>
            </button>
            <button
              onClick={() => {
                setShowTestResults(true);
                setShowTestLoading(false);
                setShowResults(false);
              }}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm text-gray-600 dark:text-gray-300 hover:text-rose-500 dark:hover:text-rose-400 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors"
            >
              <LayoutTemplate className="w-4 h-4" />
              <span>Test Results</span>
            </button>
          </div>
        </footer>
      </main>

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
      />

      <GenerationLimitModal />
    </div>
  );
};

export default HomePage;