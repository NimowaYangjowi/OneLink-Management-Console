# Component Hierarchy Analysis

프로젝트 컴포넌트 계층 구조 분석 보고서.
기본 컴포넌트(MUI COMPONENT)를 재사용하지 않고 직접 구현한 컴포넌트를 식별.

---

## 1. 기본 컴포넌트 (Basic Components)

프로젝트에서 재사용 목적으로 설계된 기본 컴포넌트 목록:

| 컴포넌트 | 위치 | 목적 |
|---------|------|------|
| `CustomCard` | `components/card/CustomCard.jsx` | 미디어+콘텐츠 레이아웃 (vertical/horizontal/overlay) |
| `CardContainer` | `components/card/CardContainer.jsx` | 스타일 변형 래퍼 (outlined/elevation/ghost/filled) |
| `CarouselContainer` | `components/container/CarouselContainer.jsx` | 반응형 멀티-아이템 캐러셀 |
| `NavMenu` | `components/navigation/NavMenu.jsx` | 네비게이션 메뉴 |
| `AppShell` | `components/navigation/AppShell.jsx` | 반응형 레이아웃 쉘 (GNB + 메인 영역) |
| `GNB` | `components/navigation/GNB.jsx` | 글로벌 네비게이션 바 |
| `SectionContainer` | `components/container/SectionContainer.jsx` | 섹션 구분 컨테이너 |

---

## 2. 재사용 현황 분석

### 기본 컴포넌트 올바르게 재사용 중 (CustomCard 확장)

| 컴포넌트 | 재사용하는 기본 컴포넌트 |
|---------|------------------------|
| `ImageCard` | `CustomCard` (vertical, overlaySlot) ✓ |
| `MoodboardCard` | `CustomCard` (vertical, mediaSlot, overlaySlot) ✓ |
| `AppShell` | `GNB` |
| `ImageCarousel` | `Indicator` |
| `MediaGridGallery` | `ImageCard`, `SearchBar`, `CategoryTab` |
| `FilterBar` | `SearchBar` |
| `UploadModal` | `FileDropzone`, `TagInput` |

### MUI 기반 독립 컴포넌트 (재사용 불필요)

- `SearchBar` - MUI InputBase 기반
- `FileDropzone` - MUI Box 기반 드래그앤드롭
- `TagInput` - MUI Chip, InputBase 기반
- `CategoryTab` - MUI Tabs/Tab 기반
- `BentoGrid` - MUI Box (CSS Grid) 기반

---

## 3. 권장 컴포넌트 계층 구조

```
MUI Components (라이브러리)
├── Box, Typography, Grid, Button 등
│
↓
Basic Components (프로젝트 기본)
├── CustomCard (레이아웃)
├── CardContainer (스타일 변형)
├── CarouselContainer
├── NavMenu, GNB, AppShell
├── SearchBar, FileDropzone, TagInput
└── BentoGrid, CategoryTab
│
↓
Composite Components (조합형)
├── ImageCard (CustomCard 확장)
├── MoodboardCard (CustomCard 확장)
├── FilterBar (SearchBar 조합)
├── UploadModal (FileDropzone + TagInput)
└── MediaGridGallery (ImageCard + Grid + 필터링)
```

---

## 4. 카드 컴포넌트 계층

### 현재 상태 (리팩토링 완료) ✓

```
MUI Box
└── CustomCard (기본 컴포넌트)
    ├── ImageCard (CustomCard 확장) ✓
    └── MoodboardCard (CustomCard 확장) ✓
```

CustomCard 확장 시 활용한 props:
- `overlaySlot`: 미디어 영역 위 오버레이 요소 (액션 버튼, 배지 등)
- `mediaSlot`: 커스텀 미디어 요소 (MoodboardCard의 2×2 그리드)
- `mediaRatio="auto"`: 원본 이미지 비율 유지 (ImageCard)

---

## 5. 완료된 개선 방안 ✓

### ImageCard 리팩토링 (완료)

**이전 (중복 구현):**
```jsx
<Box sx={{ position: 'relative', borderRadius: 2, overflow: 'hidden' }}>
  <Box component="img" src={src} />
  <Box className="action-buttons">...</Box>
  <Box sx={{ p: 1.5 }}><Typography>{title}</Typography></Box>
</Box>
```

**현재 (CustomCard 활용):**
```jsx
<CustomCard
  layout="vertical"
  mediaSrc={src}
  mediaAlt={title}
  mediaRatio="auto"
  contentPadding="sm"
  overlaySlot={<ActionButtons />}
>
  <Typography variant="body2">{title}</Typography>
  <Chips tags={tags} />
</CustomCard>
```

### MoodboardCard 리팩토링 (완료)

**이전 (중복 구현):**
```jsx
<Box sx={{ position: 'relative', borderRadius: 2, overflow: 'hidden' }}>
  <Box className="thumbnail-grid">{/* 2x2 그리드 */}</Box>
  <Box className="moodboard-actions">...</Box>
  <Box className="item-count-badge">...</Box>
  <Box sx={{ p: 2 }}><Typography>{name}</Typography></Box>
</Box>
```

**현재 (CustomCard 활용):**
```jsx
<CustomCard
  layout="vertical"
  mediaSlot={<ThumbnailGrid />}
  mediaRatio="1/1"
  contentPadding="md"
  overlaySlot={<>{ActionButtons}{ItemCountBadge}</>}
>
  <Typography>{name}</Typography>
  <Typography>{description}</Typography>
  <Typography>{createdAt}</Typography>
</CustomCard>
```

---

## 6. 완료된 작업

| 순위 | 컴포넌트 | 영향도 | 상태 |
|------|---------|--------|------|
| 1 | ImageCard → CustomCard | 높음 (Archive, Moodboard 상세에서 사용) | ✓ 완료 |
| 2 | MoodboardCard → CustomCard | 중간 (Moodboards 그리드에서 사용) | ✓ 완료 |

---

## 7. 재사용 현황 요약

| 범주 | 재사용 중 | 상태 |
|------|---------|------|
| 카드 계열 | CustomCard → ImageCard, MoodboardCard, CardContainer | ✓ 적절 |
| 캐러셀 | CarouselContainer, Indicator | ✓ 적절 |
| 네비게이션 | NavMenu, GNB, AppShell | ✓ 적절 |
| 입력 | SearchBar, FileDropzone, TagInput | ✓ 적절 |
| 템플릿 | 하위 컴포넌트 조합 | ✓ 적절 |
| 레이아웃 | BentoGrid | ✓ 적절 |

---

## 8. CustomCard 확장 가이드

새로운 카드 컴포넌트 생성 시 CustomCard 기반으로 확장:

```jsx
import { CustomCard } from './CustomCard';

export function NewCard({ src, title, ...props }) {
  return (
    <CustomCard
      layout="vertical"          // 레이아웃 타입
      mediaSrc={src}             // 이미지 URL (또는 mediaSlot으로 커스텀)
      mediaRatio="16/9"          // 비율 (또는 "auto"로 원본 유지)
      overlaySlot={<Actions />}  // 미디어 위 오버레이
      contentPadding="md"        // 콘텐츠 패딩
      {...props}
    >
      {/* 콘텐츠 영역 */}
    </CustomCard>
  );
}
```

---

*최종 업데이트: 2025-12-04*
