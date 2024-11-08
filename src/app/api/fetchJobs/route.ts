import { NextResponse } from 'next/server';
import axios from 'axios';
import * as cheerio from 'cheerio';
import { marked } from 'marked';

type Listing = {
  company: string;
  title: string;
  location: string;
  link: string;
  datePosted: string;
  salary: string;
};

function ageToDate(age: string): string {
  const match = age.match(/(\d+)d/);
  if (!match) return age;

  const daysAgo = parseInt(match[1]);
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);

  return date.toLocaleDateString('en-US', {
    month: '2-digit',
    day: '2-digit',
    year: 'numeric'
  });
}

async function fetchScoutListings(): Promise<Listing[]> {
  const url = 'https://raw.githubusercontent.com/cvrve/Summer2025-Internships/dev/README.md';
  const { data } = await axios.get(url);
  const htmlContent = await marked(data);
  const $ = cheerio.load(htmlContent);
  const listings: Listing[] = [];
  const salary = '';

  const rows = $('table tbody tr');
  let prevCompany = "";

  rows.each((_, element) => {
    let company = $(element).find('td').eq(0).text().trim();
    if (company === "↳") {
      company = prevCompany;
    } else {
      prevCompany = company;
    }

    const title = $(element).find('td').eq(1).text().trim();
    const location = $(element).find('td').eq(2).text().trim();
    const link = $(element).find('td').eq(3).find('a').attr('href') || '';
    if (link == '') {
      return true
    }
    const datePosted = $(element).find('td').eq(4).text().trim();

    listings.push({ company, title, location, link, datePosted, salary });
  });

  return listings;
}

async function fetchSpeedyApplyListings(): Promise<Listing[]> {
  const url = 'https://raw.githubusercontent.com/speedyapply/2025-SWE-College-Jobs/refs/heads/main/README.md';
  const { data } = await axios.get(url);
  const htmlContent = await marked(data);
  const $ = cheerio.load(htmlContent);
  const listings: Listing[] = [];

  $('table').each((_, table) => {
    const rows = $(table).find('tbody tr');

    rows.each((_, element) => {
      const company = $(element).find('td').eq(0).text().trim();
      const title = $(element).find('td').eq(1).text().trim();
      const location = $(element).find('td').eq(2).text().trim();
      let link = ''
      let salary = ''
      let age = ''
      if ($(element).find('td').eq(3).text().includes('$')) {
        salary = $(element).find('td').eq(3).text().trim();
        link = $(element).find('td').eq(4).find('a').attr('href') || '';
        age = $(element).find('td').eq(5).text().trim();
      } else {
        link = $(element).find('td').eq(3).find('a').attr('href') || '';
        age = $(element).find('td').eq(4).text().trim();
      }
      const datePosted = ageToDate(age);

      if (company && title) {
        listings.push({ company, title, location, link, datePosted, salary });
      }
    });
  });

  return listings;
}


export async function GET() {
  try {
    const [scoutListings, speedyApplyListings] = await Promise.all([
      fetchScoutListings(),
      fetchSpeedyApplyListings()
    ]);

    const allListings = [...scoutListings, ...speedyApplyListings];

    // Remove duplicates based on company and title combination
    const uniqueListings = allListings.filter((listing, index, self) =>
      index === self.findIndex((l) =>
        l.company === listing.company && l.title === listing.title
      )
    );

    // Sort by date posted (most recent first)
    const sortedListings = uniqueListings.sort((a, b) => {
      const dateA = new Date(a.datePosted);
      const dateB = new Date(b.datePosted);
      return dateB.getTime() - dateA.getTime();
    });

    return NextResponse.json({
      listings: sortedListings,
      metadata: {
        total: sortedListings.length,
        sources: {
          scout: scoutListings.length,
          speedyApply: speedyApplyListings.length
        }
      }
    });
  } catch (err) {
    console.error('Error fetching listings:', err);
    return NextResponse.json(
      { error: 'Failed to fetch data', details: err instanceof Error ? err.message : 'Unknown error' },
      { status: 500 }
    );
  }
}