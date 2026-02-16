import { useState } from 'react';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Gridr';
import { SearchBar } from '../input/SearchBar';
import { ImageCard } from '../card/ImageCard';
import { CategoryTab } from '../navigation/CategoryTab';
import { museAssets } from '../../data/museMockData';

const categories = [
  { id: 'all', label: 'All Assets' },
  { id: 'video', label: 'Videos' },
  { id: 'image', label: 'Images' },
  { id: '3d', label: '3D Models' },
];

/**
 * MediaGridGallery 템플릿
 *
 * 미디어 에셋을 검색, 필터링하고 그리드 형태로 보여주는 갤러리.
 */
export function MediaGridGallery() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // 필터링 로직
  const filteredAssets = museAssets.filter((asset) => {
    const matchesCategory = selectedCategory === 'all' || asset.type === selectedCategory;
    const matchesSearch = asset.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          asset.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <CategoryTab
          categories={categories}
          selected={selectedCategory}
          onChange={setSelectedCategory}
          sx={{ mb: 0, borderBottom: 0 }}
        />
        <Box sx={{ width: 300 }}>
          <SearchBar
            placeholder="Search assets..."
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </Box>
      </Box>

      <Grid container spacing={3}>
        {filteredAssets.map((asset) => (
          <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={asset.id}>
            <ImageCard
              src={asset.thumbnail}
              title={asset.title}
              tags={asset.tags}
              onLike={() => console.log('Liked', asset.title)}
              onAddToBoard={() => console.log('Added to board', asset.title)}
            />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
