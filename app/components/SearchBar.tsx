import React, { useState, useEffect, useRef } from 'react';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { useLanguageContext } from '@/app/contexts/LanguageContext';

interface Suggestion {
  text: string;
  category: string | null;
}

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  onSearch?: (value: string) => void;
}

export default function SearchBar({ value, onChange, placeholder, onSearch }: SearchBarProps) {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const { t } = useLanguageContext();

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (!value.trim()) {
        setSuggestions([]);
        return;
      }

      setLoading(true);
      try {
        const response = await fetch(`/api/products/suggestions?q=${encodeURIComponent(value)}`);
        const data = await response.json();
        setSuggestions(data.suggestions);
      } catch (error) {
        console.error('Error fetching suggestions:', error);
        setSuggestions([]);
      } finally {
        setLoading(false);
      }
    };

    const debounceTimeout = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(debounceTimeout);
  }, [value]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSuggestionClick = (suggestion: Suggestion) => {
    onChange(suggestion.text);
    setIsOpen(false);
    onSearch?.(suggestion.text);
  };

  return (
    <div ref={wrapperRef} className="relative">
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary bg-white"
          placeholder={placeholder}
        />
      </div>

      {/* Suggestions dropdown */}
      {isOpen && value.trim() && (
        <div className="absolute z-50 w-full mt-1 bg-white rounded-lg shadow-lg border border-gray-200 max-h-96 overflow-y-auto">
          {loading ? (
            <div className="p-4 text-center text-gray-500">{t('loading')}</div>
          ) : suggestions.length > 0 ? (
            <ul className="py-2">
              {suggestions.map((suggestion, index) => (
                <li
                  key={index}
                  className="px-4 py-2 hover:bg-gray-100 cursor-pointer flex flex-col"
                  onClick={() => handleSuggestionClick(suggestion)}
                >
                  <span className="text-gray-900">{suggestion.text}</span>
                  {suggestion.category && (
                    <span className="text-sm text-gray-500">{suggestion.category}</span>
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <div className="p-4 text-center text-gray-500">{t('noResults')}</div>
          )}
        </div>
      )}
    </div>
  );
} 