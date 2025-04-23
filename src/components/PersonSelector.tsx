import React, { useState, useRef, useEffect } from 'react';
import { Users, Check, ChevronDown } from 'lucide-react';
import { Person } from '../types/people';
import { useTranslation } from 'react-i18next';

interface PersonSelectorProps {
  people: Person[];
  selectedPerson: Person | null;
  onSelect: (personId: string) => void;
  required?: boolean;
}

const PersonSelector: React.FC<PersonSelectorProps> = ({
  people,
  selectedPerson,
  onSelect,
  required = false
}) => {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (required && !selectedPerson) {
      setError(true);
    } else {
      setError(false);
    }
  }, [required, selectedPerson]);

  const handleSelect = (personId: string) => {
    onSelect(personId);
    setIsOpen(false);
    setError(false);
  };

  return (
    <div className="space-y-2" ref={dropdownRef}>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
        {t('form.selectPerson')}
        {required && <span className="text-rose-500 ml-1">*</span>}
      </label>
      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={`w-full flex items-center gap-3 px-4 py-2 bg-white dark:bg-gray-700 rounded-xl border transition-all ${
            error
              ? 'border-rose-500 dark:border-rose-500'
              : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
          } focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500`}
        >
          <Users className={`w-5 h-5 ${selectedPerson ? 'text-rose-500' : 'text-gray-400'}`} />
          <span className={`flex-1 text-left ${
            selectedPerson
              ? 'text-gray-900 dark:text-white'
              : 'text-gray-500 dark:text-gray-400'
          }`}>
            {selectedPerson ? `${selectedPerson.name} (${selectedPerson.relationship})` : t('form.selectPerson.placeholder')}
          </span>
          <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        {isOpen && (
          <div className="absolute z-50 w-full mt-2 py-2 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-lg animate-in fade-in zoom-in-95 duration-100">
            <button
              type="button"
              onClick={() => handleSelect('')}
              className={`w-full flex items-center gap-3 px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors ${
                !selectedPerson ? 'text-rose-500 dark:text-rose-400' : 'text-gray-700 dark:text-gray-300'
              }`}
            >
              <Users className="w-5 h-5" />
              <span className="flex-1 text-left">{t('form.selectPerson')}</span>
              {!selectedPerson && <Check className="w-4 h-4" />}
            </button>

            <div className="my-2 border-t border-gray-100 dark:border-gray-700" />

            {people.length === 0 ? (
              <div className="px-4 py-2 text-sm text-gray-500 dark:text-gray-400">
                {t('form.selectPerson.noResults')}
              </div>
            ) : (
              people.map(person => (
                <button
                  key={person.id}
                  type="button"
                  onClick={() => handleSelect(person.id)}
                  className={`w-full flex items-center gap-3 px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors ${
                    selectedPerson?.id === person.id
                      ? 'text-rose-500 dark:text-rose-400'
                      : 'text-gray-700 dark:text-gray-300'
                  }`}
                >
                  {person.avatar_url ? (
                    <img
                      src={person.avatar_url}
                      alt={person.name}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                        {person.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                  <div className="flex-1 text-left">
                    <div className="font-medium">{person.name}</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {person.relationship}
                    </div>
                  </div>
                  {selectedPerson?.id === person.id && (
                    <Check className="w-4 h-4" />
                  )}
                </button>
              ))
            )}
          </div>
        )}
      </div>
      {error && (
        <p className="text-sm text-rose-500">{t('form.selectPerson.required')}</p>
      )}
    </div>
  );
};

export default PersonSelector