# Web Style Rules

## 코드 스타일

- 들여쓰기 2칸
- SCSS 사용
- 기본 글꼴은 산세리프 사용
- 한글 폰트 우선순위: `Noto Sans KR`, `Pretendard`
- 영문 폰트 우선순위: `Inter`, `Roboto`
- 권장 `font-family`: `Inter`, `Roboto`, `Noto Sans KR`, `Pretendard`, `sans-serif`

---

## 네이밍 규칙

- 변수/함수: camelCase
- 컴포넌트: PascalCase
- 상수: UPPER_CASE
- CSS 클래스: camelCase

---

## React 규칙

- 함수형 컴포넌트만 사용
- props 명확히 정의
- 불필요한 state 사용 금지

---

## HTML 태그 사용 규칙

- 의미 없는 `<div>` 남발 금지
- 의미 있는 레이아웃/콘텐츠에는 semantic 태그 우선 사용
  - 예: `<header>`, `<main>`, `<section>`, `<article>`, `<nav>`, `<footer>` 등
- 단순 래핑이 필요한 경우에만 `<div>` 사용

## 구조 규칙

- 한 파일 = 한 주요 컴포넌트 (필요 시 작은 보조 컴포넌트는 동일 파일 내 허용)
- 컴포넌트는 작게 유지
- 로직과 UI 분리
- 변수: `_variables.scss`
- 함수: `_functions.scss`
- 믹스인: `_mixins.scss`
- abstracts 디렉토리에 위치
- SCSS nesting은 최대 3 depth까지만 허용
- 공통 변수/함수/믹스인은 중복 정의 금지, 반드시 재사용
- SCSS는 컴포넌트가 위치한 곳에 독립 모듈로 컴포넌트명.module.scss으로 생성

---

## 레이아웃 / 공통 컴포넌트 규칙

- `Header`, `Footer`, `Layout` 등 공통 레이아웃 컴포넌트는 반드시 기존 컴포넌트만 재사용한다.
- 같은 역할의 새로운 컴포넌트(`Header2`, `SubHeader`, `PageFooter` 등)를 생성하는 것 금지.
- 페이지별로 스타일이 다른 경우에도, 공통 컴포넌트 안에서 props / className으로 분기한다.
- 새로운 레이아웃 컴포넌트가 꼭 필요하다면, 먼저 기존 구조 검토 후 명시적 요청이 있을 때만 생성한다.
- 아래 컴포넌트는 재사용이 기본이며, 새로 만들지 않는다:
  - `Button`
  - `Modal`
  - `Header`
  - `Footer`
  - `Table`
  - `Board`
  - `BoardDetail`
  - `BoardWrite`
  - `Login`
  - `CheckBox`
  - `Input`
  - `RadioButton`
  - `SelectBox`

- 위 컴포넌트는 `/components/common` 디렉토리에 위치한다. (새 위치 생성 금지)
- 동일 역할의 새 컴포넌트(`PrimaryButton`, `CustomModal` 등) 생성 금지.
- 스타일/색상/사이즈가 다른 변형이 필요하면, 기존 공통 컴포넌트에 props를 추가하는 방식으로만 확장한다.
- 스타일 변경은 명시적으로 요청된 버그/요구사항 범위 내에서만 허용한다.
- 기존 컴포넌트/스타일/구조를 먼저 탐색하고 재사용을 우선한다

## Tailwind / CSS

- inline style은 조건부 렌더링/간단한 show/hide 수준에서만 사용 (레이아웃/색상/타이포그래피는 SCSS에서 관리)
- Tailwind 사용 금지

---

## 금지 행동

- 임의 스타일 변경
- 불필요한 리팩토링
- 클래스명 변경
- 구조 변경

---

## Diff 규칙

- 스타일 목적의 변경으로 diff 발생 금지
- 기존 코드 스타일 유지
