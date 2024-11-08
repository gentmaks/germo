import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { Resend } from 'resend';

const prisma = new PrismaClient();
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

export async function GET() {
  try {
    const subscriptions = await prisma.subscription.findMany();
    const now = new Date();

    for (const subscription of subscriptions) {
      const lastNotified = new Date(subscription.lastNotified);

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/fetchJobs`);
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

        await prisma.subscription.update({
          where: { id: subscription.id },
          data: { lastNotified: now.toISOString() },
        });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error processing alerts:', error);
    return NextResponse.json(
      { error: 'Failed to process alerts' },
      { status: 500 }
    );
  }
}
