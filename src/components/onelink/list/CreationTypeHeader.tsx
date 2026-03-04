/**
 * Shared header row for OneLink list pages with creation-type tabs and primary create action.
 */
'use client';

import { Button, Stack, Tab, Tabs } from '@mui/material';
import Link from 'next/link';
import type { SyntheticEvent } from 'react';
import type { OneLinkTabType } from '@/components/onelink/list/types';

type CreationTypeHeaderProps = {
  activeTab: OneLinkTabType;
  onTabChange: (event: SyntheticEvent, value: OneLinkTabType) => void;
};

function CreationTypeHeader({ activeTab, onTabChange }: CreationTypeHeaderProps) {
  return (
    <Stack
      alignItems='center'
      direction={ { md: 'row', xs: 'column' } }
      justifyContent='space-between'
      spacing={ 1 }
    >
      <Tabs
        aria-label='OneLink type tabs'
        onChange={ onTabChange }
        sx={ {
          borderBottom: '1px solid',
          borderColor: 'divider',
          minHeight: 44,
          width: { md: 'auto', xs: '100%' },
          '& .MuiTab-root': {
            fontSize: 13,
            fontWeight: 600,
            minHeight: 44,
            px: 1.5,
            textTransform: 'none',
          },
        } }
        value={ activeTab }
      >
        <Tab label='Single Link' value='single_link' />
        <Tab label='Link Group' value='link_group' />
      </Tabs>
      <Button component={ Link } href='/create' variant='contained'>
        Create OneLink
      </Button>
    </Stack>
  );
}

export default CreationTypeHeader;
