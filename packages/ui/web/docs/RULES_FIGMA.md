# Figma API Rules

- "Figma rate limit" 발생 시 즉시 모든 작업 중단
- rate limit 상태에서는 대체 구현 금지
- 추측 기반 UI 생성 금지
- 톤 맞춤 재작성 금지
- 기존 Figma 기반 내용은 그대로 유지
- Figma 응답 없이 새로운 구조 생성 금지
- 동일 요청 재시도 최대 1회
- 이후 즉시 중단
- 토큰 낭비 유발 반복 생성 금지
