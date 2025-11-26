import Head from 'next/head';
import { useEffect, useMemo } from 'react';

export function useSeo({
  title = 'Sorsogon Tourism',
  description = 'Discover the best of Sorsogon - beautiful destinations, exciting activities, and local experiences.',
  keywords = 'Sorsogon, tourism, travel, Philippines, beaches, adventure, culture',
  image = '/images/default-og.jpg',
  url = typeof window !== 'undefined' ? window.location.href : '',
  type = 'website',
  author = '',
  publishedTime = '',
  modifiedTime = '',
  section = 'Travel',
  tags = [],
  noIndex = false,
  noFollow = false,
  canonicalUrl = '',
  locale = 'en_US',
  siteName = 'Sorsogon Tourism',
  twitterCard = 'summary_large_image',
  twitterSite = '@sorsogontourism',
  twitterCreator = '@sorsogontourism',
  facebookAppId = '',
} = {}) {
  // Generate full image URL
  const fullImageUrl = useMemo(() => {
    if (!image) return '';
    if (image.startsWith('http') || image.startsWith('//')) return image;
    return `${process.env.NEXT_PUBLIC_SITE_URL || ''}${image}`;
  }, [image]);

  // Generate full canonical URL
  const fullCanonicalUrl = useMemo(() => {
    if (canonicalUrl) {
      return canonicalUrl.startsWith('http') 
        ? canonicalUrl 
        : `${process.env.NEXT_PUBLIC_SITE_URL || ''}${canonicalUrl}`;
    }
    return url;
  }, [canonicalUrl, url]);

  // Generate meta robots content
  const robotsContent = useMemo(() => {
    const directives = [];
    if (noIndex) directives.push('noindex');
    if (noFollow) directives.push('nofollow');
    return directives.length > 0 ? directives.join(', ') : 'index, follow';
  }, [noIndex, noFollow]);

  // Generate meta tags
  const metaTags = useMemo(() => {
    const tags = [
      // Basic
      { name: 'description', content: description },
      { name: 'keywords', content: keywords },
      { name: 'author', content: author },
      { name: 'robots', content: robotsContent },
      
      // Open Graph / Facebook
      { property: 'og:title', content: title },
      { property: 'og:description', content: description },
      { property: 'og:type', content: type },
      { property: 'og:url', content: url },
      { property: 'og:site_name', content: siteName },
      { property: 'og:locale', content: locale },
      
      // Twitter
      { name: 'twitter:card', content: twitterCard },
      { name: 'twitter:title', content: title },
      { name: 'twitter:description', content: description },
      { name: 'twitter:site', content: twitterSite },
      { name: 'twitter:creator', content: twitterCreator },
      
      // Article specific
      ...(type === 'article' ? [
        { property: 'article:published_time', content: publishedTime },
        { property: 'article:modified_time', content: modifiedTime || publishedTime },
        { property: 'article:section', content: section },
        ...tags.map(tag => ({ property: 'article:tag', content: tag })),
      ] : []),
    ];

    // Add image tags if image is provided
    if (fullImageUrl) {
      tags.push(
        { property: 'og:image', content: fullImageUrl },
        { name: 'twitter:image', content: fullImageUrl }
      );
    }

    // Add Facebook App ID if provided
    if (facebookAppId) {
      tags.push({ property: 'fb:app_id', content: facebookAppId });
    }

    return tags;
  }, [
    title, description, keywords, author, robotsContent, type, url, siteName, locale,
    twitterCard, twitterSite, twitterCreator, fullImageUrl, facebookAppId,
    publishedTime, modifiedTime, section, tags
  ]);

  // Update document title
  useEffect(() => {
    document.title = title;
    return () => {
      document.title = 'Sorsogon Tourism';
    };
  }, [title]);

  // Component to render in your page
  const SeoHead = () => (
    <Head>
      <title>{title}</title>
      {metaTags.map((tag, index) => (
        <meta key={index} {...tag} />
      ))}
      {fullCanonicalUrl && <link rel="canonical" href={fullCanonicalUrl} />}
      
      {/* Favicon */}
      <link rel="icon" href="/favicon.ico" />
      <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
      <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
      <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
      <link rel="manifest" href="/site.webmanifest" />
      
      {/* Additional SEO */}
      <meta name="theme-color" content="#1e40af" />
      <meta name="msapplication-TileColor" content="#1e40af" />
    </Head>
  );

  return { SeoHead };
}

// Helper hook for story SEO
export function useStorySeo(story = {}) {
  const {
    title = '',
    content = '',
    excerpt = '',
    image_url = '',
    created_at = '',
    updated_at = '',
    tags = [],
    author_name = '',
    slug = ''
  } = story;

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || '';
  const url = `${siteUrl}/stories/${slug}`;
  
  return useSeo({
    title: title ? `${title} | Sorsogon Stories` : 'Sorsogon Stories',
    description: excerpt || (content ? `${content.substring(0, 160)}...` : ''),
    image: image_url,
    url,
    type: 'article',
    author: author_name,
    publishedTime: created_at,
    modifiedTime: updated_at || created_at,
    section: 'Travel Stories',
    tags: Array.isArray(tags) ? tags : [],
  });
}

// Helper hook for destination SEO
export function useDestinationSeo(destination = {}) {
  const {
    name = '',
    description = '',
    short_description = '',
    cover_image = '',
    slug = ''
  } = destination;

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || '';
  const url = `${siteUrl}/destinations/${slug}`;
  
  return useSeo({
    title: name ? `${name} | Sorsogon Destinations` : 'Sorsogon Destinations',
    description: short_description || description || 'Discover this amazing destination in Sorsogon, Philippines.',
    image: cover_image,
    url,
    type: 'place',
  });
}
