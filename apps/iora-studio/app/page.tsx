import type { Metadata } from 'next'
import HomePage from './home/page'
import { createPageMetadata } from '../lib/seo'

export const metadata: Metadata = createPageMetadata({
  title: '홈',
  description:
    'AI 기반 웹 제작, React 중심 맞춤형 구축, 유지보수를 한 번에 제공하는 이오라 스튜디오 메인 페이지입니다.',
  path: '/',
})

export default HomePage
