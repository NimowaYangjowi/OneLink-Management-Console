import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import Divider from '@mui/material/Divider';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Grid from '@mui/material/Grid';
import { useTheme } from '@mui/material/styles';
import {
  DocumentTitle,
  PageContainer,
  SectionTitle,
} from '../../components/storybookDocumentation';
import AspectMedia from '../../components/media/AspectMedia';
import { testImages } from '../../utils/pexels-test-data';

export default {
  title: 'Overview/Forma Studio',
  parameters: {
    layout: 'padded',
  },
};

/**
 * Forma Studio 브랜드 기획
 */
export const BrandStrategy = {
  name: '1. Brand Strategy',
  render: () => {
    const theme = useTheme();

    return (
      <>
        <DocumentTitle
          title="Brand Strategy"
          status="Available"
          note="Forma Studio brand planning"
          brandName="Forma Studio"
          systemName="Design System"
          version="1.0"
        />
        <PageContainer>
          <Typography variant="h4" sx={ { fontWeight: 700, mb: 1 } }>
            Forma Studio Brand Strategy
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={ { mb: 4 } }>
            가상의 공간 디자인 & 건축 컨설팅 스튜디오 브랜드 기획
          </Typography>

          {/* 브랜드 아이덴티티 */}
          <SectionTitle title="브랜드 아이덴티티" />
          <Box sx={ { bgcolor: 'background.default', p: 4, mb: 4 } }>
            <Typography
              sx={ {
                fontFamily: '"Fraunces", serif',
                fontSize: '4rem',
                fontWeight: 500,
                lineHeight: 1,
                mb: 2,
              } }
            >
              Forma
            </Typography>
            <Typography variant="body1" sx={ { mb: 3, maxWidth: 600 } }>
              <strong>Forma</strong> is an architectural and spatial design studio
              specializing in consciously designed environments for businesses,
              nonprofits, and people.
            </Typography>
            <Typography
              variant="overline"
              sx={ { color: 'primary.main', letterSpacing: '0.15em' } }
            >
              Shaping Spaces, Crafting Experiences
            </Typography>
          </Box>

          <TableContainer sx={ { mb: 4 } }>
            <Table size="small">
              <TableBody>
                <TableRow>
                  <TableCell sx={ { fontWeight: 600, width: '25%' } }>브랜드명</TableCell>
                  <TableCell>Forma Studio</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell sx={ { fontWeight: 600 } }>슬로건</TableCell>
                  <TableCell>Shaping Spaces, Crafting Experiences</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell sx={ { fontWeight: 600 } }>분야</TableCell>
                  <TableCell>공간 디자인 & 건축 컨설팅</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell sx={ { fontWeight: 600 } }>위치</TableCell>
                  <TableCell>Seoul, Korea / New York, USA</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell sx={ { fontWeight: 600 } }>설립</TableCell>
                  <TableCell>2018</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>

          {/* 브랜드 철학 */}
          <SectionTitle title="브랜드 철학" />
          <TableContainer sx={ { mb: 4 } }>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={ { fontWeight: 600 } }>핵심 가치</TableCell>
                  <TableCell sx={ { fontWeight: 600 } }>설명</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow>
                  <TableCell sx={ { fontWeight: 600 } }>Conscious Design</TableCell>
                  <TableCell>환경과 사용자를 고려한 의식적인 디자인 접근</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell sx={ { fontWeight: 600 } }>Material Innovation</TableCell>
                  <TableCell>지속 가능한 소재와 제작 방식 연구</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell sx={ { fontWeight: 600 } }>Timeless Aesthetics</TableCell>
                  <TableCell>유행을 타지 않는 시대를 초월한 미학</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell sx={ { fontWeight: 600 } }>Human-Centered</TableCell>
                  <TableCell>사람 중심의 경험 설계</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>

          {/* 서비스 영역 */}
          <SectionTitle title="서비스 영역" />
          <TableContainer sx={ { mb: 4 } }>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={ { fontWeight: 600 } }>서비스</TableCell>
                  <TableCell sx={ { fontWeight: 600 } }>상세</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow>
                  <TableCell sx={ { fontWeight: 600 } }>Residential</TableCell>
                  <TableCell>주거 공간 디자인, 리노베이션, 인테리어</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell sx={ { fontWeight: 600 } }>Hospitality</TableCell>
                  <TableCell>호텔, 레스토랑, 카페 공간 디자인</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell sx={ { fontWeight: 600 } }>Retail</TableCell>
                  <TableCell>브랜드 리테일 공간, 쇼룸, 전시 공간</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell sx={ { fontWeight: 600 } }>Research & Design</TableCell>
                  <TableCell>소재 연구, 지속 가능한 디자인 컨설팅</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>

          {/* 타겟 고객 */}
          <SectionTitle title="타겟 고객" />
          <TableContainer>
            <Table size="small">
              <TableBody>
                <TableRow>
                  <TableCell sx={ { fontWeight: 600, width: '25%' } }>Primary</TableCell>
                  <TableCell>디자인에 가치를 두는 기업, 브랜드, 개인</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell sx={ { fontWeight: 600 } }>Secondary</TableCell>
                  <TableCell>지속 가능한 디자인에 관심 있는 비영리 단체</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell sx={ { fontWeight: 600 } }>Geographic</TableCell>
                  <TableCell>서울, 뉴욕 중심, 글로벌 프로젝트 수행</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </PageContainer>
      </>
    );
  },
};

/**
 * 비주얼 디렉션 분석
 */
export const VisualDirection = {
  name: '2. Visual Direction',
  render: () => {
    const theme = useTheme();

    return (
      <>
        <DocumentTitle
          title="Visual Direction"
          status="Available"
          note="Groth Studio reference analysis"
          brandName="Forma Studio"
          systemName="Design System"
          version="1.0"
        />
        <PageContainer>
          <Typography variant="h4" sx={ { fontWeight: 700, mb: 1 } }>
            Visual Direction Analysis
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={ { mb: 4 } }>
            Groth Studio 레퍼런스 웹사이트 분석 및 비주얼 디렉션
          </Typography>

          {/* 레이아웃 분석 */}
          <SectionTitle title="레이아웃 구조" description="2컬럼 비대칭 레이아웃" />
          <Box sx={ { mb: 4, p: 3, border: '1px dashed', borderColor: 'divider' } }>
            <Stack direction="row" spacing={ 0 } sx={ { height: 300 } }>
              {/* 메인 콘텐츠 */}
              <Box
                sx={ {
                  flex: 3,
                  bgcolor: 'background.default',
                  p: 3,
                  display: 'flex',
                  flexDirection: 'column',
                } }
              >
                <Typography variant="caption" sx={ { mb: 1, color: 'text.secondary' } }>
                  Main Content (~75%)
                </Typography>
                <Box sx={ { flex: 1, border: '1px dashed', borderColor: 'divider', p: 2 } }>
                  <Typography variant="body2" color="text.secondary">
                    비대칭 그리드 레이아웃<br />
                    프로젝트 카드 + 일러스트레이션<br />
                    점선 구분선
                  </Typography>
                </Box>
              </Box>
              {/* 사이드바 */}
              <Box
                sx={ {
                  flex: 1,
                  bgcolor: 'primary.main',
                  p: 3,
                  color: 'white',
                } }
              >
                <Typography variant="caption" sx={ { mb: 1, opacity: 0.7 } }>
                  Sidebar (~25%)
                </Typography>
                <Typography variant="h6" sx={ { mb: 2 } }>
                  Research & Design
                </Typography>
                <Typography variant="body2" sx={ { opacity: 0.8 } }>
                  고정된 사이드바<br />
                  3개 프로젝트 표시<br />
                  독립 스크롤 영역
                </Typography>
              </Box>
            </Stack>
          </Box>

          <TableContainer sx={ { mb: 4 } }>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={ { fontWeight: 600 } }>요소</TableCell>
                  <TableCell sx={ { fontWeight: 600 } }>특징</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow>
                  <TableCell sx={ { fontWeight: 600 } }>헤더</TableCell>
                  <TableCell>로고 + 시간대 표시 (뉴욕/바르셀로나) + 네비게이션</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell sx={ { fontWeight: 600 } }>메인 콘텐츠</TableCell>
                  <TableCell>비대칭 그리드, 이미지 + 텍스트 + 일러스트레이션 조합</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell sx={ { fontWeight: 600 } }>사이드바</TableCell>
                  <TableCell>테라코타 배경, Research & Design 섹션, 고정 위치</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell sx={ { fontWeight: 600 } }>푸터</TableCell>
                  <TableCell>다크 올리브 배경, 로고 + 네비게이션 + 저작권</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell sx={ { fontWeight: 600 } }>구분선</TableCell>
                  <TableCell>점선(dotted) 스타일 - 건축 도면 느낌</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>

          {/* 색상 분석 */}
          <SectionTitle title="색상 분석" description="따뜻하고 건축적인 팔레트" />
          <Stack direction="row" spacing={ 0 } sx={ { mb: 4, height: 80 } }>
            <Box sx={ { flex: 1, bgcolor: '#F5F0E8', display: 'flex', alignItems: 'flex-end', p: 1 } }>
              <Typography variant="caption" sx={ { fontFamily: 'monospace', fontSize: 10 } }>
                Cream<br />#F5F0E8
              </Typography>
            </Box>
            <Box sx={ { flex: 1, bgcolor: '#C65D3B', display: 'flex', alignItems: 'flex-end', p: 1 } }>
              <Typography variant="caption" sx={ { fontFamily: 'monospace', fontSize: 10, color: 'white' } }>
                Terracotta<br />#C65D3B
              </Typography>
            </Box>
            <Box sx={ { flex: 1, bgcolor: '#3D4A3D', display: 'flex', alignItems: 'flex-end', p: 1 } }>
              <Typography variant="caption" sx={ { fontFamily: 'monospace', fontSize: 10, color: 'white' } }>
                Olive<br />#3D4A3D
              </Typography>
            </Box>
            <Box sx={ { flex: 1, bgcolor: '#000000', display: 'flex', alignItems: 'flex-end', p: 1 } }>
              <Typography variant="caption" sx={ { fontFamily: 'monospace', fontSize: 10, color: 'white' } }>
                Black<br />#000000
              </Typography>
            </Box>
            <Box sx={ { flex: 1, bgcolor: '#FFFFFF', border: '1px solid #E0E0E0', display: 'flex', alignItems: 'flex-end', p: 1 } }>
              <Typography variant="caption" sx={ { fontFamily: 'monospace', fontSize: 10 } }>
                White<br />#FFFFFF
              </Typography>
            </Box>
          </Stack>

          {/* 타이포그래피 분석 */}
          <SectionTitle title="타이포그래피 분석" description="세리프 + 산세리프 조합" />
          <Box sx={ { mb: 4, p: 3, bgcolor: 'background.default' } }>
            <Typography
              sx={ {
                fontFamily: '"Fraunces", serif',
                fontSize: '2rem',
                fontWeight: 500,
                mb: 1,
              } }
            >
              Catskills Residence
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={ { mb: 2 } }>
              프로젝트 제목: Fraunces (세리프) - 건축적이고 클래식한 느낌
            </Typography>
            <Divider sx={ { my: 2 } } />
            <Typography variant="body1" sx={ { mb: 1 } }>
              An 1880s farmhouse thoughtfully transformed into a design-forward,
              energy-efficient retreat.
            </Typography>
            <Typography variant="body2" color="text.secondary">
              본문: Pretendard (산세리프) - 깔끔하고 가독성 높은 본문
            </Typography>
          </Box>

          <TableContainer sx={ { mb: 4 } }>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={ { fontWeight: 600 } }>용도</TableCell>
                  <TableCell sx={ { fontWeight: 600 } }>폰트</TableCell>
                  <TableCell sx={ { fontWeight: 600 } }>특징</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow>
                  <TableCell sx={ { fontWeight: 600 } }>프로젝트 제목</TableCell>
                  <TableCell>Fraunces (세리프)</TableCell>
                  <TableCell>Medium weight, 큰 사이즈, 건축적 느낌</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell sx={ { fontWeight: 600 } }>본문</TableCell>
                  <TableCell>Pretendard (산세리프)</TableCell>
                  <TableCell>Regular weight, 여유로운 행간</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell sx={ { fontWeight: 600 } }>상태 태그</TableCell>
                  <TableCell>Pretendard (산세리프)</TableCell>
                  <TableCell>대문자, 넓은 자간, 작은 사이즈</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell sx={ { fontWeight: 600 } }>네비게이션</TableCell>
                  <TableCell>Pretendard (산세리프)</TableCell>
                  <TableCell>Regular weight, 적절한 자간</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>

          {/* 키 비주얼 요소 */}
          <SectionTitle title="키 비주얼 요소" />
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={ { fontWeight: 600 } }>요소</TableCell>
                  <TableCell sx={ { fontWeight: 600 } }>설명</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow>
                  <TableCell sx={ { fontWeight: 600 } }>이소메트릭 일러스트</TableCell>
                  <TableCell>기하학적 라인 드로잉, 건축 도면 스타일</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell sx={ { fontWeight: 600 } }>점선 구분선</TableCell>
                  <TableCell>dotted border로 섹션 구분, 건축 느낌</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell sx={ { fontWeight: 600 } }>상태 태그</TableCell>
                  <TableCell>IN PROGRESS - 테라코타 배경, 대문자</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell sx={ { fontWeight: 600 } }>View Project →</TableCell>
                  <TableCell>화살표 링크 패턴, 호버 시 테라코타로 변경</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell sx={ { fontWeight: 600 } }>시간대 표시</TableCell>
                  <TableCell>헤더에 글로벌 오피스 시간 표시</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </PageContainer>
      </>
    );
  },
};

/**
 * 웹사이트 컨텐츠 데이터
 */
export const ContentData = {
  name: '3. Content Data',
  render: () => {
    // Spatial, Poster 카테고리 이미지 사용
    const spatialImages = testImages.spatial;
    const posterImages = testImages.poster;

    // 프로젝트 데이터
    const projects = [
      {
        id: 1,
        status: 'IN PROGRESS',
        title: 'Hannam Residence',
        description: 'A contemporary Seoul apartment transformed into a serene, light-filled sanctuary that balances Korean minimalism with warm materiality.',
        category: 'Residential',
        location: 'Seoul, Korea',
        year: '2025',
        image: spatialImages[0],
      },
      {
        id: 2,
        status: 'COMPLETED',
        title: 'Cafe Soleil',
        description: 'A neighborhood cafe in Itaewon featuring custom millwork, natural light, and a connection between indoor and outdoor spaces.',
        category: 'Hospitality',
        location: 'Seoul, Korea',
        year: '2024',
        image: spatialImages[11],
      },
      {
        id: 3,
        status: 'IN PROGRESS',
        title: 'Brooklyn Loft',
        description: 'An industrial loft conversion that preserves original character while introducing biophilic design elements and sustainable materials.',
        category: 'Residential',
        location: 'New York, USA',
        year: '2025',
        image: spatialImages[5],
      },
      {
        id: 4,
        status: 'COMPLETED',
        title: 'Maison Gallery',
        description: 'A contemporary art gallery space designed to create dialogue between artwork, architecture, and natural light.',
        category: 'Retail',
        location: 'Seoul, Korea',
        year: '2024',
        image: spatialImages[13],
      },
    ];

    // Research 데이터
    const research = [
      {
        id: 1,
        title: 'Biophilic Materials Study',
        description: 'Exploring the acoustic properties and construction possibilities of natural, regenerative material selections.',
        image: posterImages[0],
      },
      {
        id: 2,
        title: 'Sustainable Furniture Workshop',
        description: 'A concept proposal for utilizing reclaimed wood and natural fibers to create custom furniture pieces.',
        image: posterImages[2],
      },
      {
        id: 3,
        title: 'Light & Space Research',
        description: 'Investigating the relationship between natural light, spatial perception, and human wellbeing in interior environments.',
        image: posterImages[4],
      },
    ];

    return (
      <>
        <DocumentTitle
          title="Content Data"
          status="Available"
          note="Website content structure"
          brandName="Forma Studio"
          systemName="Design System"
          version="1.0"
        />
        <PageContainer>
          <Typography variant="h4" sx={ { fontWeight: 700, mb: 1 } }>
            Website Content Data
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={ { mb: 4 } }>
            Forma Studio 웹사이트에 사용될 컨텐츠 데이터 (Spatial, Poster 이미지 활용)
          </Typography>

          {/* 히어로 섹션 */}
          <SectionTitle title="Hero Section" description="메인 히어로 영역 컨텐츠" />
          <Box sx={ { mb: 4, p: 4, bgcolor: 'background.default' } }>
            <Typography
              sx={ {
                fontFamily: '"Fraunces", serif',
                fontSize: '3.5rem',
                fontWeight: 500,
                lineHeight: 1,
                mb: 2,
              } }
            >
              Forma
            </Typography>
            <Typography variant="body1" sx={ { maxWidth: 500, mb: 2 } }>
              <strong>Forma</strong> is an architectural and spatial design studio
              specializing in consciously designed environments for businesses,
              nonprofits, and people.
            </Typography>
          </Box>

          {/* 프로젝트 섹션 */}
          <SectionTitle title="Projects Section" description="프로젝트 리스트 컨텐츠" />
          <Box sx={ { mb: 2, p: 3, bgcolor: 'grey.100' } }>
            <Typography
              variant="h5"
              sx={ { textTransform: 'uppercase', letterSpacing: '0.05em', mb: 1 } }
            >
              Projects
            </Typography>
            <Typography variant="body2" color="text.secondary">
              A selection of interior design projects across hospitality, residential,
              and retail, weaving together brand narrative, artisan craft, and natural,
              regenerative material selections.
            </Typography>
          </Box>

          <Grid container spacing={ 3 } sx={ { mb: 4 } }>
            { projects.map((project) => (
              <Grid size={ { xs: 12, md: 6 } } key={ project.id }>
                <Box sx={ { bgcolor: 'background.paper', p: 0 } }>
                  <AspectMedia
                    src={ project.image.src.medium }
                    alt={ project.title }
                    aspectRatio="4/3"
                  />
                  <Box sx={ { p: 2 } }>
                    <Typography
                      variant="overline"
                      sx={ {
                        bgcolor: project.status === 'IN PROGRESS' ? 'primary.main' : 'secondary.main',
                        color: 'white',
                        px: 1,
                        py: 0.25,
                        fontSize: '0.625rem',
                      } }
                    >
                      { project.status }
                    </Typography>
                    <Typography
                      variant="h4"
                      sx={ {
                        fontFamily: '"Fraunces", serif',
                        mt: 1,
                        mb: 1,
                      } }
                    >
                      { project.title }
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={ { mb: 1 } }>
                      { project.description }
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      { project.category } · { project.location } · { project.year }
                    </Typography>
                  </Box>
                </Box>
              </Grid>
            )) }
          </Grid>

          {/* Research 섹션 */}
          <SectionTitle title="Research & Design Section" description="사이드바 리서치 컨텐츠" />
          <Box sx={ { bgcolor: 'primary.main', p: 3, mb: 4 } }>
            <Typography variant="h6" sx={ { color: 'white', mb: 3 } }>
              Research & Design
            </Typography>
            <Stack spacing={ 3 }>
              { research.map((item) => (
                <Box key={ item.id } sx={ { display: 'flex', gap: 2 } }>
                  <Box sx={ { width: 120, flexShrink: 0 } }>
                    <AspectMedia
                      src={ item.image.src.small }
                      alt={ item.title }
                      aspectRatio="1/1"
                    />
                  </Box>
                  <Box>
                    <Typography
                      variant="subtitle2"
                      sx={ { color: 'white', fontWeight: 600, mb: 0.5 } }
                    >
                      { item.title }
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={ { color: 'rgba(255,255,255,0.8)', display: 'block', mb: 1 } }
                    >
                      { item.description }
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={ { color: 'white', display: 'flex', alignItems: 'center', gap: 0.5 } }
                    >
                      View Project →
                    </Typography>
                  </Box>
                </Box>
              )) }
            </Stack>
          </Box>

          {/* 푸터 섹션 */}
          <SectionTitle title="Footer Section" description="푸터 영역 컨텐츠" />
          <Box sx={ { bgcolor: 'secondary.main', p: 4, color: 'white' } }>
            <Stack
              direction={ { xs: 'column', md: 'row' } }
              justifyContent="space-between"
              alignItems={ { xs: 'flex-start', md: 'center' } }
              spacing={ 2 }
            >
              <Box>
                <Typography
                  sx={ {
                    fontFamily: '"Fraunces", serif',
                    fontSize: '1.5rem',
                    fontWeight: 500,
                    mb: 0.5,
                  } }
                >
                  Forma
                </Typography>
                <Typography variant="caption" sx={ { opacity: 0.7 } }>
                  AN ARCHITECTURAL & SPATIAL DESIGN STUDIO
                </Typography>
              </Box>
              <Stack direction="row" spacing={ 3 }>
                <Typography variant="body2">Projects</Typography>
                <Typography variant="body2">Research</Typography>
                <Typography variant="body2">About</Typography>
                <Typography variant="body2">Contact</Typography>
              </Stack>
              <Typography variant="caption" sx={ { opacity: 0.7 } }>
                © 2025 Forma Studio LLC
              </Typography>
            </Stack>
          </Box>

          {/* 컨텐츠 계층 구조 */}
          <SectionTitle title="컨텐츠 계층 구조" description="텍스트 + 이미지 매핑" />
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={ { fontWeight: 600 } }>섹션</TableCell>
                  <TableCell sx={ { fontWeight: 600 } }>타이포그래피</TableCell>
                  <TableCell sx={ { fontWeight: 600 } }>이미지 소스</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow>
                  <TableCell sx={ { fontWeight: 600 } }>Hero</TableCell>
                  <TableCell>h1 (로고) + body1 (소개)</TableCell>
                  <TableCell>-</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell sx={ { fontWeight: 600 } }>Projects</TableCell>
                  <TableCell>h5 (섹션) + h4 (제목) + body2 (설명)</TableCell>
                  <TableCell>testImages.spatial</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell sx={ { fontWeight: 600 } }>Research</TableCell>
                  <TableCell>h6 (섹션) + subtitle2 (제목) + caption (설명)</TableCell>
                  <TableCell>testImages.poster</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell sx={ { fontWeight: 600 } }>Footer</TableCell>
                  <TableCell>h6 (로고) + caption (카피라이트)</TableCell>
                  <TableCell>-</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </PageContainer>
      </>
    );
  },
};
