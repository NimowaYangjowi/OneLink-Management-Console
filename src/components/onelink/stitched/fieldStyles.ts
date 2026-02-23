/**
 * MUI sx style objects for form fields used across OneLinkStitchedPage sub-components.
 */

export const filledFieldSx = {
  '& .MuiOutlinedInput-root': {
    backgroundColor: 'background.default',
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
  },
};

export const plainFieldSx = {
  ...filledFieldSx,
  '& .MuiOutlinedInput-root': {
    ...filledFieldSx['& .MuiOutlinedInput-root'],
    backgroundColor: 'background.paper',
  },
};
