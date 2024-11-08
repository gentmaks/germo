"use client";

import { useEffect, useState, useRef, useCallback } from 'react';
import { Briefcase, MapPin, Calendar, ExternalLink, Bell, DollarSign } from 'lucide-react';
import AlertForm from '@/components/Alert';
import CompanyLogo from '@/components/CompanyLogo';

type Listing = {
  title: string;
  link: string;
  location: string;
  datePosted: string;
  company: string;
  salary: string;
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
  const topTechCompanies = [
    "Apple", "Microsoft", "Nvidia", "TikTok", "Alphabet", "Amazon", "Meta", "Taiwan Semiconductor Manufacturing Company (TSMC)", "Broadcom", "Tesla", "Tencent",
    "Samsung Electronics", "ASML", "Oracle", "Adobe", "Salesforce", "Cisco", "IBM", "Intel", "Shopify", "SAP",
    "Accenture", "Qualcomm", "AMD", "ServiceNow", "Intuit", "Snowflake", "Workday", "Square", "Spotify", "Zoom",
    "Palantir", "Dropbox", "Atlassian", "Twilio", "Datadog", "CrowdStrike", "Okta", "Zscaler", "DocuSign", "RingCentral",
    "Slack Technologies", "Pinterest", "Snap", "Uber", "Lyft", "Airbnb", "DoorDash", "Robinhood", "Coinbase", "Stripe",
    "SpaceX", "Epic Games", "ByteDance", "Didi Chuxing", "Xiaomi", "Meituan", "JD.com", "Baidu", "Alibaba", "Huawei",
    "Sony", "LG Electronics", "Panasonic", "Toshiba", "Fujitsu", "NEC Corporation", "Hitachi", "Nokia", "Ericsson", "Siemens",
    "Philips", "SAP", "Capgemini", "Infosys", "Wipro", "Tata Consultancy Services", "HCL Technologies", "Tech Mahindra", "Cognizant", "DXC Technology",
    "HP", "Dell Technologies", "Lenovo", "Acer", "Asus", "Micron Technology", "Western Digital", "Seagate Technology", "NetApp", "VMware",
    "Red Hat", "Citrix Systems", "Fortinet", "Palo Alto Networks", "Check Point Software", "Trend Micro", "Kaspersky Lab", "McAfee", "Symantec", "NortonLifeLock"
  ];
  const [isFaang, setIsFaang] = useState(false); // State for the checkbox


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
    let filteredListings = listings.filter((listing) =>
      listing[filter].toLowerCase().includes(search.toLowerCase())
    );

    if (isFaang) {
      filteredListings = filteredListings.filter((listing) =>
        topTechCompanies.includes(listing.company)
      );
    }

    setFiltered(filteredListings);
    setPage(1); // Reset page when search changes
    setHasMore(true);
  }, [search, filter, listings, isFaang]);


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
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">

      <div className="max-w-4xl flex flex-col items-center py-4 justify-center mx-auto">
        <div className="relative group cursor-pointer">
          <span className="text-4xl tracking-[-0.01em]  font-extralight bg-gradient-to-r from-gray-800 to-gray-600 dark:from-gray-100 dark:to-gray-300 bg-clip-text text-transparent transition-all duration-300 ease-in-out group-hover:tracking-[0.2em]">
            scout
          </span>
          <div className="absolute -bottom-1 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-gray-400 dark:via-gray-500 to-transparent transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 ease-in-out"></div>
        </div>
      </div>

      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto font-mono">
          {/* Search, Filter, and Items Per Page Controls */}
          <div className="flex flex-col gap-4 w-full py-4">
            {/* Search Input - Full width on all screens */}
            <div className="w-full">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={`Search by ${filter}`}
                className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-lg bg-white dark:bg-gray-800 dark:border-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ease-in-out"
              />
            </div>

            {/* Controls Container */}
            <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
              {/* Left side controls */}
              <div className="flex flex-wrap gap-2">
                {/* Filter Select */}
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value as "title" | "company" | "location")}
                  className="px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white dark:bg-gray-800 dark:border-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200 ease-in-out"
                >
                  <option value="title">Job Title</option>
                  <option value="company">Company</option>
                  <option value="location">Location</option>
                </select>

                {/* Items Per Page Select */}
                <select
                  value={itemsPerPage}
                  onChange={(e) => handleItemsPerPageChange(Number(e.target.value))}
                  className="px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white dark:bg-gray-800 dark:border-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200 ease-in-out"
                >
                  <option value={20}>20 per page</option>
                  <option value={50}>50 per page</option>
                  <option value={100}>100 per page</option>
                </select>
              </div>

              {/* Right side controls */}
              <div className="flex items-center gap-3">
                {/* FAANG Toggle */}
                <div className="flex items-center px-4 py-2 border border-gray-200 rounded-lg bg-white dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200 ease-in-out">
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isFaang}
                      onChange={(e) => setIsFaang(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="relative w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-gray-600 peer-checked:bg-blue-500">
                    </div>
                    <span className="ml-2 text-sm font-medium text-gray-900 dark:text-gray-300">FAANG+</span>
                  </label>
                </div>

                {/* Alert Button */}
                <button
                  onClick={() => setShowAlertForm(true)}
                  className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 ease-in-out"
                >
                  <Bell className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>


          {isLoading ? (
            <div className="container mx-auto flex-col p-4 flex items-center justify-center">
              <div className='text-xs py-4 text-gray-500 dark:text-gray-400'>Loading...</div>
              <div className="animate-pulse space-y-4 w-full max-w-4xl">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-20 bg-gray-200 dark:bg-gray-700 rounded-lg" />
                ))}
              </div>
            </div>
          ) : (
            <div>
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

                        <div className='flex justify-start items-center'>
                          <div className='pr-4'>
                            <CompanyLogo companyName={listing.company} />
                          </div>
                          <div className="flex-1 space-y-1">
                            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 text-xs">
                              <div className="flex items-center gap-2">
                                <Briefcase className="w-4 h-4" />
                                <span className="font-medium">{listing.company}</span>
                              </div>
                            </div>

                            <h2 className="text-sm text-gray-900 dark:text-gray-100">
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
                              {listing.salary.includes('$') && (
                                <div className="flex items-center">
                                  <DollarSign className="w-4 h-4" />
                                  <span>{listing.salary.replace('$', '')}</span>
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center mt-2 p-5 sm:mt-0">
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
          )}
        </div>
        <AlertForm
          isOpen={showAlertForm}
          onClose={() => setShowAlertForm(false)}
        />
      </div>
    </div>
  );
}