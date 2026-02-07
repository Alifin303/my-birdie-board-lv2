import { Head } from "vite-react-ssg";
import { useLocation } from "react-router-dom";
import { SITE_CONFIG } from "@/lib/seo";

interface SEOHeadProps {
  title: string;
  description: string;
  keywords?: string;
  canonicalPath?: string; // Override auto-detected path if needed
  ogType?: string;
  ogImage?: string;
  lastModified?: string;
  children?: React.ReactNode;
}

/**
 * Shared SEO <head> component. Automatically sets canonical URL
 * from the current route path unless explicitly overridden.
 */
export const SEOHead = ({
  title,
  description,
  keywords,
  canonicalPath,
  ogType = "website",
  ogImage = SITE_CONFIG.ogImage,
  lastModified,
  children,
}: SEOHeadProps) => {
  const { pathname } = useLocation();
  const path = canonicalPath ?? pathname;
  // Remove trailing slash except for root
  const normalizedPath = path === "/" ? "/" : path.replace(/\/+$/, "");
  const canonicalUrl = `${SITE_CONFIG.url}${normalizedPath}`;

  return (
    <Head>
      <title>{title}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={canonicalUrl} />
      {keywords && <meta name="keywords" content={keywords} />}
      {lastModified && <meta name="lastmod" content={lastModified} />}

      {/* Open Graph */}
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:type" content={ogType} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:image:alt" content={title} />
      {lastModified && (
        <meta property="article:modified_time" content={lastModified} />
      )}

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />
      <meta name="twitter:image:alt" content={title} />

      {children}
    </Head>
  );
};
