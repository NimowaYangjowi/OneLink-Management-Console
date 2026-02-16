# Component Guidelines

컴포넌트 스타일링 가이드.

Color token source: `design/design-system.pen` via `design/tokens/design-tokens.generated.json`.

## 컴포넌트 생성 원칙

### 1. 기존 컴포넌트 재활용 우선

새 컴포넌트 생성 전 반드시 확인:
- `@.claude/rules/components.md` 에서 유사 컴포넌트 검색
- 기존 컴포넌트 확장/합성으로 해결 가능한지 검토

### 2. MUI 기반

- 모든 기본 컴포넌트는 MUI 사용
- 스타일은 sx prop 사용
- styled-components, emotion css 직접 사용 지양

### 3. 중립색 기본

**컴포넌트 기본 상태는 모두 중립색으로.**

## Button

### Primary Button (CTA)

```jsx
// ✅ CTA 버튼만 primary 색상
<Button variant="contained" color="primary">
  저장하기
</Button>
```

### Secondary Button

```jsx
// ✅ 보조 액션은 outlined + 중립색
<Button
  variant="outlined"
  sx={{
    borderColor: 'divider',
    color: 'text.primary',
    '&:hover': {
      borderColor: 'text.secondary',
      backgroundColor: 'grey.50',
    },
  }}
>
  취소
</Button>
```

### Text Button

```jsx
<Button
  variant="text"
  sx={{
    color: 'text.primary',
    '&:hover': {
      backgroundColor: 'grey.100',
    },
  }}
>
  더보기
</Button>
```

## Card

```jsx
<Card sx={{
  borderRadius: 0,  // Sharp corners
  boxShadow: theme => theme.customShadows.lg,  // Dimmed shadow
  border: '1px solid',
  borderColor: 'divider',
}}>
  <CardContent sx={{ p: 3 }}>
    <Typography variant="h5" color="text.primary" gutterBottom>
      제목
    </Typography>
    <Typography variant="body2" color="text.secondary">
      설명
    </Typography>
  </CardContent>
</Card>
```

## TextField

### 기본 상태

```jsx
<TextField
  label="이름"
  variant="outlined"
  sx={{
    '& .MuiOutlinedInput-root': {
      borderRadius: 0,
      '& fieldset': {
        borderColor: 'divider',
      },
      '&:hover fieldset': {
        borderColor: 'text.secondary',
      },
      '&.Mui-focused fieldset': {
        borderColor: 'text.primary',
        borderWidth: 1,
      },
    },
  }}
/>
```

### 에러 상태 (포인트 컬러 허용)

```jsx
<TextField
  error
  label="이메일"
  helperText="올바른 이메일 형식이 아닙니다"
/>
```

## Select

```jsx
<Select
  sx={{
    borderRadius: 0,
    '& .MuiOutlinedInput-notchedOutline': {
      borderColor: 'divider',
    },
    '&:hover .MuiOutlinedInput-notchedOutline': {
      borderColor: 'text.secondary',
    },
  }}
>
  <MenuItem value={1}>옵션 1</MenuItem>
  <MenuItem value={2}>옵션 2</MenuItem>
</Select>
```

## Tabs

```jsx
<Tabs
  value={value}
  onChange={handleChange}
  sx={{
    '& .MuiTabs-indicator': {
      backgroundColor: 'text.primary',
    },
  }}
>
  <Tab
    label="탭 1"
    sx={{
      color: 'text.secondary',
      '&.Mui-selected': {
        color: 'text.primary',
      },
    }}
  />
  <Tab label="탭 2" sx={{ color: 'text.secondary', '&.Mui-selected': { color: 'text.primary' } }} />
</Tabs>
```

## List

```jsx
<List>
  <ListItem
    sx={{
      '&:hover': { backgroundColor: 'grey.100' },
      '&.Mui-selected': {
        backgroundColor: 'grey.200',
        '&:hover': { backgroundColor: 'grey.200' },
      },
    }}
  >
    <ListItemIcon sx={{ color: 'text.secondary' }}>
      <FolderIcon />
    </ListItemIcon>
    <ListItemText
      primary="폴더명"
      secondary="10 items"
      primaryTypographyProps={{ color: 'text.primary' }}
      secondaryTypographyProps={{ color: 'text.secondary' }}
    />
  </ListItem>
</List>
```

## Chip

```jsx
// 기본 Chip (중립색)
<Chip
  label="태그"
  sx={{
    backgroundColor: 'grey.100',
    color: 'text.primary',
    borderRadius: '4px',  // Chip만 예외적으로 약간의 radius
  }}
/>

// 상태 Chip (포인트 컬러 허용)
<Chip
  label="완료"
  sx={{
    backgroundColor: 'success.light',
    color: 'success.dark',
    borderRadius: '4px',
  }}
/>
```

## Dialog

```jsx
<Dialog
  PaperProps={{
    sx: {
      borderRadius: 0,
      boxShadow: theme => theme.customShadows.xl,
    },
  }}
>
  <DialogTitle sx={{ color: 'text.primary' }}>
    제목
  </DialogTitle>
  <DialogContent>
    <Typography color="text.secondary">
      내용
    </Typography>
  </DialogContent>
  <DialogActions>
    <Button sx={{ color: 'text.secondary' }}>취소</Button>
    <Button variant="contained" color="primary">확인</Button>
  </DialogActions>
</Dialog>
```

## Icon 사용

### lucide-react 아이콘

```jsx
import { Settings, User, FileText } from 'lucide-react';

// 기본 아이콘 (text.secondary)
<Settings size={20} color="currentColor" style={{ color: theme.palette.text.secondary }} />

// MUI Box와 함께
<Box sx={{ color: 'text.secondary', display: 'flex' }}>
  <Settings size={20} />
</Box>

// hover 시 색상 변경
<Box sx={{
  color: 'text.secondary',
  '&:hover': { color: 'text.primary' },
  cursor: 'pointer',
}}>
  <Settings size={20} />
</Box>
```

### ❌ 금지

```jsx
// ❌ 커스텀 SVG 생성
<svg viewBox="0 0 24 24">...</svg>

// ❌ 다른 아이콘 라이브러리
import { FaUser } from 'react-icons/fa';
```

