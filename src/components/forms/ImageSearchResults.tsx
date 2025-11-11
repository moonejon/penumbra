"use client";

import { FC, useState } from "react";
import { Search, Loader2, AlertCircle, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface ImageSearchResultsProps {
  isbn?: string;
  title?: string;
  author?: string;
  onSelect: (url: string) => void;
}

const ImageSearchResults: FC<ImageSearchResultsProps> = ({
  isbn,
  title,
  author,
  onSelect,
}) => {
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState<string[]>([]);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async () => {
    setIsSearching(true);
    setError(null);
    setResults([]);
    setSelectedImage(null);

    try {
      const params = new URLSearchParams();
      if (isbn) params.append("isbn", isbn);
      if (title) params.append("title", title);
      if (author) params.append("author", author);

      const response = await fetch(`/api/search/cover-images?${params.toString()}`);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Search failed");
      }

      const data = await response.json();

      if (data.images && data.images.length > 0) {
        setResults(data.images);
      } else {
        setError("No cover images found for this search");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Search failed");
    } finally {
      setIsSearching(false);
    }
  };

  const handleImageSelect = (url: string) => {
    setSelectedImage(url);
    onSelect(url);
  };

  return (
    <div className="space-y-4">
      {/* Search input and button */}
      <div className="space-y-3">
        <div>
          <label className="text-sm font-medium text-zinc-300 mb-1.5 block">
            Search Query
          </label>
          <div className="text-sm text-zinc-500">
            {isbn && <div>ISBN: {isbn}</div>}
            {title && <div>Title: {title}</div>}
            {author && <div>Author: {author}</div>}
            {!isbn && !title && !author && (
              <div className="text-amber-400">
                No search criteria available. Please fill in book details first.
              </div>
            )}
          </div>
        </div>

        <Button
          type="button"
          onClick={handleSearch}
          disabled={isSearching || (!isbn && !title)}
          className="w-full"
        >
          {isSearching ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Searching...
            </>
          ) : (
            <>
              <Search className="mr-2 h-4 w-4" />
              Search for Cover Images
            </>
          )}
        </Button>
      </div>

      {/* Loading state */}
      {isSearching && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="aspect-[2/3] bg-zinc-800 rounded-lg animate-pulse"
            />
          ))}
        </div>
      )}

      {/* Results grid */}
      {!isSearching && results.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm text-zinc-400">
            Found {results.length} image{results.length > 1 ? "s" : ""}. Click to select.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {results.map((url, i) => (
              <button
                key={i}
                type="button"
                onClick={() => handleImageSelect(url)}
                className={cn(
                  "relative aspect-[2/3] rounded-lg overflow-hidden",
                  "border-2 transition-all group",
                  selectedImage === url
                    ? "border-zinc-400 ring-2 ring-zinc-600"
                    : "border-zinc-800 hover:border-zinc-600"
                )}
              >
                <img
                  src={url}
                  alt={`Cover option ${i + 1}`}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
                {selectedImage === url && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <CheckCircle className="w-8 h-8 text-zinc-100" />
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Error message */}
      {error && (
        <div className="p-3 bg-red-950/50 border border-red-500/50 rounded-lg flex items-start gap-2">
          <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-200">{error}</p>
        </div>
      )}

      {/* Empty state */}
      {!isSearching && results.length === 0 && !error && (
        <div className="text-center py-8">
          <Search className="w-12 h-12 text-zinc-600 mx-auto mb-3" />
          <p className="text-sm text-zinc-500">
            Search for cover images using the book's ISBN or title
          </p>
        </div>
      )}
    </div>
  );
};

export default ImageSearchResults;
