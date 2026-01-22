import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import { DocumentTitle, PageContainer, SectionTitle } from '../../../components/storybookDocumentation';
import { BentoGrid, BentoItem } from '../../../components/layout/BentoGrid';
import { BENTO_PRESETS } from '../../../components/layout/bentoPresets';

export default {
  title: 'Custom Component/Layout/BentoGrid',
  component: BentoGrid,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: `
## BentoGrid

Apple 스타일의 벤토 박스 그리드 레이아웃.

### 용도
- 대시보드 위젯 레이아웃
- 포트폴리오/갤러리
- Feature 소개 섹션
        `,
      },
    },
  },
  argTypes: {
    columns: {
      control: { type: 'range', min: 2, max: 6 },
      description: '열 개수',
    },
    gap: {
      control: { type: 'range', min: 0, max: 6 },
      description: '셀 간 간격',
    },
    rowHeight: {
      control: 'text',
      description: '기본 행 높이',
    },
  },
};

// 데모용 셀 컴포넌트
const DemoCell = ({ label, color = '#667eea', icon }) => (
  <Box
    sx={ {
      height: '100%',
      minHeight: 100,
      backgroundColor: color,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'white',
      fontWeight: 600,
      fontSize: 18,
      p: 2,
    } }
  >
    { icon && <Box sx={ { fontSize: 40, mb: 1 } }>{ icon }</Box> }
    { label }
  </Box>
);

/** 기본 사용 */
export const Default = {
  args: {
    columns: 4,
    gap: 2,
    rowHeight: '150px',
  },
  render: (args) => (
    <BentoGrid { ...args }>
      <BentoItem colSpan={ 2 } rowSpan={ 2 } background="#667eea">
        <DemoCell label="Featured" color="transparent" />
      </BentoItem>
      <BentoItem background="#764ba2">
        <DemoCell label="Item 2" color="transparent" />
      </BentoItem>
      <BentoItem background="#f093fb">
        <DemoCell label="Item 3" color="transparent" />
      </BentoItem>
      <BentoItem colSpan={ 2 } background="#4facfe">
        <DemoCell label="Wide" color="transparent" />
      </BentoItem>
    </BentoGrid>
  ),
};

/** 문서 및 데모 */
export const Documentation = {
  render: () => (
    <>
      <DocumentTitle
        title="BentoGrid"
        status="Available"
        note="Apple-style bento box layout"
        brandName="Layout"
        systemName="Starter Kit"
        version="1.0"
      />
      <PageContainer>
        <Typography variant="h4" sx={ { fontWeight: 700, mb: 1 } }>
          BentoGrid
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={ { mb: 4 } }>
          CSS Grid를 활용한 Apple 스타일의 벤토 박스 레이아웃입니다.
          다양한 크기의 셀을 유연하게 배치할 수 있습니다.
        </Typography>

        <SectionTitle title="Props - BentoGrid" description="BentoGrid 컴포넌트의 Props입니다." />
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={ { fontWeight: 600 } }>Prop</TableCell>
                <TableCell sx={ { fontWeight: 600 } }>Type</TableCell>
                <TableCell sx={ { fontWeight: 600 } }>Default</TableCell>
                <TableCell sx={ { fontWeight: 600 } }>Description</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              <TableRow>
                <TableCell sx={ { fontFamily: 'monospace' } }>columns</TableCell>
                <TableCell>number</TableCell>
                <TableCell>4</TableCell>
                <TableCell>기본 열 개수</TableCell>
              </TableRow>
              <TableRow>
                <TableCell sx={ { fontFamily: 'monospace' } }>gap</TableCell>
                <TableCell>number | string</TableCell>
                <TableCell>2</TableCell>
                <TableCell>셀 간 간격</TableCell>
              </TableRow>
              <TableRow>
                <TableCell sx={ { fontFamily: 'monospace' } }>rowHeight</TableCell>
                <TableCell>number | string</TableCell>
                <TableCell>&apos;200px&apos;</TableCell>
                <TableCell>기본 행 높이</TableCell>
              </TableRow>
              <TableRow>
                <TableCell sx={ { fontFamily: 'monospace' } }>isAutoRows</TableCell>
                <TableCell>boolean</TableCell>
                <TableCell>false</TableCell>
                <TableCell>자동 행 높이 여부</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>

        <SectionTitle title="Props - BentoItem" description="BentoItem 컴포넌트의 Props입니다." />
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={ { fontWeight: 600 } }>Prop</TableCell>
                <TableCell sx={ { fontWeight: 600 } }>Type</TableCell>
                <TableCell sx={ { fontWeight: 600 } }>Default</TableCell>
                <TableCell sx={ { fontWeight: 600 } }>Description</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              <TableRow>
                <TableCell sx={ { fontFamily: 'monospace' } }>colSpan</TableCell>
                <TableCell>number | object</TableCell>
                <TableCell>1</TableCell>
                <TableCell>열 span (1-4)</TableCell>
              </TableRow>
              <TableRow>
                <TableCell sx={ { fontFamily: 'monospace' } }>rowSpan</TableCell>
                <TableCell>number | object</TableCell>
                <TableCell>1</TableCell>
                <TableCell>행 span (1-3)</TableCell>
              </TableRow>
              <TableRow>
                <TableCell sx={ { fontFamily: 'monospace' } }>background</TableCell>
                <TableCell>string</TableCell>
                <TableCell>-</TableCell>
                <TableCell>배경색</TableCell>
              </TableRow>
              <TableRow>
                <TableCell sx={ { fontFamily: 'monospace' } }>isContained</TableCell>
                <TableCell>boolean</TableCell>
                <TableCell>true</TableCell>
                <TableCell>overflow hidden 적용</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>

        <SectionTitle title="Featured Layout" description="대표 콘텐츠를 강조하는 레이아웃입니다." />
        <BentoGrid columns={ 4 } gap={ 2 } rowHeight="150px">
          <BentoItem colSpan={ 2 } rowSpan={ 2 }>
            <Box
              sx={ {
                height: '100%',
                backgroundImage: 'url(https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600)',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                display: 'flex',
                alignItems: 'flex-end',
                p: 3,
              } }
            >
              <Typography variant="h5" sx={ { color: 'white', fontWeight: 700, textShadow: '0 2px 4px rgba(0,0,0,0.3)' } }>
                Featured
              </Typography>
            </Box>
          </BentoItem>
          <BentoItem background="#1a1a2e">
            <DemoCell label="Quick Stats" color="transparent" icon="📊" />
          </BentoItem>
          <BentoItem background="#16213e">
            <DemoCell label="Updates" color="transparent" icon="🔔" />
          </BentoItem>
          <BentoItem background="#0f3460">
            <DemoCell label="Settings" color="transparent" icon="⚙️" />
          </BentoItem>
          <BentoItem background="#533483">
            <DemoCell label="Profile" color="transparent" icon="👤" />
          </BentoItem>
        </BentoGrid>

        <SectionTitle title="Dashboard Layout" description="대시보드 스타일 레이아웃입니다." />
        <BentoGrid columns={ 4 } gap={ 2 } rowHeight="120px">
          <BentoItem colSpan={ 3 } background="linear-gradient(135deg, #667eea 0%, #764ba2 100%)">
            <Box sx={ { p: 3, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' } }>
              <Typography variant="overline" sx={ { color: 'rgba(255,255,255,0.7)' } }>Welcome back</Typography>
              <Typography variant="h4" sx={ { color: 'white', fontWeight: 700 } }>Dashboard Overview</Typography>
            </Box>
          </BentoItem>
          <BentoItem rowSpan={ 2 } background="#f5f5f5">
            <Box sx={ { p: 2, height: '100%' } }>
              <Typography variant="subtitle2" color="text.secondary">Activity</Typography>
              <Box sx={ { mt: 2 } }>
                { ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'].map((day, i) => (
                  <Box key={ day } sx={ { display: 'flex', alignItems: 'center', mb: 1 } }>
                    <Typography variant="caption" sx={ { width: 30 } }>{ day }</Typography>
                    <Box sx={ { flex: 1, height: 8, backgroundColor: 'grey.200', borderRadius: 1, overflow: 'hidden' } }>
                      <Box sx={ { width: `${40 + i * 15}%`, height: '100%', backgroundColor: 'primary.main' } } />
                    </Box>
                  </Box>
                )) }
              </Box>
            </Box>
          </BentoItem>
          <BentoItem background="#e8f5e9">
            <Box sx={ { p: 2, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' } }>
              <Typography variant="h3" sx={ { fontWeight: 700, color: 'success.main' } }>+24%</Typography>
              <Typography variant="caption" color="text.secondary">Growth</Typography>
            </Box>
          </BentoItem>
          <BentoItem background="#fff3e0">
            <Box sx={ { p: 2, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' } }>
              <Typography variant="h3" sx={ { fontWeight: 700, color: 'warning.main' } }>1.2K</Typography>
              <Typography variant="caption" color="text.secondary">Users</Typography>
            </Box>
          </BentoItem>
          <BentoItem background="#e3f2fd">
            <Box sx={ { p: 2, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' } }>
              <Typography variant="h3" sx={ { fontWeight: 700, color: 'info.main' } }>89</Typography>
              <Typography variant="caption" color="text.secondary">Tasks</Typography>
            </Box>
          </BentoItem>
        </BentoGrid>

        <SectionTitle title="Gallery Layout" description="포트폴리오/갤러리 스타일입니다." />
        <BentoGrid columns={ 3 } gap={ 1 } rowHeight="180px">
          { [
            { span: [2, 2], img: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=600' },
            { span: [1, 1], img: 'https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?w=400' },
            { span: [1, 1], img: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400' },
            { span: [1, 1], img: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400' },
            { span: [2, 1], img: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600' },
          ].map((item, i) => (
            <BentoItem key={ i } colSpan={ item.span[0] } rowSpan={ item.span[1] }>
              <Box
                sx={ {
                  height: '100%',
                  backgroundImage: `url(${item.img})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                } }
              />
            </BentoItem>
          )) }
        </BentoGrid>

        <SectionTitle title="Preset Layouts" description="자주 사용되는 프리셋 레이아웃입니다." />
        <Stack spacing={ 4 }>
          <Box>
            <Typography variant="subtitle2" sx={ { mb: 1, color: 'text.secondary' } }>
              BENTO_PRESETS.featured
            </Typography>
            <BentoGrid columns={ 3 } gap={ 2 } rowHeight="100px">
              { BENTO_PRESETS.featured.map((preset, i) => (
                <BentoItem
                  key={ i }
                  colSpan={ preset.colSpan }
                  rowSpan={ preset.rowSpan }
                  background={ i === 0 ? '#667eea' : '#764ba2' }
                >
                  <DemoCell label={ `${preset.colSpan}x${preset.rowSpan}` } color="transparent" />
                </BentoItem>
              )) }
            </BentoGrid>
          </Box>

          <Box>
            <Typography variant="subtitle2" sx={ { mb: 1, color: 'text.secondary' } }>
              BENTO_PRESETS.hero
            </Typography>
            <BentoGrid columns={ 4 } gap={ 2 } rowHeight="100px">
              { BENTO_PRESETS.hero.map((preset, i) => (
                <BentoItem
                  key={ i }
                  colSpan={ preset.colSpan }
                  rowSpan={ preset.rowSpan }
                  background={ ['#f093fb', '#f5576c', '#4facfe', '#00f2fe'][i] }
                >
                  <DemoCell label={ `${preset.colSpan}x${preset.rowSpan}` } color="transparent" />
                </BentoItem>
              )) }
            </BentoGrid>
          </Box>
        </Stack>

        <SectionTitle title="Usage Example" description="코드 사용 예시입니다." />
        <Box
          component="pre"
          sx={ {
            backgroundColor: 'grey.100',
            p: 3,
            fontSize: 13,
            fontFamily: 'monospace',
            overflow: 'auto',
            lineHeight: 1.6,
          } }
        >
          { `// 기본 벤토 그리드
<BentoGrid columns={4} gap={2}>
  <BentoItem colSpan={2} rowSpan={2}>
    <FeaturedCard />
  </BentoItem>
  <BentoItem>
    <SmallCard />
  </BentoItem>
  <BentoItem>
    <SmallCard />
  </BentoItem>
  <BentoItem colSpan={2}>
    <WideCard />
  </BentoItem>
</BentoGrid>

// 프리셋 사용
import { BENTO_PRESETS } from './BentoGrid';

<BentoGrid columns={3}>
  {items.map((item, i) => (
    <BentoItem
      key={i}
      colSpan={BENTO_PRESETS.featured[i]?.colSpan || 1}
      rowSpan={BENTO_PRESETS.featured[i]?.rowSpan || 1}
    >
      <Card {...item} />
    </BentoItem>
  ))}
</BentoGrid>` }
        </Box>
      </PageContainer>
    </>
  ),
};
