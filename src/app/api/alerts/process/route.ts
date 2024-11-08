import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { Resend } from 'resend';

// Prisma client with connection retry logic
const prismaClientSingleton = () => {
  return new PrismaClient().$extends({
    query: {
      async $allOperations({ operation, model, args, query }) {
        const maxRetries = 3;
        let retries = 0;

        while (retries < maxRetries) {
          try {
            return await query(args);
          } catch (error) {
            retries++;
            if (retries === maxRetries) throw error;

            // Wait before retrying
            await new Promise(resolve => setTimeout(resolve, 1000 * retries));

            // Create new client if there's a connection error
            if (error.code === '42P05') {
              globalForPrisma.prisma = new PrismaClient();
            }
          }
        }
      },
    },
  });
};

const globalForPrisma = globalThis as unknown as {
  prisma: ReturnType<typeof prismaClientSingleton> | undefined;
};

const prisma = globalForPrisma.prisma ?? prismaClientSingleton();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

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

export async function GET() {
  let client: ReturnType<typeof prismaClientSingleton> | undefined;

  try {
    // Create a new client instance for this request
    client = new PrismaClient();

    const subscriptions = await client.subscription.findMany();
    const processedResults: ProcessResult[] = [];
    const now = new Date();

    for (const subscription of subscriptions) {
      try {
        const lastNotified = new Date(subscription.lastNotified);

        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/fetchJobs`);
        if (!response.ok) {
          throw new Error('Failed to fetch jobs');
        }

        const { listings } = await response.json();

        const matchingListings = listings.filter((listing: Listing) => {
          const listingDate = new Date(listing.datePosted);
          if (listingDate <= lastNotified) return false;

          const criteria = subscription.criteria as Criterion[];

          return criteria?.some((criterion: Criterion) => {
            const value = listing[criterion.type === 'keyword' ? 'title' : criterion.type].toLowerCase();
            return value.includes(criterion.value.toLowerCase());
          }) ?? false;
        });

        if (matchingListings.length > 0) {
          await resend.emails.send({
            from: 'Scout <notifications@scout.yourdomain.com>',
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
                </div>
              `).join('')}
            `,
          });

          await client.subscription.update({
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

    return NextResponse.json({
      success: true,
      processed: processedResults
    });
  } catch (error) {
    console.error('Error processing alerts:', error);
    return NextResponse.json(
      { error: 'Failed to process alerts', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  } finally {
    // Always disconnect the client in serverless environment
    if (client) {
      await client.$disconnect();
    }
  }
}