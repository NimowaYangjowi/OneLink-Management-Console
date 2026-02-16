# Typography

Forma Studio typography system.

Source: `src/styles/themes/default.ts`
Note: Typography tokens are not currently defined in `design/design-system.pen`.

## 폰트 패밀리

| 용도 | 폰트 | 적용 대상 |
|------|------|----------|
| 헤딩 | Fraunces (세리프) | h1, h2, h3, h4 |
| 본문 | Pretendard | h5, h6, body, button, caption |
| 코드 | Monospace | code, pre |

## Typography Variants

### 헤딩 (세리프)

```jsx
<Typography variant="h1">3rem (48px) - 대형 제목</Typography>
<Typography variant="h2">2.25rem (36px) - 섹션 제목</Typography>
<Typography variant="h3">1.75rem (28px) - 서브 섹션</Typography>
<Typography variant="h4">1.5rem (24px) - 카드 제목</Typography>
```

### 헤딩 (산세리프)

```jsx
<Typography variant="h5">1.25rem (20px) - 소제목</Typography>
<Typography variant="h6">1.125rem (18px) - 라벨</Typography>
```

### 본문

```jsx
<Typography variant="body1">1rem (16px) - 기본 본문</Typography>
<Typography variant="body2">0.875rem (14px) - 작은 본문</Typography>
<Typography variant="subtitle1">1rem (16px) - 부제목 (medium)</Typography>
<Typography variant="subtitle2">0.875rem (14px) - 작은 부제목</Typography>
```

### 보조 텍스트

```jsx
<Typography variant="caption">0.75rem (12px) - 캡션, 날짜</Typography>
<Typography variant="overline">0.6875rem (11px) - 상태 태그, 카테고리</Typography>
<Typography variant="button">0.875rem (14px) - 버튼 텍스트</Typography>
```

## 색상 조합

### 기본 규칙

```jsx
// 주요 텍스트 - text.primary
<Typography color="text.primary">제목, 중요 정보</Typography>

// 보조 텍스트 - text.secondary
<Typography color="text.secondary">설명, 캡션, 메타 정보</Typography>

// 비활성 텍스트 - text.disabled
<Typography color="text.disabled">비활성 항목</Typography>
```

### ❌ 금지 패턴

```jsx
// ❌ 일반 텍스트에 primary 색상
<Typography color="primary">일반 텍스트</Typography>

// ❌ 본문에 error 색상 (에러 메시지가 아닌 경우)
<Typography color="error">강조하고 싶은 텍스트</Typography>
```

### ✅ 올바른 강조 방법

```jsx
// ✅ 폰트 굵기로 강조
<Typography fontWeight={600}>강조 텍스트</Typography>

// ✅ variant 변경으로 강조
<Typography variant="subtitle1">중요한 내용</Typography>

// ✅ 배경색으로 강조 (중립색)
<Box sx={{ backgroundColor: 'grey.100', px: 1 }}>
  <Typography>강조 텍스트</Typography>
</Box>
```

## 폰트 굵기

```jsx
fontWeightLight: 300    // 얇은
fontWeightRegular: 400  // 기본
fontWeightMedium: 500   // 중간 (Fraunces 기본)
fontWeightBold: 700     // 굵은
fontWeightBlack: 900    // 가장 굵은
```

## 행간 (Line Height)

| Variant | lineHeight | 용도 |
|---------|------------|------|
| h1-h4 | 1.1-1.25 | 짧은 헤딩 |
| body1 | 1.7 | 긴 본문 |
| body2 | 1.6 | 짧은 본문 |
| caption | 1.5 | 캡션 |

## 자간 (Letter Spacing)

| Variant | letterSpacing | 용도 |
|---------|---------------|------|
| h1 | -0.02em | 큰 제목은 조금 좁게 |
| overline | 0.1em | 상태 태그는 넓게 |
| button | 0.02em | 버튼 텍스트 약간 넓게 |
| body | 0 | 본문은 기본 |

## 사용 예시

### 카드 타이틀 + 설명

```jsx
<Box>
  <Typography variant="h4" color="text.primary" gutterBottom>
    프로젝트 제목
  </Typography>
  <Typography variant="body1" color="text.secondary">
    프로젝트에 대한 설명이 여기에 들어갑니다.
  </Typography>
  <Typography variant="caption" color="text.secondary" sx={{ mt: 2 }}>
    2024.01.15
  </Typography>
</Box>
```

### 상태 태그

```jsx
<Typography
  variant="overline"
  sx={{
    backgroundColor: 'grey.100',
    px: 1,
    py: 0.5,
    borderRadius: 0,
  }}
>
  IN PROGRESS
</Typography>
```

### 네비게이션 링크

```jsx
<Typography
  variant="body2"
  sx={{
    color: 'text.primary',
    cursor: 'pointer',
    '&:hover': { color: 'text.secondary' },
  }}
>
  About Us
</Typography>
```
