import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import { useTheme } from '@mui/material/styles';
import {
  DocumentTitle,
  PageContainer,
  SectionTitle,
  TreeNode,
} from '../../components/storybookDocumentation';

export default {
  title: 'Style/Colors',
  parameters: {
    layout: 'padded',
  },
};

/** 팔레트 스케일 컴포넌트 - 큰 블록 형태 */
const PaletteScale = ({ name, colorObj, description }) => (
  <Box sx={ { mb: 6 } }>
    <Typography variant="h6" sx={ { fontWeight: 600, mb: 0.5 } }>{ name }</Typography>
    <Typography variant="body2" color="text.secondary" sx={ { mb: 2 } }>{ description }</Typography>
    <Box sx={ { display: 'flex', flexWrap: 'wrap', gap: 1 } }>
      { [50, 100, 200, 300, 400, 500, 600, 700, 800, 900].map((shade) => (
        <Box
          key={ shade }
          sx={ {
            width: 80,
            height: 80,
            backgroundColor: colorObj[shade],
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: 1,
          } }
        >
          <Typography
            variant="caption"
            sx={ {
              color: shade >= 400 ? 'white' : 'rgba(0,0,0,0.7)',
              fontSize: 12,
              fontWeight: 700,
            } }
          >
            { shade }
          </Typography>
          <Typography
            variant="caption"
            sx={ {
              color: shade >= 400 ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.5)',
              fontSize: 10,
              fontFamily: 'monospace',
            } }
          >
            { colorObj[shade] }
          </Typography>
        </Box>
      )) }
    </Box>
  </Box>
);

/** 시멘틱 토큰 블록 컴포넌트 */
const SemanticColorBlock = ({ name, colorObj, description }) => {
  const shades = ['light', 'main', 'dark'];
  return (
    <Box sx={ { mb: 6 } }>
      <Typography variant="h6" sx={ { fontWeight: 600, mb: 0.5 } }>{ name }</Typography>
      <Typography variant="body2" color="text.secondary" sx={ { mb: 2 } }>{ description }</Typography>
      <Box sx={ { display: 'flex', flexWrap: 'wrap', gap: 1 } }>
        { shades.map((shade) => {
          const color = colorObj[shade];
          const isLight = shade === 'light';
          return (
            <Box
              key={ shade }
              sx={ {
                width: 120,
                height: 80,
                backgroundColor: color,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: 1,
                border: isLight ? '1px solid rgba(0,0,0,0.1)' : 'none',
              } }
            >
              <Typography
                variant="caption"
                sx={ {
                  color: isLight ? 'rgba(0,0,0,0.7)' : 'white',
                  fontSize: 12,
                  fontWeight: 700,
                } }
              >
                { shade }
              </Typography>
              <Typography
                variant="caption"
                sx={ {
                  color: isLight ? 'rgba(0,0,0,0.5)' : 'rgba(255,255,255,0.7)',
                  fontSize: 10,
                  fontFamily: 'monospace',
                } }
              >
                { color }
              </Typography>
            </Box>
          );
        }) }
      </Box>
    </Box>
  );
};

/** 단일 색상 블록 컴포넌트 */
const SingleColorBlock = ({ name, color, hasBorder = false }) => (
  <Box
    sx={ {
      width: 120,
      height: 80,
      backgroundColor: color,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 1,
      border: hasBorder ? '1px solid rgba(0,0,0,0.1)' : 'none',
    } }
  >
    <Typography
      variant="caption"
      sx={ {
        color: hasBorder ? 'rgba(0,0,0,0.7)' : 'white',
        fontSize: 12,
        fontWeight: 700,
      } }
    >
      { name }
    </Typography>
    <Typography
      variant="caption"
      sx={ {
        color: hasBorder ? 'rgba(0,0,0,0.5)' : 'rgba(255,255,255,0.7)',
        fontSize: 10,
        fontFamily: 'monospace',
      } }
    >
      { color }
    </Typography>
  </Box>
);

/** Docs - Forma Studio 색상 시스템 문서 */
export const Docs = {
  render: () => {
    const theme = useTheme();

    // 토큰 구조 (트리 뷰용)
    const tokenStructure = {
      palette: {
        primary: theme.palette.primary,
        secondary: theme.palette.secondary,
        error: theme.palette.error,
        warning: theme.palette.warning,
        success: theme.palette.success,
        info: theme.palette.info,
        text: theme.palette.text,
        background: theme.palette.background,
        divider: theme.palette.divider,
        brand: theme.palette.brand,
      },
    };

    // 토큰 값 (테이블용)
    const tokenValues = [
      { token: 'primary.main', value: theme.palette.primary.main, description: '테라코타 - CTA, 액센트 강조' },
      { token: 'primary.light', value: theme.palette.primary.light, description: 'hover 상태, 밝은 강조' },
      { token: 'primary.dark', value: theme.palette.primary.dark, description: 'active 상태, 어두운 강조' },
      { token: 'secondary.main', value: theme.palette.secondary.main, description: '다크 올리브 - 푸터, 보조 영역' },
      { token: 'background.default', value: theme.palette.background.default, description: '크림 베이지 - 페이지 배경' },
      { token: 'background.paper', value: theme.palette.background.paper, description: '화이트 - 카드, 모달' },
      { token: 'text.primary', value: theme.palette.text.primary, description: '순수 블랙 - 주요 텍스트' },
      { token: 'text.secondary', value: theme.palette.text.secondary, description: '보조 텍스트, 캡션' },
      { token: 'divider', value: theme.palette.divider, description: '구분선, 보더' },
      { token: 'brand.terracotta', value: theme.palette.brand?.terracotta, description: '브랜드 테라코타' },
      { token: 'brand.cream', value: theme.palette.brand?.cream, description: '브랜드 크림' },
      { token: 'brand.olive', value: theme.palette.brand?.olive, description: '브랜드 올리브' },
    ];

    return (
      <>
        <DocumentTitle
          title="Color System"
          status="Available"
          note="Forma Studio color palette"
          brandName="Forma Studio"
          systemName="Design System"
          version="1.0"
        />
        <PageContainer>
          {/* 제목 + 1줄 개요 */}
          <Typography variant="h4" sx={ { fontWeight: 700, mb: 1 } }>
            Forma Studio Color System
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={ { mb: 4 } }>
            건축적이고 따뜻한 느낌의 색상 팔레트입니다. Groth Studio 레퍼런스 기반.
          </Typography>

          {/* 브랜드 컬러 프리뷰 */}
          <SectionTitle title="브랜드 컬러" description="Forma Studio 핵심 색상" />
          <Stack direction="row" spacing={ 0 } sx={ { mb: 4, height: 120 } }>
            <Box sx={ { flex: 1, bgcolor: '#F5F0E8', display: 'flex', alignItems: 'flex-end', p: 2 } }>
              <Typography variant="caption" sx={ { fontFamily: 'monospace' } }>Cream #F5F0E8</Typography>
            </Box>
            <Box sx={ { flex: 1, bgcolor: '#C65D3B', display: 'flex', alignItems: 'flex-end', p: 2 } }>
              <Typography variant="caption" sx={ { fontFamily: 'monospace', color: 'white' } }>Terracotta #C65D3B</Typography>
            </Box>
            <Box sx={ { flex: 1, bgcolor: '#3D4A3D', display: 'flex', alignItems: 'flex-end', p: 2 } }>
              <Typography variant="caption" sx={ { fontFamily: 'monospace', color: 'white' } }>Olive #3D4A3D</Typography>
            </Box>
            <Box sx={ { flex: 1, bgcolor: '#000000', display: 'flex', alignItems: 'flex-end', p: 2 } }>
              <Typography variant="caption" sx={ { fontFamily: 'monospace', color: 'white' } }>Black #000000</Typography>
            </Box>
          </Stack>

          {/* 토큰 구조 (트리 뷰) */}
          <SectionTitle title="토큰 구조" description="theme.palette 계층 구조" />
          <Box sx={ { p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 1, mb: 4 } }>
            { Object.entries(tokenStructure).map(([key, value]) => (
              <TreeNode key={ key } keyName={ key } value={ value } defaultOpen />
            )) }
          </Box>

          {/* 토큰 값 (테이블) */}
          <SectionTitle title="토큰 값" description="주요 색상 토큰의 실제 값" />
          <TableContainer sx={ { mb: 4 } }>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={ { fontWeight: 600 } }>Token</TableCell>
                  <TableCell sx={ { fontWeight: 600 } }>Value</TableCell>
                  <TableCell sx={ { fontWeight: 600 } }>Preview</TableCell>
                  <TableCell sx={ { fontWeight: 600 } }>설명</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                { tokenValues.map((row) => (
                  <TableRow key={ row.token }>
                    <TableCell sx={ { fontFamily: 'monospace', fontSize: 13 } }>{ row.token }</TableCell>
                    <TableCell sx={ { fontFamily: 'monospace', fontSize: 13 } }>{ row.value }</TableCell>
                    <TableCell>
                      <Box
                        sx={ {
                          width: 24,
                          height: 24,
                          backgroundColor: row.value,
                          border: '1px solid',
                          borderColor: 'divider',
                          borderRadius: '4px',
                        } }
                      />
                    </TableCell>
                    <TableCell sx={ { color: 'text.secondary', fontSize: 13 } }>{ row.description }</TableCell>
                  </TableRow>
                )) }
              </TableBody>
            </Table>
          </TableContainer>

          {/* 사용 예시 */}
          <SectionTitle title="사용 예시" description="MUI sx prop에서의 색상 토큰 활용" />
          <Box
            component="pre"
            sx={ {
              backgroundColor: 'grey.100',
              p: 2,
              fontSize: 12,
              fontFamily: 'monospace',
              overflow: 'auto',
              borderRadius: 1,
              mb: 4,
            } }
          >
{ `// Forma Studio 배경색
<Box sx={{ backgroundColor: 'background.default' }} />  // 크림 베이지
<Box sx={{ backgroundColor: 'primary.main' }} />        // 테라코타 (사이드바)
<Box sx={{ backgroundColor: 'secondary.main' }} />      // 다크 올리브 (푸터)

// 텍스트 색상
<Typography sx={{ color: 'text.primary' }}>주요 텍스트</Typography>  // 순수 블랙
<Typography sx={{ color: 'text.secondary' }}>보조 텍스트</Typography>

// 브랜드 컬러 직접 사용
<Box sx={{ backgroundColor: 'brand.terracotta' }} />
<Box sx={{ backgroundColor: 'brand.cream' }} />
<Box sx={{ backgroundColor: 'brand.olive' }} />

// 액센트 영역
<Box sx={{
  backgroundColor: 'primary.main',  // 테라코타 배경
  color: 'white',
  p: 3,
}} />` }
          </Box>

          {/* Vibe Coding Prompt */}
          <SectionTitle
            title="Vibe Coding Prompt"
            description="AI 코딩 도구에서 활용할 수 있는 프롬프트 예시"
          />
          <Box
            component="pre"
            sx={ {
              backgroundColor: 'grey.900',
              color: 'grey.100',
              p: 2,
              fontSize: 12,
              fontFamily: 'monospace',
              overflow: 'auto',
              borderRadius: 1,
            } }
          >
{ `/* Forma Studio 색상 프롬프트 */

"Groth Studio 스타일로 2컬럼 레이아웃을 만들어줘.
좌측은 background.default (크림 #F5F0E8),
우측 사이드바는 primary.main (테라코타 #C65D3B) 배경으로."

"푸터 영역을 secondary.main (다크 올리브 #3D4A3D) 배경에
흰색 텍스트로 만들어줘. 로고와 네비게이션 포함."

"프로젝트 카드를 만들어줘. 크림 배경에 순수 블랙 타이틀,
호버 시 테라코타 보더가 나타나도록."

"'IN PROGRESS' 상태 태그를 테라코타 배경에
흰색 텍스트, overline 스타일로 만들어줘."` }
          </Box>
        </PageContainer>
      </>
    );
  },
};

/** 1. Brand Palette - Forma Studio 브랜드 색상 */
export const Palette = {
  name: '1. Brand Palette',
  render: () => {
    const theme = useTheme();

    // Forma Studio 커스텀 그레이 스케일
    const formaGrey = theme.palette.grey;

    return (
      <>
        <DocumentTitle
          title="Brand Palette"
          status="Available"
          note="Forma Studio brand colors"
          brandName="Forma Studio"
          systemName="Design System"
          version="1.0"
        />
        <PageContainer>
          <Typography variant="h4" sx={ { fontWeight: 700, mb: 1 } }>
            Forma Studio Brand Palette
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={ { mb: 4 } }>
            건축적이고 따뜻한 느낌의 Forma Studio 브랜드 색상 팔레트입니다.
          </Typography>

          <Divider sx={ { mb: 4 } } />

          {/* Primary - Terracotta */}
          <SemanticColorBlock
            name="Primary (Terracotta)"
            colorObj={ theme.palette.primary }
            description="CTA, 액센트, 사이드바 배경"
          />

          {/* Secondary - Olive */}
          <SemanticColorBlock
            name="Secondary (Olive)"
            colorObj={ theme.palette.secondary }
            description="푸터, 보조 영역, 다크 모드"
          />

          {/* Grey Scale */}
          <Box sx={ { mb: 6 } }>
            <Typography variant="h6" sx={ { fontWeight: 600, mb: 0.5 } }>Warm Grey Scale</Typography>
            <Typography variant="body2" color="text.secondary" sx={ { mb: 2 } }>따뜻한 톤의 그레이 스케일</Typography>
            <Box sx={ { display: 'flex', flexWrap: 'wrap', gap: 1 } }>
              { [50, 100, 200, 300, 400, 500, 600, 700, 800, 900].map((shade) => (
                <Box
                  key={ shade }
                  sx={ {
                    width: 80,
                    height: 80,
                    backgroundColor: formaGrey[shade],
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: 0,
                  } }
                >
                  <Typography
                    variant="caption"
                    sx={ {
                      color: shade >= 400 ? 'white' : 'rgba(0,0,0,0.7)',
                      fontSize: 12,
                      fontWeight: 700,
                    } }
                  >
                    { shade }
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={ {
                      color: shade >= 400 ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.5)',
                      fontSize: 10,
                      fontFamily: 'monospace',
                    } }
                  >
                    { formaGrey[shade] }
                  </Typography>
                </Box>
              )) }
            </Box>
          </Box>

          <SectionTitle title="색상 조합 가이드" />

          <TableContainer>
            <Table size="small">
              <TableBody>
                <TableRow>
                  <TableCell sx={ { fontWeight: 600, width: '25%' } }>메인 배경</TableCell>
                  <TableCell>Cream (#F5F0E8) - 따뜻하고 부드러운 베이지</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell sx={ { fontWeight: 600 } }>액센트 배경</TableCell>
                  <TableCell>Terracotta (#C65D3B) - 사이드바, 강조 영역</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell sx={ { fontWeight: 600 } }>다크 영역</TableCell>
                  <TableCell>Olive (#3D4A3D) - 푸터, 다크 섹션</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell sx={ { fontWeight: 600 } }>텍스트</TableCell>
                  <TableCell>Black (#000000) - 순수 블랙으로 명확한 대비</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell sx={ { fontWeight: 600 } }>구분선</TableCell>
                  <TableCell>점선(dotted) 스타일 권장 - 건축적 느낌</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </PageContainer>
      </>
    );
  },
};

/** 2. Semantic Tokens - Forma Studio 역할별 색상 */
export const SemanticTokens = {
  name: '2. Semantic Tokens',
  render: () => {
    const theme = useTheme();
    return (
      <>
        <DocumentTitle
          title="Semantic Tokens"
          status="Available"
          note="Forma Studio role-based colors"
          brandName="Forma Studio"
          systemName="Design System"
          version="1.0"
        />
        <PageContainer>
          <Typography variant="h4" sx={ { fontWeight: 700, mb: 1 } }>
            Semantic Tokens (역할별 색상)
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={ { mb: 4 } }>
            Forma Studio 브랜드에 맞게 역할을 부여한 시멘틱 컬러 토큰입니다.
          </Typography>

          <SectionTitle title="브랜드 색상" />

          <SemanticColorBlock
            name="Primary (Terracotta)"
            colorObj={ theme.palette.primary }
            description="CTA 버튼, 액센트, 사이드바 배경"
          />
          <SemanticColorBlock
            name="Secondary (Olive)"
            colorObj={ theme.palette.secondary }
            description="푸터, 다크 영역, 보조 액션"
          />

          <SectionTitle
            title="상태 색상 (Feedback Colors)"
            description="브랜드 톤에 맞춘 상태 피드백 색상입니다."
          />

          <SemanticColorBlock
            name="Error"
            colorObj={ theme.palette.error }
            description="오류, 삭제 - 테라코타 계열"
          />
          <SemanticColorBlock
            name="Warning"
            colorObj={ theme.palette.warning }
            description="주의, 경고 - 따뜻한 옐로우"
          />
          <SemanticColorBlock
            name="Success"
            colorObj={ theme.palette.success }
            description="성공, 완료 - 올리브 그린"
          />
          <SemanticColorBlock
            name="Info"
            colorObj={ theme.palette.info }
            description="정보, 안내 - 뮤트된 블루그레이"
          />

          <SectionTitle title="텍스트 색상" />

          <Box sx={ { mb: 6 } }>
            <Typography variant="h6" sx={ { fontWeight: 600, mb: 0.5 } }>Text</Typography>
            <Typography variant="body2" color="text.secondary" sx={ { mb: 2 } }>Groth 스타일 - 순수 블랙 기반</Typography>
            <Box sx={ { display: 'flex', flexWrap: 'wrap', gap: 1 } }>
              <SingleColorBlock name="primary" color={ theme.palette.text.primary } />
              <SingleColorBlock name="secondary" color={ theme.palette.text.secondary } />
              <SingleColorBlock name="disabled" color={ theme.palette.text.disabled } />
            </Box>
          </Box>

          <SectionTitle title="배경 색상" />

          <Box sx={ { mb: 6 } }>
            <Typography variant="h6" sx={ { fontWeight: 600, mb: 0.5 } }>Background</Typography>
            <Typography variant="body2" color="text.secondary" sx={ { mb: 2 } }>Forma Studio 레이아웃 배경</Typography>
            <Box sx={ { display: 'flex', flexWrap: 'wrap', gap: 1 } }>
              <SingleColorBlock name="default (Cream)" color={ theme.palette.background.default } hasBorder />
              <SingleColorBlock name="paper (White)" color={ theme.palette.background.paper } hasBorder />
              <SingleColorBlock name="accent" color={ theme.palette.primary.main } />
              <SingleColorBlock name="dark" color={ theme.palette.secondary.main } />
            </Box>
          </Box>
        </PageContainer>
      </>
    );
  },
};

/** 3. Usage - Forma Studio 색상 활용 */
export const Usage = {
  name: '3. Usage',
  render: () => (
    <>
      <DocumentTitle
        title="Color Usage"
        status="Available"
        note="Forma Studio color application"
        brandName="Forma Studio"
        systemName="Design System"
        version="1.0"
      />
      <PageContainer>
        <Typography variant="h4" sx={ { fontWeight: 700, mb: 1 } }>
          Forma Studio 색상 적용 예시
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={ { mb: 4 } }>
          Groth Studio 스타일의 2컬럼 레이아웃에서 색상이 어떻게 사용되는지 확인합니다.
        </Typography>

        <SectionTitle
          title="레이아웃 색상 구조"
          description="메인 콘텐츠와 사이드바의 색상 구분"
        />

        <Box
          component="pre"
          sx={ {
            backgroundColor: '#f5f5f5',
            p: 2,
            fontSize: 12,
            fontFamily: 'monospace',
            overflow: 'auto',
            mb: 4,
          } }
        >
{ `// 메인 콘텐츠 영역 (크림 배경)
<Box sx={{ backgroundColor: 'background.default', minHeight: '100vh' }}>
  <Typography sx={{ color: 'text.primary' }}>순수 블랙 텍스트</Typography>
</Box>

// 사이드바 (테라코타 배경)
<Box sx={{ backgroundColor: 'primary.main', color: 'white' }}>
  <Typography variant="h6">Research & Design</Typography>
</Box>

// 푸터 (다크 올리브)
<Box sx={{ backgroundColor: 'secondary.main', color: 'white' }}>
  <Typography>Forma Studio © 2025</Typography>
</Box>` }
        </Box>

        <SectionTitle
          title="프로젝트 카드 스타일"
          description="Groth 스타일 프로젝트 카드 색상 사용법"
        />

        <Box
          component="pre"
          sx={ {
            backgroundColor: '#f5f5f5',
            p: 2,
            fontSize: 12,
            fontFamily: 'monospace',
            overflow: 'auto',
            mb: 4,
          } }
        >
{ `// 프로젝트 카드
<Box sx={{ bgcolor: 'background.paper', p: 3 }}>
  {/* 상태 태그 */}
  <Typography
    variant="overline"
    sx={{
      bgcolor: 'primary.main',
      color: 'white',
      px: 1,
      py: 0.5,
    }}
  >
    IN PROGRESS
  </Typography>

  {/* 프로젝트 제목 - 세리프 */}
  <Typography variant="h2">
    Catskills Residence
  </Typography>

  {/* 설명 */}
  <Typography variant="body1" color="text.secondary">
    An 1880s farmhouse thoughtfully transformed...
  </Typography>

  {/* View Project 링크 */}
  <Typography
    sx={{
      color: 'text.primary',
      '&:hover': { color: 'primary.main' }
    }}
  >
    View Project →
  </Typography>
</Box>

// 점선 구분선
<Box sx={{
  borderTop: '1px dashed',
  borderColor: 'divider',
  my: 4
}} />` }
        </Box>

        <SectionTitle
          title="sx prop으로 브랜드 컬러 사용"
          description="brand 토큰 직접 참조"
        />

        <Box
          component="pre"
          sx={ {
            backgroundColor: '#f5f5f5',
            p: 2,
            fontSize: 12,
            fontFamily: 'monospace',
            overflow: 'auto',
          } }
        >
{ `// brand 토큰 사용
<Box sx={{ backgroundColor: 'brand.terracotta' }} />
<Box sx={{ backgroundColor: 'brand.cream' }} />
<Box sx={{ backgroundColor: 'brand.olive' }} />
<Box sx={{ backgroundColor: 'brand.sand' }} />

// 호버 효과
<Box sx={{
  backgroundColor: 'background.default',
  '&:hover': {
    borderColor: 'primary.main',
    borderWidth: 2,
  }
}} />` }
        </Box>
      </PageContainer>
    </>
  ),
};
