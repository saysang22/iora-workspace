import type { Metadata } from 'next'

export const SITE_URL = 'https://www.iora-studio.com'
export const SITE_NAME = '이오라 스튜디오'
export const DEFAULT_DESCRIPTION =
  '홈페이지 제작과 맞춤형 웹서비스 개발을 제공하는 이오라 스튜디오'
export const DEFAULT_OG_IMAGE = '/images/home/banner.png'
export const BUSINESS_NUMBER = '160-01-03816'
export const REPRESENTATIVE_NAME = '김민서'
export const BUSINESS_PHONE = '010-8318-6080'
export const BUSINESS_PHONE_HREF = `tel:${BUSINESS_PHONE.replace(/-/g, '')}`
export const BUSINESS_ADDRESS =
  '부산광역시 강서구 신호이로 29, 5층 505호(신호동, 신호프라자)'

type PageMetadataOptions = {
  title: string
  description: string
  path: string
  image?: string
  type?: 'website' | 'article'
  robots?: {
    index: boolean
    follow: boolean
  }
}

export function absoluteUrl(path: string) {
  return new URL(path, SITE_URL).toString()
}

export function createPageMetadata({
  title,
  description,
  path,
  image = DEFAULT_OG_IMAGE,
  type = 'website',
  robots = {
    index: true,
    follow: true,
  },
}: PageMetadataOptions): Metadata {
  const canonical = absoluteUrl(path)
  const imageUrl = absoluteUrl(image)

  return {
    title,
    description,
    alternates: {
      canonical,
    },
    openGraph: {
      title: `${title} | ${SITE_NAME}`,
      description,
      url: canonical,
      siteName: SITE_NAME,
      type,
      locale: 'ko_KR',
      images: [{ url: imageUrl }],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${title} | ${SITE_NAME}`,
      description,
      images: [imageUrl],
    },
    robots,
  }
}

export const NO_INDEX_METADATA: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
}

export function createOrganizationJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: SITE_NAME,
    url: SITE_URL,
    description: DEFAULT_DESCRIPTION,
    identifier: BUSINESS_NUMBER,
    founder: REPRESENTATIVE_NAME,
    telephone: BUSINESS_PHONE,
    address: {
      '@type': 'PostalAddress',
      streetAddress: BUSINESS_ADDRESS,
      addressCountry: 'KR',
    },
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'customer support',
      telephone: BUSINESS_PHONE,
      areaServed: 'KR',
      availableLanguage: ['ko'],
    },
  }
}

export function createWebsiteJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE_NAME,
    url: SITE_URL,
    description: DEFAULT_DESCRIPTION,
  }
}
