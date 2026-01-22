# Storybook Writing Rules (SHOULD)

Storybook 스토리 작성 시 준수해야 할 규칙

## 스토리 카테고리 구조

| 카테고리 | title 접두사 | 설명 |
|---------|-------------|------|
| **Style** | `Style/` | 디자인 토큰 문서 (색상, 타이포그래피, 간격 등) |
| **Custom Component** | `Custom Component/` | 프로젝트에서 새로 만든 재사용 컴포넌트 |
| **Template** | `Template/` | 여러 컴포넌트를 조합한 템플릿 |
| **Section** | `Section/` | 페이지를 구성하는 섹션 단위 컴포넌트 |
| **Page** | `Page/` | 전체 페이지 레벨 컴포넌트 |

## 필수 규칙

### 공통

- 스토리 한 개당 단일 컴포넌트/토큰만 보여준다
- DocumentTitle props는 모두 **영어**로 작성
- 설명(페이지 제목, 섹션 설명, 테이블 내용)은 **한글**로 작성
- 2개 이상의 섹션에 SectionTitle 사용

### Component 스토리 (autodocs)

```jsx
export default {
  title: 'Custom Component/ComponentName',
  component: Component,
  tags: ['autodocs'],
  argTypes: {
    label: { control: 'text', description: '버튼 텍스트' },
    isDisabled: { control: 'boolean', description: '비활성화 여부' },
    variant: {
      control: 'select',
      options: ['primary', 'secondary'],
      description: '스타일 변형'
    },
    onClick: { action: 'clicked', description: '클릭 핸들러' },
  },
};

export const Default = {
  args: {
    label: '버튼',
    isDisabled: false,
    variant: 'primary',
  },
};
```

### argTypes Control 타입 가이드

| Props 타입 | control | 예시 |
|-----------|---------|------|
| string | `'text'` | `control: 'text'` |
| boolean | `'boolean'` | `control: 'boolean'` |
| number | `{ type: 'number' }` | `control: { type: 'number', min: 0, max: 100 }` |
| enum/선택지 | `'select'` | `control: 'select', options: ['a', 'b']` |
| color | `'color'` | `control: 'color'` |
| function | `action()` | `action: 'clicked'` |

### Style 스토리 (문서형)

Style 스토리는 autodocs를 사용하지 않고 직접 Doc 스토리 작성

**필수 구조:**
1. 1줄 개요
2. 토큰 구조 (트리 뷰)
3. 토큰 값 (테이블)
4. 사용 예시 (MUI sx prop)
5. Vibe Coding Prompt

```jsx
export default {
  title: 'Style/TokenName',
  parameters: { layout: 'padded' },
};

export const Default = {
  render: () => {
    const theme = useTheme();
    return (
      <>
        <DocumentTitle title="Token Name" status="Available" ... />
        <PageContainer>
          <Typography variant="h4">토큰 제목</Typography>
          <Typography variant="body1" color="text.secondary">
            한 줄로 토큰의 역할을 설명합니다.
          </Typography>

          <SectionTitle title="토큰 구조" />
          {/* TreeNode로 트리 뷰 렌더링 */}

          <SectionTitle title="토큰 값" />
          {/* 테이블로 토큰값 표시 */}

          <SectionTitle title="사용 예시" />
          {/* MUI sx prop 코드 예시 */}

          <SectionTitle title="Vibe Coding Prompt" />
          {/* AI 프롬프트 예시 */}
        </PageContainer>
      </>
    );
  },
};
```

## 베리에이션 작성 원칙

**지양:**
```jsx
// ❌ Props 조합별로 스토리를 과도하게 생성
export const PrimarySmall = { args: { variant: 'primary', size: 'small' } };
export const PrimaryMedium = { args: { variant: 'primary', size: 'medium' } };
// ... 조합 폭발
```

**권장:**
```jsx
// ✅ Default 스토리 + Controls로 사용자가 직접 조작
export const Default = { args: { variant: 'primary', size: 'medium' } };

// ✅ 필요 시 하나의 스토리에서 주요 변형만 간단히 나열
export const Variants = {
  render: () => (
    <Stack direction="row" spacing={2}>
      <Button variant="primary">Primary</Button>
      <Button variant="secondary">Secondary</Button>
    </Stack>
  ),
};
```

## 문서 스타일 원칙

| 원칙 | 설명 |
|------|------|
| 보수적 | 최소한의 스타일링, 장식 요소 배제 |
| 전문적 | 기술 문서처럼 신뢰감 있는 톤 |
| 구조적 | 명확한 계층과 섹션 구분 |
| 일관성 | 모든 문서가 동일한 레이아웃 구조 |

### 금지 사항

- Paper, Card 컴포넌트의 장식적 사용 금지
- elevation, boxShadow 사용 금지
- 불필요한 배경색, 그라데이션 금지
- 이모지 과다 사용 금지
- 마케팅 문구 금지

## 필수 문서 컴포넌트

- `DocumentTitle` - 모든 스토리 상단에 문서 메타 정보 표시
- `PageContainer` - 모든 스토리 콘텐츠를 감싸는 컨테이너
- `SectionTitle` - 콘텐츠 섹션 구분용 타이틀

위치: `src/components/storybookDocumentation/`
