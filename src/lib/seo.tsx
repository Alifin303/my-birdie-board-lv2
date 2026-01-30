import React from "react";

// SEO Configuration Constants
export const SITE_CONFIG = {
  name: "MyBirdieBoard",
  tagline: "Golf Score Tracking & Handicap Calculator",
  url: "https://mybirdieboard.com",
  logo: "https://mybirdieboard.com/logo.png",
  ogImage: "https://mybirdieboard.com/og-image.png",
  twitter: "@mybirdieboard",
  description: "Track golf scores, calculate your handicap, and improve your game with MyBirdieBoard.",
};

// Organization Schema - used site-wide
export const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "@id": `${SITE_CONFIG.url}/#organization`,
  name: SITE_CONFIG.name,
  url: SITE_CONFIG.url,
  logo: {
    "@type": "ImageObject",
    url: SITE_CONFIG.logo,
    width: 512,
    height: 512,
  },
  sameAs: [
    "https://twitter.com/mybirdieboard",
    "https://facebook.com/mybirdieboard",
  ],
  contactPoint: {
    "@type": "ContactPoint",
    contactType: "customer support",
    url: `${SITE_CONFIG.url}/faq`,
  },
};

// WebSite Schema - used on homepage
export const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": `${SITE_CONFIG.url}/#website`,
  name: SITE_CONFIG.name,
  url: SITE_CONFIG.url,
  description: SITE_CONFIG.description,
  publisher: {
    "@id": `${SITE_CONFIG.url}/#organization`,
  },
  potentialAction: {
    "@type": "SearchAction",
    target: {
      "@type": "EntryPoint",
      urlTemplate: `${SITE_CONFIG.url}/courses?search={search_term_string}`,
    },
    "query-input": "required name=search_term_string",
  },
};

// Helper to generate breadcrumb schema
export const generateBreadcrumbSchema = (items: { name: string; url: string }[]) => ({
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: items.map((item, index) => ({
    "@type": "ListItem",
    position: index + 1,
    name: item.name,
    item: item.url,
  })),
});

// Helper to generate article schema for blog posts
export const generateArticleSchema = ({
  title,
  description,
  url,
  datePublished,
  dateModified,
  author = "MyBirdieBoard Team",
  image,
}: {
  title: string;
  description: string;
  url: string;
  datePublished: string;
  dateModified?: string;
  author?: string;
  image?: string;
}) => ({
  "@context": "https://schema.org",
  "@type": "Article",
  headline: title,
  description,
  url,
  datePublished,
  dateModified: dateModified || datePublished,
  author: {
    "@type": "Person",
    name: author,
  },
  publisher: {
    "@id": `${SITE_CONFIG.url}/#organization`,
  },
  image: image || SITE_CONFIG.ogImage,
  mainEntityOfPage: {
    "@type": "WebPage",
    "@id": url,
  },
});

// Helper to generate FAQ schema
export const generateFAQSchema = (faqs: { question: string; answer: string }[]) => ({
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map((faq) => ({
    "@type": "Question",
    name: faq.question,
    acceptedAnswer: {
      "@type": "Answer",
      text: faq.answer,
    },
  })),
});

// SEO page metadata definitions - titles <60 chars, descriptions <160 chars
export const SEO_PAGES = {
  home: {
    title: "Golf Score Tracker & Handicap Calculator | MyBirdieBoard",
    description: "Track golf scores, calculate handicap, analyze performance. Free to start with 4 rounds. Join golfers improving their game with MyBirdieBoard.",
  },
  about: {
    title: "About Us - Golf Score Tracking App | MyBirdieBoard",
    description: "MyBirdieBoard is a distraction-free golf score tracker. Log rounds after you play, track handicap, and compete on course leaderboards.",
  },
  faq: {
    title: "Golf Score Tracking FAQ | MyBirdieBoard",
    description: "Answers to common golf tracking questions. Learn about handicaps, Stableford scoring, subscriptions, and how to add courses.",
  },
  blog: {
    title: "Golf Tips & Insights Blog | MyBirdieBoard",
    description: "Expert golf tips, equipment reviews, technique guides, and course management strategies to improve your game.",
  },
  courses: {
    title: "Golf Courses Directory | MyBirdieBoard",
    description: "Browse golf courses with player stats and leaderboards. Find courses by location and compare your scores with other golfers.",
  },
  golfEquipment: {
    title: "Best Golf Equipment 2025 | MyBirdieBoard",
    description: "Discover top golf equipment for 2025. GPS watches, clubs, balls, and gear to improve your game. Expert reviews included.",
  },
  golfTips: {
    title: "Golf Tips to Lower Your Scores | MyBirdieBoard",
    description: "Expert golf tips for swing, short game, course management, and practice. Data-driven strategies to improve fast.",
  },
  golfLessons: {
    title: "Find Golf Lessons Near You | MyBirdieBoard",
    description: "Find golf lessons and professional instruction. Private lessons, group classes, online coaching, and golf clinics.",
  },
  privacy: {
    title: "Privacy Policy | MyBirdieBoard",
    description: "Learn how MyBirdieBoard protects and handles your data. Our commitment to your privacy and security.",
  },
  handicapCalculator: {
    title: "Golf Handicap Calculator Guide | MyBirdieBoard",
    description: "Learn how to calculate your golf handicap step by step using the World Handicap System. Free handicap tracking.",
  },
  trackScores: {
    title: "How to Track Golf Scores | MyBirdieBoard",
    description: "Complete guide to tracking golf scores effectively. Digital vs paper, best practices, and improvement tips.",
  },
  bestApps: {
    title: "Best Golf Score Apps 2025 | MyBirdieBoard",
    description: "Compare the best golf score tracking apps. Features, pricing, and which app is right for your game.",
  },
  analytics: {
    title: "Golf Performance Analytics Guide | MyBirdieBoard",
    description: "Use data to improve your golf game. Learn to analyze stats, identify weaknesses, and track progress.",
  },
  statsTracker: {
    title: "Golf Statistics Tracker Guide | MyBirdieBoard",
    description: "Track key golf statistics to improve your game. Fairways, greens in regulation, putts, and more.",
  },
};

// Component to render JSON-LD scripts
interface JsonLdProps {
  data: object | object[];
}

export const JsonLd: React.FC<JsonLdProps> = ({ data }) => {
  const schemas = Array.isArray(data) ? data : [data];
  
  return (
    <>
      {schemas.map((schema, index) => (
        <script
          key={index}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}
    </>
  );
};
