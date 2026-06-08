import React, { useEffect } from 'react';
import { getClient } from './client';
import type { ReplayConfig } from './types';

export interface ReplayProviderProps {
  config: ReplayConfig;
  children: React.ReactNode;
}

/**
 * Optional convenience wrapper: boots the client once on mount. Recording
 * intentionally outlives unmount (a provider remount must not tear down
 * the session), so there's no cleanup here — call `Replay.stop()`
 * explicitly if you need to.
 */
export function ReplayProvider({ config, children }: ReplayProviderProps) {
  useEffect(() => {
    getClient().start(config);
    // Start-once semantics: deliberately not keyed on `config`.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return <>{children}</>;
}
