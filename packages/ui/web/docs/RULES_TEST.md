# Test & Harness Rules

## Harness 실행

- `npm run test:harness`
- 10초 제한
- 하네스 문서/화면의 기본 글꼴은 `docs/RULES_STYLE.md`의 산세리프 기본 폰트 규칙을 따른다

---

## 실패 기준

- 에러 반복
- 응답 지연
- 데이터 불일치

---

## Retry 정책

- 네트워크 2회
- 5xx 1회
- 4xx 금지

---

## 테스트 전략

- fixtures 사용
- mock 우선

---

## 테스트 시나리오

- login
- API 처리
- rate limit
- error handling

---

## 상태 검증

- DB
- side effect
- cache
