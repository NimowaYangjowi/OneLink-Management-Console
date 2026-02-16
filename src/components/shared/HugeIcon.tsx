/**
 * Unified icon renderer that prioritizes HugeIcons and falls back to Lucide icons when needed.
 */
import { HugeiconsIcon, type IconSvgElement } from '@hugeicons/react';
import type { LucideIcon } from 'lucide-react';

type HugeIconProps = {
  color?: string;
  fallback?: LucideIcon;
  icon?: IconSvgElement;
  size?: number;
  strokeWidth?: number;
};

function HugeIcon({
  color = 'currentColor',
  fallback: Fallback,
  icon,
  size = 20,
  strokeWidth = 1.8,
}: HugeIconProps) {
  if (icon) {
    return (
      <HugeiconsIcon
        color={ color }
        icon={ icon }
        size={ size }
        strokeWidth={ strokeWidth }
      />
    );
  }

  if (!Fallback) {
    return null;
  }

  return <Fallback color={ color } size={ size } strokeWidth={ strokeWidth } />;
}

export default HugeIcon;
