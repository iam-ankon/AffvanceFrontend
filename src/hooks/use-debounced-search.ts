import { useEffect, useState } from 'react';

interface UseSearchOptions {
  minLength?: number;
  delay?: number;
}

export function useDebouncedSearch(options: UseSearchOptions = {}) {
  const { minLength = 3, delay = 500 } = options;
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedValue, setDebouncedValue] = useState('');

  useEffect(() => {
    // If search term is empty, clear debounced value immediately
    if (searchTerm === '') {
      setDebouncedValue('');
      return;
    }

    // Don't trigger search if term is shorter than minLength
    if (searchTerm.length < minLength) {
      setDebouncedValue('');
      return;
    }

    const timer = setTimeout(() => {
      setDebouncedValue(searchTerm);
    }, delay);

    return () => clearTimeout(timer);
  }, [searchTerm, delay, minLength]);

  return {
    searchTerm,
    debouncedValue,
    setSearchTerm,
    isSearching: searchTerm.length >= minLength
  };
}
