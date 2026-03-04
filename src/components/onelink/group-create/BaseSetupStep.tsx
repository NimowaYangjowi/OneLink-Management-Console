/**
 * Step 1 form for basic group metadata.
 */
import { MenuItem, Stack, TextField, Typography } from '@mui/material';

type BaseSetupStepProps = {
  brandDomain: string;
  groupNameError: boolean;
  groupNameHelperText?: string;
  groupName: string;
  onBrandDomainChange: (value: string) => void;
  onGroupNameChange: (value: string) => void;
  onTemplateIdChange: (value: string) => void;
  templateId: string;
  templateOptions: string[];
};

function BaseSetupStep({
  brandDomain,
  groupNameError,
  groupNameHelperText,
  groupName,
  onBrandDomainChange,
  onGroupNameChange,
  onTemplateIdChange,
  templateId,
  templateOptions,
}: BaseSetupStepProps) {
  const groupNameFieldId = 'link-group-name';
  const templateIdFieldId = 'template-id';
  const brandDomainFieldId = 'brand-domain';

  return (
    <Stack spacing={ 1.5 }>
      <Stack spacing={ 0.5 }>
        <Typography sx={ { color: 'text.primary', fontSize: 18, fontWeight: 700 } }>
          Base Setup
        </Typography>
        <Typography sx={ { color: 'text.secondary', fontSize: 12 } }>
          Set the group identity and target template before building the tree.
        </Typography>
      </Stack>
      <TextField
        error={ groupNameError }
        fullWidth
        helperText={ groupNameHelperText }
        id={ groupNameFieldId }
        label='Link Group Name'
        onChange={ (event) => onGroupNameChange(event.target.value) }
        size='small'
        value={ groupName }
      />
      <TextField
        fullWidth
        id={ templateIdFieldId }
        label='Template ID'
        onChange={ (event) => onTemplateIdChange(event.target.value) }
        select={ templateOptions.length > 0 }
        size='small'
        value={ templateId }
      >
        {templateOptions.map((option) => (
          <MenuItem key={ option } value={ option }>{option}</MenuItem>
        ))}
      </TextField>
      <TextField
        fullWidth
        helperText='Optional'
        id={ brandDomainFieldId }
        label='Brand Domain'
        onChange={ (event) => onBrandDomainChange(event.target.value) }
        size='small'
        value={ brandDomain }
      />
    </Stack>
  );
}

export default BaseSetupStep;
