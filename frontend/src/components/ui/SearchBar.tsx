import { useState, useEffect } from 'react';
import { Search, X } from 'lucide-react';
import { cn } from '../../lib/utils';
import { debounce } from '../../lib/utils';

interface SearchBarProps {
  placeholder?: string;
  onSearch: (query: string) => void;
  delay?: number;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const SearchBar = ({ placeholder = 'Search...', onSearch, delay = 300, className, size = 'lg' }: SearchBarProps) => {
  const [query, setQuery] = useState('');

  useEffect(() => {
    const debouncedSearch = debounce((value: string) => {
      onSearch(value);
    }, delay);

    debouncedSearch(query);
  }, [query, onSearch, delay]);

  const handleClear = () => {
    setQuery('');
    onSearch('');
  };

  const sizeStyles = {
    sm: { input: 'h-10 pl-10 pr-10 text-sm', icon: 'h-4 w-4' },
    md: { input: 'h-12 pl-11 pr-11 text-base', icon: 'h-5 w-5' },
    lg: { input: 'h-14 pl-12 pr-12 text-lg', icon: 'h-6 w-6' },
  } as const;

  return (
    <div className={cn('relative', className)} role="search">
      <Search className={cn('absolute left-3 top-1/2 -translate-y-1/2 text-foreground/80', sizeStyles[size].icon)} />
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
        className={cn(
          'w-full bg-background border border-border rounded-lg placeholder:text-foreground/80 shadow focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background focus:border-primary hover:border-foreground/30 transition-colors',
          sizeStyles[size].input
        )}
      />
      {query && (
        <button
          type="button"
          onClick={handleClear}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground/70 hover:text-foreground transition-colors"
          aria-label="Clear search"
        >
          <X className={cn(sizeStyles[size].icon)} />
        </button>
      )}
    </div>
  );
};

export default SearchBar;
