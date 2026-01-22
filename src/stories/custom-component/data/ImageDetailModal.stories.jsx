import { useState } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { ImageDetailModal } from '../../../components/data/ImageDetailModal';
import { museAssets } from '../../../data/museMockData';

export default {
  title: 'Custom Component/Overlay/ImageDetailModal',
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: `
## ImageDetailModal

레퍼런스 이미지 상세 보기 모달 컴포넌트.

### 기능
- 이미지 상세 정보 표시 (제목, 태그, 메타데이터)
- 좋아요, 다운로드, 공유, 편집 액션
- 이전/다음 네비게이션 지원
- 다양한 에셋 타입 (이미지, 비디오) 지원
        `,
      },
    },
  },
};

/**
 * ImageDetailModal 기본 사용 예시
 */
export const ImageDetailModalDefault = {
  render: () => {
    const [isOpen, setIsOpen] = useState(false);
    const [isLiked, setIsLiked] = useState(false);

    return (
      <Box>
        <Button variant="contained" onClick={() => setIsOpen(true)}>
          Open Image Detail
        </Button>
        <ImageDetailModal
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          asset={museAssets[0]}
          isLiked={isLiked}
          onLike={() => setIsLiked(!isLiked)}
          onDownload={() => console.log('Download')}
          onShare={() => console.log('Share')}
          onEdit={() => console.log('Edit')}
          onAddToBoard={() => console.log('Add to board')}
        />
      </Box>
    );
  },
};

/**
 * ImageDetailModal with Navigation
 */
export const ImageDetailModalWithNavigation = {
  render: () => {
    const [isOpen, setIsOpen] = useState(false);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [likedIds, setLikedIds] = useState([]);

    const handlePrevious = () => {
      setCurrentIndex((prev) => Math.max(0, prev - 1));
    };

    const handleNext = () => {
      setCurrentIndex((prev) => Math.min(museAssets.length - 1, prev + 1));
    };

    const handleLike = () => {
      const assetId = museAssets[currentIndex].id;
      setLikedIds((prev) =>
        prev.includes(assetId)
          ? prev.filter((id) => id !== assetId)
          : [...prev, assetId]
      );
    };

    return (
      <Box>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Click any image to open the detail modal with navigation
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          {museAssets.map((asset, index) => (
            <Box
              key={asset.id}
              onClick={() => {
                setCurrentIndex(index);
                setIsOpen(true);
              }}
              sx={{
                width: 120,
                height: 80,
                borderRadius: 1,
                overflow: 'hidden',
                cursor: 'pointer',
                border: '2px solid',
                borderColor: currentIndex === index ? 'primary.main' : 'transparent',
                transition: 'all 0.2s',
                '&:hover': {
                  transform: 'scale(1.05)',
                },
              }}
            >
              <Box
                component="img"
                src={asset.thumbnail}
                alt={asset.title}
                sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </Box>
          ))}
        </Box>
        <ImageDetailModal
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          asset={museAssets[currentIndex]}
          isLiked={likedIds.includes(museAssets[currentIndex]?.id)}
          onLike={handleLike}
          onDownload={() => console.log('Download:', museAssets[currentIndex]?.title)}
          onShare={() => console.log('Share:', museAssets[currentIndex]?.title)}
          onEdit={() => console.log('Edit:', museAssets[currentIndex]?.title)}
          onAddToBoard={() => console.log('Add to board:', museAssets[currentIndex]?.title)}
          onPrevious={handlePrevious}
          onNext={handleNext}
          hasPrevious={currentIndex > 0}
          hasNext={currentIndex < museAssets.length - 1}
        />
      </Box>
    );
  },
};

/**
 * 다양한 에셋 타입 표시
 */
export const ImageDetailModalAssetTypes = {
  render: () => {
    const [openAsset, setOpenAsset] = useState(null);

    const assets = [
      {
        id: 'img-1',
        title: 'Product Photography',
        type: 'image',
        format: 'JPEG',
        resolution: '4000x3000',
        size: '8.5 MB',
        thumbnail: 'https://images.pexels.com/photos/3945659/pexels-photo-3945659.jpeg?auto=compress&cs=tinysrgb&w=600',
        tags: ['Product', 'Minimal', 'White'],
        license: 'Commercial',
        status: 'approved',
      },
      {
        id: 'vid-1',
        title: 'Motion Graphics Loop',
        type: 'video',
        format: 'MP4',
        resolution: '1920x1080',
        duration: '00:15',
        size: '45 MB',
        thumbnail: 'https://images.pexels.com/photos/2387873/pexels-photo-2387873.jpeg?auto=compress&cs=tinysrgb&w=600',
        tags: ['Motion', 'Abstract', 'Loop'],
        license: 'Commercial',
        status: 'approved',
      },
      {
        id: 'img-2',
        title: 'Pending Review Asset',
        type: 'image',
        format: 'PNG',
        resolution: '2400x1600',
        size: '12 MB',
        thumbnail: 'https://images.pexels.com/photos/3131971/pexels-photo-3131971.jpeg?auto=compress&cs=tinysrgb&w=600',
        tags: ['Neon', 'City', 'Night'],
        license: 'Internal Only',
        status: 'pending',
      },
    ];

    return (
      <Box>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Different asset types: Image, Video, Pending status
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          {assets.map((asset) => (
            <Button
              key={asset.id}
              variant="outlined"
              onClick={() => setOpenAsset(asset)}
              sx={{ textTransform: 'none' }}
            >
              {asset.type.toUpperCase()}: {asset.title.substring(0, 15)}...
            </Button>
          ))}
        </Box>
        <ImageDetailModal
          isOpen={!!openAsset}
          onClose={() => setOpenAsset(null)}
          asset={openAsset}
          onLike={() => console.log('Like')}
          onAddToBoard={() => console.log('Add to board')}
        />
      </Box>
    );
  },
};
