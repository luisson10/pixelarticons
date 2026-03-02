'use client';

import { useState, useMemo } from 'react';
import { Search, Sparkles } from 'lucide-react';
import { IconCard } from './icon-card';
import type { IconEntry } from '@/lib/icons';

interface IconCatalogProps {
  icons: IconEntry[];
}

export function IconCatalog({ icons }: IconCatalogProps) {
  const [search, setSearch] = useState('');
  const [size, setSize] = useState<24 | 48>(48);
  const [currentPage, setCurrentPage] = useState(1);
  const [showNewOnly, setShowNewOnly] = useState(false);
  const itemsPerPage = 96;

  const newCount = useMemo(() => icons.filter((i) => i.isNew).length, [icons]);

  const filteredIcons = useMemo(() => {
    let result = icons;
    if (showNewOnly) result = result.filter((i) => i.isNew);
    if (search) result = result.filter((i) => i.name.toLowerCase().includes(search.toLowerCase()));
    return result;
  }, [icons, search, showNewOnly]);

  const totalPages = Math.ceil(filteredIcons.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentIcons = filteredIcons.slice(startIndex, endIndex);

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setCurrentPage(1);
  };

  const handleNewToggle = () => {
    setShowNewOnly((prev) => !prev);
    setCurrentPage(1);
  };

  const renderPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 7;

    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage < maxVisiblePages - 1) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => setCurrentPage(i)}
          className={`px-3 py-1 border ${
            currentPage === i
              ? 'bg-primary text-primary-foreground border-primary'
              : 'bg-background text-foreground border-border hover:bg-muted'
          }`}
        >
          {i}
        </button>
      );
    }

    return pages;
  };

  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <div className="border-b border-border bg-background sticky top-0 z-10">
        <div className="flex items-center gap-3 p-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              value={search}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="Search icons..."
              className="w-full pl-10 pr-4 py-2 border border-border bg-background text-foreground rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          {/* New icons filter */}
          {newCount > 0 && (
            <button
              onClick={handleNewToggle}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-md border text-sm font-medium transition-colors ${
                showNewOnly
                  ? 'bg-accent text-accent-foreground border-accent'
                  : 'bg-background text-foreground border-border hover:bg-muted'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              New
              <span
                className={`text-xs px-1.5 py-0.5 rounded-sm font-bold ${
                  showNewOnly
                    ? 'bg-accent-foreground/20 text-accent-foreground'
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                {newCount}
              </span>
            </button>
          )}

          {/* Size toggle */}
          <div className="flex gap-0 border border-border rounded-md overflow-hidden">
            <button
              onClick={() => setSize(24)}
              className={`px-4 py-2 ${
                size === 24
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted/50 text-muted-foreground hover:bg-muted'
              }`}
            >
              24px
            </button>
            <button
              onClick={() => setSize(48)}
              className={`px-4 py-2 ${
                size === 48
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted/50 text-muted-foreground hover:bg-muted'
              }`}
            >
              48px
            </button>
          </div>
        </div>
      </div>

      {/* Icon Grid */}
      <div className="flex-1 overflow-y-auto bg-background">
        {currentIcons.length === 0 ? (
          <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
            No icons found.
          </div>
        ) : (
          <div
            className="grid gap-2 p-4"
            style={{
              gridTemplateColumns: `repeat(auto-fill, minmax(${size === 48 ? '120px' : '100px'}, 1fr))`,
            }}
          >
            {currentIcons.map((icon) => (
              <IconCard key={icon.name} name={icon.name} size={size} isNew={icon.isNew} />
            ))}
          </div>
        )}
      </div>

      {/* Footer with Pagination */}
      <div className="border-t border-border bg-background sticky bottom-0">
        <div className="flex items-center justify-between p-4">
          <div className="text-sm text-muted-foreground">
            Showing {filteredIcons.length === 0 ? 0 : startIndex + 1} -{' '}
            {Math.min(endIndex, filteredIcons.length)} of {filteredIcons.length} icons
          </div>
          {totalPages > 1 && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 border border-border bg-background text-foreground hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              {renderPageNumbers()}
              <button
                onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1 border border-border bg-background text-foreground hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
