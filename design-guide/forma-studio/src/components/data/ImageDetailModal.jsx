import { useState, useCallback } from 'react';
import Box from '@mui/material/Box';
import Modal from '@mui/material/Modal';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import CloseIcon from '@mui/icons-material/Close';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import DownloadIcon from '@mui/icons-material/Download';
import ShareIcon from '@mui/icons-material/Share';
import EditIcon from '@mui/icons-material/Edit';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';

/**
 * MetaItem 컴포넌트
 *
 * 메타데이터 항목을 라벨-값 쌍으로 표시하는 내부 컴포넌트.
 *
 * Props:
 * @param {string} label - 항목 라벨 [Required]
 * @param {React.ReactNode} value - 항목 값 [Required]
 */
function MetaItem({ label, value }) {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 0.75 }}>
      <Typography variant="caption" color="text.secondary">
        {label}
      </Typography>
      <Typography variant="caption" sx={{ fontWeight: 500 }} component="div">
        {value || '-'}
      </Typography>
    </Box>
  );
}

/**
 * ImageDetailModal 컴포넌트
 *
 * 레퍼런스의 고화질 이미지와 메타데이터를 표시하는 오버레이 모달.
 * 이미지 상세 보기, 태그 확인, 무드보드 추가 등의 액션을 제공.
 *
 * 동작 방식:
 * 1. 모달 열림 시 선택된 이미지를 대형으로 표시
 * 2. 좌우 화살표로 이전/다음 이미지 탐색
 * 3. 메타데이터 패널에서 상세 정보 확인
 * 4. 액션 버튼으로 좋아요, 다운로드, 공유, 편집 가능
 *
 * Props:
 * @param {boolean} isOpen - 모달 열림 상태 [Required]
 * @param {function} onClose - 모달 닫기 핸들러 [Required]
 * @param {object} asset - 현재 표시할 에셋 데이터 [Required]
 *   - {string} id - 에셋 ID
 *   - {string} title - 에셋 제목
 *   - {string} thumbnail - 이미지 URL
 *   - {string} type - 에셋 타입 (image/video)
 *   - {string} format - 파일 포맷
 *   - {string} resolution - 해상도
 *   - {string} size - 파일 크기
 *   - {string[]} tags - 태그 목록
 *   - {string} license - 라이센스 정보
 *   - {string} status - 상태 (approved/pending)
 * @param {boolean} isLiked - 좋아요 상태 [Optional, 기본값: false]
 * @param {function} onLike - 좋아요 토글 핸들러 [Optional]
 * @param {function} onDownload - 다운로드 핸들러 [Optional]
 * @param {function} onShare - 공유 핸들러 [Optional]
 * @param {function} onEdit - 편집 핸들러 [Optional]
 * @param {function} onAddToBoard - 무드보드 추가 핸들러 [Optional]
 * @param {function} onPrevious - 이전 이미지 핸들러 [Optional]
 * @param {function} onNext - 다음 이미지 핸들러 [Optional]
 * @param {boolean} hasPrevious - 이전 이미지 존재 여부 [Optional, 기본값: false]
 * @param {boolean} hasNext - 다음 이미지 존재 여부 [Optional, 기본값: false]
 *
 * Example usage:
 * <ImageDetailModal
 *   isOpen={modalOpen}
 *   onClose={handleClose}
 *   asset={selectedAsset}
 *   onLike={handleLike}
 *   onAddToBoard={handleAddToBoard}
 *   onPrevious={handlePrev}
 *   onNext={handleNext}
 * />
 */
export function ImageDetailModal({
  isOpen,
  onClose,
  asset,
  isLiked = false,
  onLike,
  onDownload,
  onShare,
  onEdit,
  onAddToBoard,
  onPrevious,
  onNext,
  hasPrevious = false,
  hasNext = false,
}) {
  const [showInfo, setShowInfo] = useState(true);

  /**
   * 키보드 내비게이션
   */
  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === 'ArrowLeft' && hasPrevious && onPrevious) {
        onPrevious();
      } else if (e.key === 'ArrowRight' && hasNext && onNext) {
        onNext();
      } else if (e.key === 'Escape') {
        onClose();
      }
    },
    [hasPrevious, hasNext, onPrevious, onNext, onClose]
  );

  if (!asset) return null;

  return (
    <Modal
      open={isOpen}
      onClose={onClose}
      onKeyDown={handleKeyDown}
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Box
        sx={{
          position: 'relative',
          display: 'flex',
          width: '95vw',
          maxWidth: 1400,
          height: '90vh',
          bgcolor: 'background.paper',
          borderRadius: 2,
          overflow: 'hidden',
          outline: 'none',
          boxShadow: 24,
        }}
      >
        {/* 닫기 버튼 */}
        <IconButton
          onClick={onClose}
          sx={{
            position: 'absolute',
            top: 12,
            right: 12,
            zIndex: 10,
            bgcolor: 'rgba(0, 0, 0, 0.5)',
            color: 'white',
            '&:hover': {
              bgcolor: 'rgba(0, 0, 0, 0.7)',
            },
          }}
        >
          <CloseIcon />
        </IconButton>

        {/* 이미지 영역 */}
        <Box
          sx={{
            flex: 1,
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: 'grey.900',
            minWidth: 0,
          }}
        >
          {/* 이전 버튼 */}
          {hasPrevious && onPrevious && (
            <IconButton
              onClick={onPrevious}
              sx={{
                position: 'absolute',
                left: 16,
                zIndex: 5,
                bgcolor: 'rgba(255, 255, 255, 0.9)',
                '&:hover': {
                  bgcolor: 'white',
                },
              }}
            >
              <ChevronLeftIcon />
            </IconButton>
          )}

          {/* 메인 이미지 */}
          <Box
            component="img"
            src={asset.thumbnail}
            alt={asset.title}
            sx={{
              maxWidth: '100%',
              maxHeight: '100%',
              objectFit: 'contain',
            }}
          />

          {/* 다음 버튼 */}
          {hasNext && onNext && (
            <IconButton
              onClick={onNext}
              sx={{
                position: 'absolute',
                right: 16,
                zIndex: 5,
                bgcolor: 'rgba(255, 255, 255, 0.9)',
                '&:hover': {
                  bgcolor: 'white',
                },
              }}
            >
              <ChevronRightIcon />
            </IconButton>
          )}

          {/* 정보 토글 버튼 */}
          <Tooltip title={showInfo ? 'Hide info' : 'Show info'}>
            <IconButton
              onClick={() => setShowInfo(!showInfo)}
              sx={{
                position: 'absolute',
                bottom: 16,
                right: 16,
                bgcolor: 'rgba(0, 0, 0, 0.5)',
                color: 'white',
                '&:hover': {
                  bgcolor: 'rgba(0, 0, 0, 0.7)',
                },
              }}
            >
              <InfoOutlinedIcon />
            </IconButton>
          </Tooltip>
        </Box>

        {/* 정보 패널 */}
        {showInfo && (
          <Box
            sx={{
              width: 340,
              flexShrink: 0,
              display: 'flex',
              flexDirection: 'column',
              borderLeft: '1px solid',
              borderColor: 'divider',
              overflow: 'hidden',
            }}
          >
            {/* 헤더 */}
            <Box sx={{ p: 3, pb: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>
                {asset.title}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {asset.type?.toUpperCase()} • {asset.format}
              </Typography>
            </Box>

            {/* 액션 버튼 */}
            <Box sx={{ px: 3, pb: 2, display: 'flex', gap: 1 }}>
              <Tooltip title={isLiked ? 'Unlike' : 'Like'}>
                <IconButton
                  onClick={onLike}
                  sx={{
                    color: isLiked ? 'error.main' : 'text.secondary',
                    border: '1px solid',
                    borderColor: 'divider',
                  }}
                >
                  {isLiked ? <FavoriteIcon /> : <FavoriteBorderIcon />}
                </IconButton>
              </Tooltip>
              <Tooltip title="Download">
                <IconButton
                  onClick={onDownload}
                  sx={{
                    color: 'text.secondary',
                    border: '1px solid',
                    borderColor: 'divider',
                  }}
                >
                  <DownloadIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="Share">
                <IconButton
                  onClick={onShare}
                  sx={{
                    color: 'text.secondary',
                    border: '1px solid',
                    borderColor: 'divider',
                  }}
                >
                  <ShareIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="Edit">
                <IconButton
                  onClick={onEdit}
                  sx={{
                    color: 'text.secondary',
                    border: '1px solid',
                    borderColor: 'divider',
                  }}
                >
                  <EditIcon />
                </IconButton>
              </Tooltip>
            </Box>

            <Divider />

            {/* 메타데이터 */}
            <Box sx={{ p: 3, flex: 1, overflow: 'auto' }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5 }}>
                Details
              </Typography>
              <MetaItem label="Resolution" value={asset.resolution} />
              <MetaItem label="File Size" value={asset.size} />
              <MetaItem label="Duration" value={asset.duration} />
              <MetaItem label="License" value={asset.license} />
              <MetaItem
                label="Status"
                value={
                  <Chip
                    label={asset.status}
                    size="small"
                    color={asset.status === 'approved' ? 'success' : 'warning'}
                    sx={{ height: 20, fontSize: '0.7rem' }}
                  />
                }
              />

              <Divider sx={{ my: 2 }} />

              {/* 태그 */}
              <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5 }}>
                Tags
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
                {asset.tags?.map((tag) => (
                  <Chip
                    key={tag}
                    label={`#${tag}`}
                    size="small"
                    variant="outlined"
                    sx={{
                      fontWeight: 500,
                      cursor: 'pointer',
                      '&:hover': {
                        backgroundColor: 'action.hover',
                      },
                    }}
                  />
                ))}
              </Box>
            </Box>

            {/* 하단 CTA */}
            {onAddToBoard && (
              <Box sx={{ p: 3, borderTop: '1px solid', borderColor: 'divider' }}>
                <Button
                  variant="contained"
                  fullWidth
                  size="large"
                  onClick={onAddToBoard}
                  sx={{
                    textTransform: 'none',
                    fontWeight: 600,
                  }}
                >
                  Add to Moodboard
                </Button>
              </Box>
            )}
          </Box>
        )}
      </Box>
    </Modal>
  );
}
