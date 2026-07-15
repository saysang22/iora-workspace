# AGENTS.md

## CORE RULES (최우선, 절대 위반 금지)

이 규칙은 모든 다른 규칙보다 우선한다.

- 기존 이름 변경 금지 (Breaking Change)
- 테스트 실패 상태에서 작업 금지
- diff 최소화 (불필요한 수정 금지)
- 규칙 위반 시 즉시 작업 중단

---

## HARD STOP CONDITIONS (즉시 종료)

- 네이밍 변경 필요 상황
- 테스트 실패 상태 지속
- 요구사항 불명확
- 인코딩 오류 발생
- 동일 에러 3회 반복
- Figma 응답 없이 새로운 구조 생성 필요

-> "구현 불가 또는 추가 지시 필요" 보고
-> "이 조건에 해당하면, 기존 코드/파일은 수정하지 않고 그대로 유지한다"

---

## STRICT EXECUTION FLOW

1. 코드 분석
2. 테스트 실행
3. 실패 원인 파악
4. 최소 수정 적용
5. 테스트 재실행
6. 결과 보고

-> "테스트는 반드시 npm run test 또는 npm run test:harness만 사용한다."

---

## FORBIDDEN ACTIONS

- 리팩토링
- 이름 변경
- 기능 추가
- 파일 구조 변경
- 외부 라이브러리 추가
- git add / commit / push / PR 생성 금지
- 추측, 보완, 임의 해석에 기반한 모든 구현 금지

---

## 프로젝트 개요

Next.js 기반 프론트엔드 + Express 프로젝트

---

## Setup

- `npm install`
- `npm run dev`
- `npm run test`
- `npm run test:harness`
- `npm run lint`

---

## 상세 규칙 (필수 참고)

- 네이밍 규칙: `docs/RULES_NAMING.md`
- 인코딩 규칙: `docs/RULES_ENCODING.md`
- Figma API 규칙: `docs/RULES_FIGMA.md`
- 테스트/하네스 규칙: `docs/RULES_TEST.md`
- 일반 규칙: `docs/RULES_GENERAL.md`
- 캐싱 규칙: `docs/RULES_CACHE.md`
- 스타일/React 규칙: `docs/RULES_STYLE.md` 참고
