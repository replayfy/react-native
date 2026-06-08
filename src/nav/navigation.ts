import { getClient } from '../client';

/** Minimal duck-typed shape of a React Navigation container ref — kept
 *  dependency-free so the SDK never pins a navigation version. */
interface NavigationRefLike {
  getCurrentRoute?: () => { name?: string } | undefined;
}

let lastScreen: string | null = null;

/**
 * Report the current route as a screen. Wire to a React Navigation
 * container's `onReady` + `onStateChange`:
 *
 * ```tsx
 * const navRef = useNavigationContainerRef();
 * <NavigationContainer
 *   ref={navRef}
 *   onReady={() => trackScreens(navRef)}
 *   onStateChange={() => trackScreens(navRef)}
 * />
 * ```
 *
 * De-duplicates consecutive identical screen names.
 */
export function trackScreens(navigationRef: NavigationRefLike): void {
  const name = navigationRef.getCurrentRoute?.()?.name;
  if (name && name !== lastScreen) {
    lastScreen = name;
    getClient().screen(name);
  }
}
