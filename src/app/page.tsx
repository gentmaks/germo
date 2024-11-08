"use client";

import { useEffect, useState, useRef, useCallback } from 'react';
import { Briefcase, MapPin, Calendar, ExternalLink, Bell } from 'lucide-react';
import AlertForm from '@/components/Alert';

type Listing = {
  title: string;
  link: string;
  location: string;
  datePosted: string;
  company: string;
};

export default function Home() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [filtered, setFiltered] = useState<Listing[]>([]);
  const [displayedListings, setDisplayedListings] = useState<Listing[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"title" | "company" | "location">("company");
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [showAlertForm, setShowAlertForm] = useState(false);
  const observer = useRef<IntersectionObserver | null>(null);


  // Fetch initial data
  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch('/api/fetchJobs');
        const data = await response.json();
        setListings(data.listings);
        setFiltered(data.listings);
      } catch (error) {
        console.error('Error fetching listings:', error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, []);

  // Filter listings based on search
  useEffect(() => {
    const filteredListings = listings.filter((listing) =>
      listing[filter].toLowerCase().includes(search.toLowerCase())
    );
    setFiltered(filteredListings);
    setPage(1); // Reset page when search changes
    setHasMore(true);
  }, [search, filter, listings]);

  // Update displayed listings based on pagination
  useEffect(() => {
    const startIndex = 0;
    const endIndex = page * itemsPerPage;
    const newDisplayedListings = filtered.slice(startIndex, endIndex);
    setDisplayedListings(newDisplayedListings);
    setHasMore(endIndex < filtered.length);
  }, [filtered, page, itemsPerPage]);

  // Last element ref for infinite scroll
  const lastListingElementRef = useCallback((node: HTMLDivElement | null) => {
    if (isLoading) return;

    if (observer.current) observer.current.disconnect();

    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        setPage(prevPage => prevPage + 1);
      }
    });

    if (node) observer.current.observe(node);
  }, [isLoading, hasMore]);

  // Handle items per page change
  const handleItemsPerPageChange = (newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage);
    setPage(1); // Reset to first page
    setHasMore(true);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-4 min-h-screen flex items-center justify-center">
        <div className="animate-pulse space-y-4 w-full max-w-4xl">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-20 bg-gray-200 dark:bg-gray-700 rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">


      <div className="max-w-4xl py-8 flex flex-col items-center justify-center mx-auto">
        <div className="relative group cursor-pointer">
          <span className="text-4xl tracking-[-0.01em]  font-extralight bg-gradient-to-r from-gray-800 to-gray-600 dark:from-gray-100 dark:to-gray-300 bg-clip-text text-transparent transition-all duration-300 ease-in-out group-hover:tracking-[0.2em]">
            scout
          </span>
          <div className="absolute -bottom-1 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-gray-400 dark:via-gray-500 to-transparent transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 ease-in-out"></div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-4">
        <div className="max-w-4xl mx-auto font-mono">
          {/* Search, Filter, and Items Per Page Controls */}
          <div className="flex flex-col sm:flex-row w-full text-xs items-center mb-6 space-y-3 sm:space-y-0 sm:space-x-4">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={`Search by ${filter}`}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none"
            />
            <div className="flex items-center gap-2 justify-between w-auto">
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value as "title" | "company" | "location")}
                className="px-4 text-xs py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none"
              >
                <option value="title">Job Title</option>
                <option value="company">Company</option>
                <option value="location">Location</option>
              </select>
              <select
                value={itemsPerPage}
                onChange={(e) => handleItemsPerPageChange(Number(e.target.value))}
                className="px-4 text-xs py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none"
              >
                <option value={20}>20 per page</option>
                <option value={50}>50 per page</option>
                <option value={100}>100 per page</option>
              </select>
              <div className="">
                <button
                  onClick={() => setShowAlertForm(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none text-xs"
                >
                  <Bell className="w-4 h-4" />
                  Alerts
                </button>
              </div>
            </div>
          </div>

          {/* Results count */}
          <div className="text-xs text-gray-500 dark:text-gray-400 mb-4">
            Showing {displayedListings.length} of {filtered.length} listings
          </div>

          <div className="space-y-3">
            {displayedListings.length > 0 ? (
              displayedListings.map((listing, index) => (
                <div
                  key={index}
                  ref={index === displayedListings.length - 1 ? lastListingElementRef : null}
                  className="bg-white dark:bg-gray-800 rounded-lg duration-200 overflow-hidden border border-gray-100 dark:border-gray-700"
                >
                  <a
                    href={listing.link}
                    className="block p-4 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-200"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <div className="flex flex-col sm:flex-row sm:justify-between">
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 text-xs">
                          <Briefcase className="w-4 h-4" />
                          <span className="font-medium">{listing.company}</span>
                        </div>

                        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                          {listing.title}
                        </h2>

                        <div className="flex flex-wrap gap-4 text-xs text-gray-500 dark:text-gray-400">
                          <div className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            <span>{listing.location}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            <span>{listing.datePosted}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center mt-2 sm:mt-0">
                        <ExternalLink className="w-5 h-5" />
                      </div>
                    </div>
                  </a>
                </div>
              ))
            ) : (
              <p className="text-center text-gray-600 dark:text-gray-400">No listings found.</p>
            )}
          </div>

          {hasMore && (
            <div className="text-center py-4">
              <div className="animate-pulse text-gray-500 dark:text-gray-400">Loading more...</div>
            </div>
          )}
        </div>
      </div>
      <AlertForm
        isOpen={showAlertForm}
        onClose={() => setShowAlertForm(false)}
      />
    </div>
  );
}