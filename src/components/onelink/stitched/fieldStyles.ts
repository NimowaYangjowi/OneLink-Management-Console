/**
 * MUI sx style objects for form fields used across OneLinkStitchedPage sub-components.
 */

export const filledFieldSx = {
  '& .MuiOutlinedInput-root': {
    '& .MuiOutlinedInput-input': {
      fontSize: 14,
      py: 2,
    },
    '& fieldset': {
      borderColor: 'divider',
    },
    '&:hover fieldset': {
      borderColor: 'divider',
    },
    '&.Mui-focused fieldset': {
      borderColor: 'primary.main',
      borderWidth: 1,
    },
    '&.Mui-error fieldset': {
      borderColor: 'error.main',
    },
    '&.Mui-error:hover fieldset': {
      borderColor: 'error.main',
    },
    '&.Mui-error.Mui-focused fieldset': {
      borderColor: 'error.main',
      borderWidth: 1,
    },
    backgroundColor: 'background.default',
    borderRadius: 0.5,
  },
};

export const plainFieldSx = {
  ...filledFieldSx,
  '& .MuiOutlinedInput-root': {
    ...filledFieldSx['& .MuiOutlinedInput-root'],
    backgroundColor: 'background.paper',
  },
};
