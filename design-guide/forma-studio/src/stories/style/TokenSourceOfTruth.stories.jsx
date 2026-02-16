import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';

export default {
  title: 'Style/Token Source Of Truth',
  parameters: {
    layout: 'padded',
  },
};

export const Docs = {
  render: () => (
    <Box sx={ { maxWidth: 900 } }>
      <Typography variant="h4" sx={ { mb: 1 } }>
        Design Token Source Of Truth
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={ { mb: 3 } }>
        This design guide is a reference. Token authority is defined in the root project files.
      </Typography>

      <Typography variant="h6" sx={ { mb: 1 } }>
        Canonical sources
      </Typography>
      <List sx={ { mb: 3 } }>
        <ListItem>
          <ListItemText primary="design/design-system.pen" />
        </ListItem>
        <ListItem>
          <ListItemText primary="design/tokens/design-tokens.generated.json" />
        </ListItem>
        <ListItem>
          <ListItemText primary="design/tokens/design-tokens.generated.md" />
        </ListItem>
      </List>

      <Typography variant="h6" sx={ { mb: 1 } }>
        Sync command
      </Typography>
      <Box
        component="pre"
        sx={ {
          p: 2,
          bgcolor: 'grey.100',
          border: '1px solid',
          borderColor: 'divider',
          overflow: 'auto',
        } }
      >
{`pnpm tokens:sync`}
      </Box>

      <Typography variant="body2" color="text.secondary" sx={ { mt: 3 } }>
        If this Storybook content differs from generated token outputs, generated outputs win.
      </Typography>
    </Box>
  ),
};
