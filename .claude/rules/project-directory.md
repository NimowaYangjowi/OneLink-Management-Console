# Project Directory Rules (MUST)

새로운 컴포넌트를 추가할 때는 아래 디렉토리 룰을 따른다.

## 디렉토리 구조

```
src/
  components/           # 재사용 가능한 UI 컴포넌트 모음
    card/               # 카드 관련 컴포넌트 (ProductCard + stories)
    carousel/           # 캐로셀 관련 컴포넌트 (Matrix2DCarousel + stories)
    container/          # 컨테이너 컴포넌트 (GridContainer + stories)
    grid/               # 그리드 관련 컴포넌트 (DynamicGrid + stories)
    navigation/         # 네비게이션 컴포넌트 (Header + stories)
    layout/             # 레이아웃 컴포넌트 (AppShell, PageLayout + stories)
    style/              # 스타일 가이드 (Icons, Assets + stories)
    *.stories.jsx       # 각 컴포넌트의 Storybook 문서 (컴포넌트와 같은 위치)

  pages/                # 페이지 레벨 컴포넌트
    MainPage.jsx        # 메인 페이지 컴포넌트
    MainPage.stories.jsx # 페이지 통합 가이드 및 Storybook 문서
    00-Overview.stories.jsx # 프로젝트 개요 문서

  common/               # 공통 유틸 컴포넌트
    ui/                 # UI 요소 (ArrowButton, Indicator 등)
    media/              # 미디어 렌더러 (MediaRenderer 등)

  guide/                # 중요한 컴포넌트를 생성할 때 적용된 가이드 저장 & 업데이트
  templates/            # 다수의 컴포넌트들이 합쳐진 템플릿 컴포넌트
  sections/             # 페이지 내 주요 섹션에 해당하는 컴포넌트
  hooks/                # 커스텀 React 훅(hook) 모음
  utils/                # 유틸리티 함수 모음
  styles/               # 전역 스타일 또는 테마 관련 파일
  assets/               # 이미지, 폰트, 비디오 등 정적 자원
    product/            # 제품 이미지 및 비디오

stories/                # 스토리북 스토리 전용 폴더

docs/                   # 프로젝트 문서
  storybook-writing-guide.md # Storybook 작성 가이드

.storybook/             # Storybook 설정
  main.js               # Storybook 메인 설정
  preview.jsx           # Storybook 프리뷰 설정
```

## Storybook 파일 위치 규칙

- 각 컴포넌트의 `.stories.jsx` 파일은 해당 컴포넌트와 **같은 폴더** 또는 **전용 하위 폴더**에 위치
- 예시:
  - `src/components/card/ProductCard.stories.jsx` (하위 폴더)
  - `src/components/ProductDetailView.stories.jsx` (같은 폴더)
  - `src/pages/MainPage.stories.jsx` (같은 폴더)

## Storybook 카테고리 구조

- `1. Style/` - Icons, Assets (디자인 시스템 요소)
- `2. Components/` - 재사용 가능한 UI 컴포넌트들
- `3. Pages/` - 전체 페이지 및 통합 가이드

## 파일 위치와 카테고리 매핑

| 파일 위치 | Storybook 카테고리 |
|----------|-------------------|
| `src/components/shared/` | `Custom Component/` |
| `src/components/card/` | `Custom Component/` |
| `src/components/navigation/` | `Custom Component/` |
| `src/components/layout/` | `Custom Component/` |
| `src/templates/` | `Template/` |
| `src/sections/` | `Section/` |
| `src/pages/` | `Page/` |
