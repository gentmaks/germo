import { useState, useEffect } from 'react';
import Image from 'next/image';

interface CompanyLogoProps {
  companyName: string;
}

interface BrandSearchResult {
  brandId: string;
  claimed: boolean;
  domain: string;
  name: string;
  icon: string;
  _score: number;
  qualityScore: number;
  verified?: boolean;
}

const CompanyLogo = ({ companyName }: CompanyLogoProps) => {
  const [logoUrl, setLogoUrl] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Normalize company name for consistent cache keys
  const normalizeCompanyName = (name: string): string => {
    return name
      .toLowerCase()
      .replace(/[^\w\s-]/g, '') // Remove special characters except spaces and hyphens
      .replace(/\s+/g, '-')     // Replace spaces with hyphens
      .trim();
  };

  // Generate a consistent cache key
  const getCacheKey = (name: string): string => {
    const normalized = normalizeCompanyName(name);
    return `company-logo-${normalized}`;
  };

  useEffect(() => {
    const cacheKey = getCacheKey(companyName);

    const fetchLogo = async () => {
      // Try to get from cache first
      try {
        const cachedLogos = JSON.parse(localStorage.getItem('companyLogos') || '{}');
        if (cachedLogos[cacheKey]) {
          setLogoUrl(cachedLogos[cacheKey]);
          setIsLoading(false);
          return;
        }
      } catch (error) {
        console.error('Error reading from cache:', error);
        // Clear corrupted cache
        localStorage.removeItem('companyLogos');
      }

      try {
        const response = await fetch(`https://api.brandfetch.io/v2/search/${encodeURIComponent(companyName)}`, {
          headers: {
            'Authorization': `Bearer ${process.env.BRANCHFETCH_SECRET}`
          }
        });

        const data = await response.json() as BrandSearchResult[];

        if (data && data.length > 0 && data[0].icon) {
          let newLogoUrl = data[0].icon;
          if (companyName.includes('Meta')) {
            newLogoUrl = data[1]?.icon
          }
          setLogoUrl(newLogoUrl);

          // Update cache with normalized key
          try {
            const existingCache = JSON.parse(localStorage.getItem('companyLogos') || '{}');
            const updatedCache = {
              ...existingCache,
              [cacheKey]: newLogoUrl
            };
            localStorage.setItem('companyLogos', JSON.stringify(updatedCache));
          } catch (error) {
            console.error('Error updating cache:', error);
          }
        }
      } catch (error) {
        console.error('Error fetching logo:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLogo();
  }, [companyName, getCacheKey]);

  if (isLoading) {
    return <div className="w-6 h-6 animate-pulse bg-gray-200 dark:bg-gray-700 rounded-full" />;
  }

  if (!logoUrl) {
    return (
      <div className='w-12 h-12 relative flex items-center justify-center'>
        <div className="w-6 h-6 bg-gray-200 dark:bg-gray-700 rounded-full" />
      </div>
    );
  }

  return (
    <div className="relative h-12 w-12">
      <Image
        src={logoUrl}
        alt={`${companyName} logo`}
        fill
        className="rounded-md object-contain"
        onError={() => setLogoUrl('')}
        unoptimized
        sizes="48px"
      />
    </div>
  );
};

export default CompanyLogo;