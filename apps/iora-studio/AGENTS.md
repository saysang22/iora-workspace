<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.

<!-- END:nextjs-agent-rules -->

# Project Rules

## Global Rules

- 반드시 `/WORK/harness/web/AGENTS.md`의 모든 규칙을 우선 적용할 것.
- 규칙 충돌 시 `/WORK/harness/web/AGENTS.md`를 최우선으로 따른다.

## Component Rules

- 신규 컴포넌트 생성 전 반드시 `/WORK/components/src`를 먼저 탐색할 것.
- 공통 컴포넌트는 반드시 `/WORK/components/src`에서 import 하여 사용한다.
- 동일하거나 유사한 컴포넌트가 존재하면 재사용할 것.
- `/WORK/components/src`에 존재하지 않는 경우에만 신규 컴포넌트 생성이 가능하다.
- 기존 컴포넌트 수정이 가능한 경우 신규 컴포넌트 생성을 금지한다.

## Data Rules

- 페이지 데이터는 props를 통해 컴포넌트에 전달한다.
- 컴포넌트 내부에 하드코딩된 Mock Data를 작성하지 않는다.

## Next.js Rules

- App Router만 사용.
- Pages Router 사용 금지.
- Server Component를 기본으로 사용.
- Client Component는 필요한 경우에만 'use client' 선언.
- src 폴더 생성을 금지한다.
- 현재 프로젝트 폴더 구조를 유지한다.

## Image Rules

### Logo

- 반드시 logo: `/public/images/logo/light_logo.svg` 사용
- 로고 파일을 새로 생성하지 않는다.
- 텍스트로 로고를 대체하지 않는다.
- 다른 로고 생성 금지

### Home Images

- 메인 페이지 이미지는 `/public/images/home/` 내 파일만 사용
- 외부 이미지 URL 사용 금지
- placeholder 이미지 사용 금지
- 존재하지 않는 파일명 추측 금지

## Asset Rules

- 이미지 경로를 하드코딩하지 말고 상수로 관리할 것.
- 존재하지 않는 이미지 파일명을 추측하지 말 것.
- 지정된 경로의 파일만 사용할 것.
