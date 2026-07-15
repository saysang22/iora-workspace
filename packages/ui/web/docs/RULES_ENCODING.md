# Encoding Rules

## ENCODING SAFETY

- UTF-8 필수
- 깨진 문자열 발견 시 즉시 실패
- UI에는 정상 문자열만 출력

---

## 인코딩 안정성 규칙

### 1. UTF-8 강제

### 2. 프론트 meta 설정

```html
<meta charset="UTF-8" />
```

### 3. 백엔드 charset 명시

```http
Content-Type: application/json; charset=utf-8
```

### 4. DB utf8mb4

### 5. 깨진 문자열 감지 시 실패

### 6. 오류 시 중단

### 7. 금지 행동

- 깨진 문자열 출력
- 임시 replace 처리
- 인코딩 문제 무시

### 8. 출력 검증 필수
