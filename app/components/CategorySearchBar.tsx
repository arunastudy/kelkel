'use client';

import React, { useState, useEffect, useRef } from 'react';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { useLanguageContext } from '@/app/contexts/LanguageContext';

interface CategorySearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export default function CategorySearchBar({ value, onChange, placeholder }: CategorySearchBarProps) {
  const [localValue, setLocalValue] = useState(value);
  const { t } = useLanguageContext();

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setLocalValue(newValue);
    onChange(newValue);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
  };

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          value={localValue}
          onChange={handleChange}
          className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary bg-white"
          placeholder={placeholder}
          autoComplete="off"
        />
      </div>
    </form>
  );
}