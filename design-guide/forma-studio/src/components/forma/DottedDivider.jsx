import Box from '@mui/material/Box';

/**
 * DottedDivider 컴포넌트
 *
 * 점선 구분선. Groth Studio 스타일의 건축 도면 느낌.
 *
 * Props:
 * @param {string} orientation - 방향 (horizontal/vertical) [Optional, 기본값: horizontal]
 * @param {number} spacing - 상하/좌우 여백 (theme.spacing 단위) [Optional, 기본값: 4]
 * @param {string} color - 점선 색상 [Optional, 기본값: divider]
 * @param {object} sx - 추가 스타일 [Optional]
 *
 * Example usage:
 * <DottedDivider />
 * <DottedDivider orientation="vertical" />
 * <DottedDivider spacing={6} color="primary.main" />
 */
function DottedDivider({
  orientation = 'horizontal',
  spacing = 4,
  color = 'divider',
  sx = {},
}) {
  const isHorizontal = orientation === 'horizontal';

  return (
    <Box
      sx={ {
        ...(isHorizontal
          ? {
              width: '100%',
              height: 0,
              borderTop: '1px dashed',
              borderColor: color,
              my: spacing,
            }
          : {
              width: 0,
              height: '100%',
              borderLeft: '1px dashed',
              borderColor: color,
              mx: spacing,
            }),
        ...sx,
      } }
    />
  );
}

export default DottedDivider;
