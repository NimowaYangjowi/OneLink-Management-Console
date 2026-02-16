'use client';

/**
 * SectionAccordion - Collapsible section wrapper for form groups.
 * Used to organize form fields into expandable sections in the OneLink editor.
 *
 * Props:
 * @param {string} title - Section title text [Required]
 * @param {string} subtitle - Section description [Optional]
 * @param {boolean} defaultExpanded - Initial expanded state [Optional, default: false]
 * @param {ReactNode} children - Section content [Required]
 * @param {boolean} hasRequiredFields - Show red dot indicator next to title [Optional]
 *
 * Example usage:
 * <SectionAccordion title="Basic Info" subtitle="Required link settings" hasRequiredFields>
 *   <FormTextField label="Name" value={name} onChange={setName} />
 * </SectionAccordion>
 */

import { type ReactNode } from 'react';
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  Box,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import { ChevronDown } from 'lucide-react';

interface SectionAccordionProps {
  title: string;
  subtitle?: string;
  defaultExpanded?: boolean;
  children: ReactNode;
  hasRequiredFields?: boolean;
}

function SectionAccordion({
  title,
  subtitle,
  defaultExpanded = false,
  children,
  hasRequiredFields,
}: SectionAccordionProps) {
  return (
    <Accordion
      defaultExpanded={defaultExpanded}
      disableGutters
      sx={{
        border: 0,
        borderRadius: 0,
        boxShadow: 'none',
        backgroundColor: 'transparent',
        borderBottom: '1px solid',
        borderColor: (theme) => alpha(theme.palette.divider, 0.45),
        '&:first-of-type': {
          borderTop: '1px solid',
          borderTopColor: (theme) => alpha(theme.palette.divider, 0.45),
        },
        '&:before': {
          display: 'none',
        },
        '&.Mui-expanded': {
          margin: 0,
        },
      }}
    >
      <AccordionSummary
        expandIcon={<ChevronDown size={18} />}
        sx={{
          px: 0,
          minHeight: 52,
          '& .MuiAccordionSummary-expandIconWrapper': {
            color: 'text.secondary',
          },
          '& .MuiAccordionSummary-content': {
            my: 1.5,
          },
          '& .MuiAccordionSummary-content.Mui-expanded': {
            my: 1.5,
          },
          '&.Mui-expanded': {
            minHeight: 52,
          },
        }}
      >
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="subtitle1" color="text.primary">
              {title}
            </Typography>
            {hasRequiredFields && (
              <Box
                sx={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  bgcolor: 'error.main',
                  flexShrink: 0,
                }}
              />
            )}
          </Box>
          {subtitle && (
            <Typography variant="body2" color="text.secondary">
              {subtitle}
            </Typography>
          )}
        </Box>
      </AccordionSummary>
      <AccordionDetails sx={{ px: 0, pt: 0.5, pb: 3 }}>
        {children}
      </AccordionDetails>
    </Accordion>
  );
}

export default SectionAccordion;
