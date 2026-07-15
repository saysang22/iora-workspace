# General Rules

## 코드 스타일

- ES modules
- Single quotes
- no semicolons
- TypeScript strict

---

## 로깅

- `console.error({ err })`
- `console.log({ msg })`

---

## 금지 행동

- 추측 기반 구현
- 요구사항 확장
- UX 임의 변경
- mock 없이 API 호출
- 무한 재시도
- silent failure

---

## CHANGE CONTROL

- 코드 전체 재작성 금지
- 동일 기능 재구현 금지
- 파일 교체 금지

---

## Diff 검증

- diff 최소화
- 이름 변경 0건

---

## Git 제한

- git add / commit / push / PR 금지

---

## Git 상태 비의존

- git 상태 고려 금지
- diff 기준 작업

---

## 판단 기준

- 모호하면 중단
- 사용자 질문

---

## 중단 조건

- 요구사항 불명확
- 반복 에러
- API 실패 지속

---

## CI/CD

- test 필수
- 실패 시 merge 금지

---

## Agent 가이드

- 테스트 먼저
- 최소 수정
- git 판단 금지

---

## GitHub 정책

- Git 작업은 사용자 수행
