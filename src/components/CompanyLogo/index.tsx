import { useState, useEffect } from 'react';
import Image from 'next/image';

interface CompanyLogoProps {
  companyName: string;
}

// Type for the API response
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

  useEffect(() => {
    const logoCache = JSON.parse(localStorage.getItem('companyLogos') || '{}');

    const fetchLogo = async () => {
      if (logoCache[companyName]) {
        setLogoUrl(logoCache[companyName]);
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch(`https://api.brandfetch.io/v2/search/${encodeURIComponent(companyName)}`, {
          headers: {
            'Authorization': 'Bearer 1idGxgGDGaeL9nvXFW6'
          }
        });

        const data = await response.json() as BrandSearchResult[];

        if (data && data.length > 0 && data[0].icon) {
          const newLogoUrl = data[0].icon;
          setLogoUrl(newLogoUrl);

          // Update cache
          const updatedCache = { ...logoCache, [companyName]: newLogoUrl };
          localStorage.setItem('companyLogos', JSON.stringify(updatedCache));
        }
      } catch (error) {
        console.error('Error fetching logo:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLogo();
  }, [companyName]);

  if (isLoading) {
    return <div className="w-6 h-6 animate-pulse bg-gray-200 dark:bg-gray-700 rounded-full" />;
  }

  if (!logoUrl) {
    return null;
  }

  return (
    <div className="relative h-12 w-12">
      <Image
        src={logoUrl}
        alt={`${companyName} logo`}
        fill
        className="rounded-2xl object-contain"
        onError={() => setLogoUrl('')}
        unoptimized
        sizes="48px"
      />
    </div>
  );
};

export default CompanyLogo;