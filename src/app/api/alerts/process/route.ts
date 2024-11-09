import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { Resend } from 'resend';

// Type for the transaction client
type TransactionClient = Omit<
  PrismaClient,
  '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'
>;

const resend = new Resend(process.env.RESEND_API_KEY);

type Listing = {
  title: string;
  company: string;
  location: string;
  link: string;
  datePosted: string;
};

type Criterion = {
  type: 'company' | 'location' | 'keyword';
  value: string;
};

type ProcessResult = {
  email: string;
  matchedListings?: number;
  error?: string;
  success: boolean;
};

// Helper function to parse various date formats
function parseListingDate(dateStr: string): Date {
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();

  // Try MM/DD/YYYY format
  const slashDate = dateStr.match(/(\d{1,2})\/(\d{1,2})\/(\d{4})/);
  if (slashDate) {
    const [, month, day, year] = slashDate;
    // Adjust year if it's in the future
    const parsedDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    if (parsedDate > currentDate) {
      parsedDate.setFullYear(currentYear - 1);
    }
    return parsedDate;
  }

  // Try Month Day format (e.g., "March 5")
  const monthDayDate = dateStr.match(/([A-Za-z]+)\s+(\d{1,2})/);
  if (monthDayDate) {
    const [, month, day] = monthDayDate;
    // First try with current year
    const parsedDate = new Date(`${month} ${day}, ${currentYear}`);

    // If the date is in the future, use previous year
    if (parsedDate > currentDate) {
      parsedDate.setFullYear(currentYear - 1);
    }
    return parsedDate;
  }

  // If no format matches, throw error
  throw new Error(`Unable to parse date: ${dateStr}`);
}

export async function GET() {
  let localPrisma: PrismaClient | null = null;

  try {
    localPrisma = new PrismaClient({
      log: ['error', 'warn'],
    });
    await localPrisma.$connect();

    const result = await localPrisma.$transaction(async (tx: TransactionClient) => {
      const processedResults: ProcessResult[] = [];

      const subscriptions = await tx.subscription.findMany({
        select: {
          id: true,
          email: true,
          lastNotified: true,
          criteria: true,
        },
      });

      const now = new Date();

      for (const subscription of subscriptions) {
        try {
          const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/fetchJobs`);
          if (!response.ok) {
            throw new Error('Failed to fetch jobs');
          }

          const { listings } = await response.json();

          const matchingListings = listings.filter((listing: Listing) => {
            try {
              const listingDate = parseListingDate(listing.datePosted);
              const lastNotifiedUTC = new Date(subscription.lastNotified);

              // For debugging
              console.log('Listing Date:', listingDate.toISOString());
              console.log('Last Notified:', lastNotifiedUTC.toISOString());

              // Compare dates ignoring time
              const listingDateString = listingDate.toISOString().split('T')[0];
              const lastNotifiedString = lastNotifiedUTC.toISOString().split('T')[0];

              if (listingDateString <= lastNotifiedString) return false;

              const criteria = subscription.criteria as Criterion[];

              return criteria?.some((criterion: Criterion) => {
                const value = listing[criterion.type === 'keyword' ? 'title' : criterion.type].toLowerCase();
                return value.includes(criterion.value.toLowerCase());
              }) ?? false;
            } catch (error) {
              console.error(`Error parsing date for listing:`, error);
              return false;
            }
          });

          if (matchingListings.length > 0) {
            await resend.emails.send({
              from: 'Scout <onboarding@resend.dev>',
              to: subscription.email,
              subject: 'New Job Listings Match Your Criteria',
              html: `
                <h1>New Job Listings</h1>
                <p>We found ${matchingListings.length} new listings matching your criteria:</p>
                ${matchingListings.map((listing: Listing) => `
                  <div style="margin-bottom: 20px;">
                    <h2>${listing.title}</h2>
                    <p><strong>${listing.company}</strong> - ${listing.location}</p>
                    <p><a href="${listing.link}">View Listing</a></p>
                    <p>Posted: ${listing.datePosted}</p>
                  </div>
                `).join('')}
              `,
            });

            await tx.subscription.update({
              where: { id: subscription.id },
              data: { lastNotified: now },
            });

            processedResults.push({
              email: subscription.email,
              matchedListings: matchingListings.length,
              success: true,
            });
          }
        } catch (error) {
          console.error(`Error processing subscription ${subscription.id}:`, error);
          processedResults.push({
            email: subscription.email,
            error: 'Failed to process subscription',
            success: false,
          });
        }
      }

      return processedResults;
    });

    return NextResponse.json({
      success: true,
      processed: result
    });
  } catch (error) {
    console.error('Error processing alerts:', error);
    return NextResponse.json(
      { error: 'Failed to process alerts', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  } finally {
    if (localPrisma) {
      await localPrisma.$disconnect();
    }
  }
}