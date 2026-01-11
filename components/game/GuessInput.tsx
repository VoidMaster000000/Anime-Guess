'use client';

import { useState, useEffect, useRef, KeyboardEvent } from 'react';
import { Search, Loader2 } from 'lucide-react';

interface SearchResult {
  romaji: string;
  english: string | null;
}

interface GuessInputProps {
  onGuess: (guess: string) => void;
  disabled: boolean;
}

export default function GuessInput({ onGuess, disabled }: GuessInputProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [suggestions, setSuggestions] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [showDropdown, setShowDropdown] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Debounced search
  useEffect(() => {
    if (!searchTerm.trim() || disabled) {
      setSuggestions([]);
      setShowDropdown(false);
      return;
    }

    const timeoutId = setTimeout(async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`/api/search?q=${encodeURIComponent(searchTerm)}`);
        if (response.ok) {
          const data = await response.json();
          const results = Array.isArray(data) ? data : [];
          setSuggestions(results);
          setShowDropdown(results.length > 0);
        }
      } catch (error) {
        console.error('Search error:', error);
        setSuggestions([]);
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchTerm, disabled]);

  // Handle keyboard navigation
  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (disabled) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) =>
        prev < suggestions.length - 1 ? prev + 1 : prev
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (selectedIndex >= 0 && suggestions[selectedIndex]) {
        handleSelect(suggestions[selectedIndex].romaji);
      } else if (searchTerm.trim()) {
        handleSelect(searchTerm);
      }
    } else if (e.key === 'Escape') {
      setShowDropdown(false);
      setSelectedIndex(-1);
    }
  };

  const handleSelect = (romaji: string) => {
    onGuess(romaji);
    setSearchTerm('');
    setSuggestions([]);
    setShowDropdown(false);
    setSelectedIndex(-1);
    inputRef.current?.blur();
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        !inputRef.current?.contains(event.target as Node)
      ) {
        setShowDropdown(false);
        setSelectedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative w-full max-w-2xl">
      {/* Input container */}
      <div className="relative">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" aria-hidden="true">
          {isLoading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Search className="w-5 h-5" />
          )}
        </div>

        <input
          ref={inputRef}
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          placeholder="Guess the anime..."
          className={`
            w-full px-12 py-4 bg-gray-900 border-2 border-purple-500/30 rounded-xl
            text-white placeholder-gray-500 outline-none transition-all
            ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:border-purple-500/50'}
            focus:border-purple-500 focus:shadow-[0_0_20px_rgba(168,85,247,0.4)]
          `}
          role="combobox"
          aria-expanded={showDropdown && suggestions.length > 0}
          aria-controls="anime-suggestions-listbox"
          aria-autocomplete="list"
          aria-activedescendant={selectedIndex >= 0 ? `suggestion-${selectedIndex}` : undefined}
          aria-label="Search for anime title"
        />
      </div>

      {/* Dropdown suggestions - simple absolute positioning */}
      {showDropdown && suggestions.length > 0 && !disabled && (
        <div
          ref={dropdownRef}
          className="absolute top-full left-0 right-0 mt-2 z-[9999] bg-gray-900 border-2 border-purple-500/30 rounded-xl overflow-hidden shadow-2xl"
          id="anime-suggestions-listbox"
          role="listbox"
          aria-label="Anime suggestions"
        >
          <div className="max-h-[300px] overflow-y-auto">
            {suggestions.map((anime, index) => (
              <SuggestionItem
                key={`${anime.romaji}-${index}`}
                anime={anime}
                isSelected={selectedIndex === index}
                onClick={() => handleSelect(anime.romaji)}
                onMouseEnter={() => setSelectedIndex(index)}
                index={index}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Helper component for suggestion items with CSS hover
function SuggestionItem({
  anime,
  isSelected,
  onClick,
  onMouseEnter,
  index,
}: {
  anime: { romaji: string; english: string | null };
  isSelected: boolean;
  onClick: () => void;
  onMouseEnter: () => void;
  index: number;
}) {
  return (
    <button
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      className={`
        w-full px-4 py-3 text-left transition-all duration-100
        ${isSelected
          ? 'bg-gradient-to-r from-purple-500/30 to-pink-500/20 text-white border-l-2 border-purple-500 translate-x-2'
          : 'text-gray-300 hover:bg-purple-500/10'
        }
      `}
      role="option"
      id={`suggestion-${index}`}
      aria-selected={isSelected}
    >
      <div className="font-medium">{anime.romaji}</div>
      {anime.english && anime.english !== anime.romaji && (
        <div className="text-sm text-gray-500 mt-1">
          {anime.english}
        </div>
      )}
    </button>
  );
}
