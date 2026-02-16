# Color Tokens

Pencil 디자인 파일 기반 색상 토큰 - MUI palette 매핑.

## 색상 사용 원칙

### 1. 중립색 80% / 포인트 컬러 20%

대부분의 UI 요소는 중립색으로 구성. 포인트 컬러는 사용자 주의가 필요한 곳에만.

### 2. 포인트 컬러 허용 사용처

| 컬러 | 허용 | 금지 |
|------|------|------|
| `primary` | CTA 버튼, 활성 상태, 네비게이션 선택 | 텍스트 강조, 배경 장식 |
| `error` | 에러 메시지, 삭제 확인, 필수 필드 표시 | 일반 텍스트 강조 |
| `warning` | 경고 배너, 주의 알림 | 아이콘 장식 |
| `success` | 완료 메시지, 저장 확인, 체크 표시 | 일반 UI |
| `info` | 도움말 툴팁, 안내 메시지 | 링크 스타일링 |

## Pencil → MUI 토큰 매핑

### Core Tokens

| Pencil 변수 | MUI 경로 | 값 | 용도 |
|------------|----------|-----|------|
| `--primary` | `primary.main` | #171717 | CTA, 강조 |
| `--primary-foreground` | `primary.contrastText` | #fafafa | primary 위 텍스트 |
| `--secondary` | `secondary.main` | #f5f5f5 | 보조 버튼, 연한 배경 |
| `--background` | `background.default` | #fafafa | 페이지 배경 |
| `--foreground` | `text.primary` | #0a0a0a | 주요 텍스트 |
| `--muted-foreground` | `text.secondary` | #737373 | 보조 텍스트 |
| `--border` | `divider` | #e5e5e5 | 구분선, 테두리 |
| `--destructive` | `error.main` | #e7000b | 에러, 삭제 |
| `--card` | `background.paper` | #fafafa | 카드 배경 |
| `--muted` | `background.muted` | #f5f5f5 | 비활성 배경 |

### Grey Scale

```jsx
// theme.palette.grey
grey: {
  50: '#fafafa',   // 가장 밝은 배경
  100: '#f5f5f5',  // 연한 배경, hover 상태
  200: '#e5e5e5',  // 구분선, 테두리
  300: '#d4d4d4',  // 비활성 테두리
  400: '#a3a3a3',  // 플레이스홀더
  500: '#737373',  // 보조 텍스트 (text.secondary와 동일)
  600: '#525252',  // 중간 회색
  700: '#404040',  // 진한 회색
  800: '#262626',  // 어두운 배경
  900: '#171717',  // primary.main과 동일
}
```

## 사용 예시

### 중립색 기반 카드

```jsx
<Box sx={{
  backgroundColor: 'background.paper',
  border: '1px solid',
  borderColor: 'divider',
  p: 3,
}}>
  <Typography variant="h6" color="text.primary">
    제목
  </Typography>
  <Typography variant="body2" color="text.secondary">
    설명 텍스트는 보조 색상으로
  </Typography>
</Box>
```

### CTA 버튼 (포인트 컬러 허용)

```jsx
// ✅ CTA는 primary 사용 가능
<Button variant="contained" color="primary">
  저장하기
</Button>

// ✅ 보조 액션은 중립색
<Button variant="outlined" sx={{ borderColor: 'divider', color: 'text.primary' }}>
  취소
</Button>
```

### 상태 표시 (포인트 컬러 허용)

```jsx
// ✅ 에러 상태
<TextField
  error
  helperText="필수 입력 항목입니다"
  sx={{ '& .MuiFormHelperText-root': { color: 'error.main' } }}
/>

// ✅ 성공 상태
<Chip
  label="완료"
  sx={{ backgroundColor: 'success.light', color: 'success.dark' }}
/>
```

### 리스트 아이템 (중립색 기본)

```jsx
<ListItem sx={{
  '&:hover': { backgroundColor: 'grey.100' },
  '&.Mui-selected': {
    backgroundColor: 'grey.200',
    '&:hover': { backgroundColor: 'grey.200' },
  },
}}>
  <ListItemIcon sx={{ color: 'text.secondary' }}>
    <FileIcon />
  </ListItemIcon>
  <ListItemText
    primary="파일명.pdf"
    secondary="2024.01.15"
    primaryTypographyProps={{ color: 'text.primary' }}
    secondaryTypographyProps={{ color: 'text.secondary' }}
  />
</ListItem>
```

## Anti-Patterns

### ❌ 금지: 포인트 컬러 남용

```jsx
// ❌ 일반 텍스트에 primary 사용
<Typography color="primary">일반 텍스트</Typography>

// ❌ 배경 장식에 error 사용
<Box sx={{ backgroundColor: 'error.light' }}>일반 콘텐츠</Box>

// ❌ 아이콘에 warning 사용 (경고 목적 아닐 때)
<SettingsIcon sx={{ color: 'warning.main' }} />
```

### ✅ 올바른 사용

```jsx
// ✅ 일반 텍스트
<Typography color="text.primary">일반 텍스트</Typography>

// ✅ 일반 배경
<Box sx={{ backgroundColor: 'grey.100' }}>일반 콘텐츠</Box>

// ✅ 일반 아이콘
<SettingsIcon sx={{ color: 'text.secondary' }} />
```

## Pencil 토큰 직접 참조

테마 외부에서 Pencil 토큰이 필요한 경우:

```jsx
import { pencilTokens } from '@/styles/themes/default';

// 사용
sx={{
  backgroundColor: pencilTokens.muted,
  borderColor: pencilTokens.border,
}}
```
