import { getClient, ReplayClient } from './client';

/**
 * Replayfy for React Native.
 *
 * ```tsx
 * import Replay, { ReplayProvider, ReplayMask } from 'react-native-replayfy';
 *
 * Replay.start({ projectKey: 'rpl_pk_xxx', ingestUrl: 'https://ingest.replayfy.io' });
 * Replay.identify('user_123', { plan: 'pro' });
 * Replay.track('purchase', { amount: 4200 });
 *
 * // mask anything sensitive:
 * <ReplayMask><CardNumber /></ReplayMask>
 * ```
 */
const Replay = getClient();

export default Replay;
export { Replay, ReplayClient, getClient };
export { ReplayProvider } from './provider';
export type { ReplayProviderProps } from './provider';
export { ReplayMask } from './privacy/mask';
export { trackScreens } from './nav/navigation';
export { nativeAvailable } from './native';
export type {
  ReplayConfig,
  NetworkCaptureOptions,
  NetworkRecord,
} from './types';
