import React from 'react';
import { Briefcase, MapPin, Calendar, ExternalLink, DollarSign, GraduationCap } from 'lucide-react';
import CompanyLogo from '@/components/CompanyLogo';

type ListingCardProps = {
  listing: {
    title: string;
    link: string;
    location: string;
    datePosted: string;
    company: string;
    salary: string;
    jobType: string;
  };
  ref?: React.RefObject<HTMLDivElement>;
};

const ListingCard = React.forwardRef<HTMLDivElement, ListingCardProps>(({ listing }, ref) => {
  return (
    <div
      ref={ref}
      className="group overflow-hidden  relative p-[1px] rounded-lg duration-200 "
    >
      <div
        className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{
          background: 'conic-gradient(from 0deg at 50% 50%, #3B82F6 0deg, #6366F1 90deg, #8B5CF6 180deg, #6366F1 270deg, #3B82F6 360deg)',
          animation: 'spin 5s linear infinite',
          filter: 'blur(50px)',
        }}
      />

      <div className="relative bg-gray-900 rounded-lg border border-gray-700/20">
        <div className="absolute inset-0 rounded-lg bg-transparent transition-all duration-300 group-hover:bg-blue-500/5">
          <div
            className="absolute inset-0 rounded-lg transition-all duration-300 opacity-0 group-hover:opacity-100"
            style={{
              background: 'radial-gradient(circle at center, rgba(99, 102, 241, 0.15) 0%, transparent 70%)',
              transform: 'scale(1.1)',
            }}
          />
        </div>

        <a
          href={listing.link}
          className="relative block p-3 transition-colors duration-200"
          target="_blank"
          rel="noopener noreferrer"
        >
          <div className='flex justify-start items-center'>
            <div className='pr-4'>
              <CompanyLogo companyName={listing.company} />
            </div>
            <div className="flex-1 space-y-1">
              <div className="flex items-center gap-2 text-gray-400 text-xs">
                <div className="flex items-center gap-2">
                  <Briefcase className="w-4 h-4" />
                  <span className="font-medium">{listing.company}</span>
                </div>
              </div>

              <h2 className="text-sm text-gray-100">
                {listing.title}
              </h2>

              <div className="flex flex-wrap wrap gap-x-4 gap-y-1 text-xs text-gray-400">
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
                <div className="flex items-center gap-1">
                  <GraduationCap className="w-4 h-4" />
                  <span>{listing.jobType == "internship" ? "Internship" : "New Grad"}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center mt-2 p-5 sm:mt-0">
              <ExternalLink className="w-5 h-5" />
            </div>
          </div>
        </a>
      </div>

      <style jsx global>{`
        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
});

ListingCard.displayName = 'ListingCard';

export default ListingCard;