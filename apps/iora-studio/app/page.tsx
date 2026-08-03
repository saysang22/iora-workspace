import type { Metadata } from 'next'
import HomePageContent from './home/HomePageContent'
import { absoluteUrl, createWebsiteJsonLd, DEFAULT_OG_IMAGE, SITE_NAME } from '../lib/seo'

const description =
  'AI 기반 웹 제작, React 중심 맞춤형 구축, 유지보수를 한 번에 제공하는 이오라 스튜디오 메인 페이지입니다.'

export const metadata: Metadata = {
  title: {
    absolute: SITE_NAME,
  },
  description,
  alternates: {
    canonical: absoluteUrl('/'),
  },
  openGraph: {
    title: SITE_NAME,
    description,
    url: absoluteUrl('/'),
    siteName: SITE_NAME,
    type: 'website',
    locale: 'ko_KR',
    images: [{ url: absoluteUrl(DEFAULT_OG_IMAGE) }],
  },
  twitter: {
    card: 'summary_large_image',
    title: SITE_NAME,
    description,
    images: [absoluteUrl(DEFAULT_OG_IMAGE)],
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function Page() {
  const websiteJsonLd = createWebsiteJsonLd()

  return (
    <>
      <script
        id='website-jsonld'
        type='application/ld+json'
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
      />
      <HomePageContent />
    </>
  )
}
