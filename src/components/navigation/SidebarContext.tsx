/**
 * Sidebar context for managing collapsed/expanded state.
 * Provides SidebarProvider wrapper and useSidebar() hook.
 * Responsive initial state: expanded on desktop (>=900px), collapsed on mobile (<900px).
 * After mount, user toggle state persists regardless of resize.
 */
'use client';

import {
  createContext,
  useContext,
  useState,
  useSyncExternalStore,
  useCallback,
  type ReactNode,
} from 'react';

interface SidebarContextValue {
  isCollapsed: boolean;
  toggle: () => void;
}

const SidebarContext = createContext<SidebarContextValue | null>(null);

/**
 * Reads the initial mobile breakpoint from window.matchMedia.
 * Uses useSyncExternalStore for SSR-safe access to browser APIs.
 */
const MOBILE_QUERY = '(max-width: 899px)';

function subscribeToMediaQuery(callback: () => void) {
  const mql = window.matchMedia(MOBILE_QUERY);
  mql.addEventListener('change', callback);
  return () => mql.removeEventListener('change', callback);
}

function getIsMobileSnapshot() {
  return window.matchMedia(MOBILE_QUERY).matches;
}

function getIsMobileServerSnapshot() {
  return false;
}

/**
 * SidebarProvider
 *
 * Props:
 * @param {ReactNode} children - Child components that can consume sidebar state [Required]
 *
 * Example usage:
 * <SidebarProvider>
 *   <DashboardSidebar />
 *   <main>{content}</main>
 * </SidebarProvider>
 */
function SidebarProvider({ children }: { children: ReactNode }) {
  const isMobile = useSyncExternalStore(
    subscribeToMediaQuery,
    getIsMobileSnapshot,
    getIsMobileServerSnapshot,
  );

  const [hasUserToggled, setHasUserToggled] = useState(false);
  const [userCollapsed, setUserCollapsed] = useState(false);

  const isCollapsed = hasUserToggled ? userCollapsed : isMobile;

  const toggle = useCallback(() => {
    setHasUserToggled(true);
    setUserCollapsed((prev) => !prev);
  }, []);

  return (
    <SidebarContext.Provider value={ { isCollapsed, toggle } }>
      { children }
    </SidebarContext.Provider>
  );
}

/**
 * useSidebar
 *
 * Custom hook to consume sidebar collapsed/expanded state.
 * Must be used within a SidebarProvider.
 *
 * @returns {{ isCollapsed: boolean, toggle: () => void }}
 *
 * Example usage:
 * const { isCollapsed, toggle } = useSidebar();
 */
function useSidebar(): SidebarContextValue {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error('useSidebar must be used within a SidebarProvider');
  }
  return context;
}

export { SidebarProvider, useSidebar };
