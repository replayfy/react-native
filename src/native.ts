import { NativeModules, TurboModuleRegistry } from 'react-native';
import type { TurboModule } from 'react-native';

/**
 * The native bridge surface. Each method forwards to a public method of
 * the native Replay SDK, which drives the real recording engine. The
 * shape is intentionally narrow and our own (single-JSON payloads, a
 * boot/shutdown lifecycle) rather than a 1:1 mirror of any reference.
 */
export interface ReplayNativeModule {
  /** Start the native engine. `configJson` carries the native-relevant knobs. */
  boot(projectKey: string, ingestUrl: string, configJson: string): void;
  /** Stop the engine + flush. */
  shutdown(): void;
  /** Resolve the active session id (empty string when none). */
  sessionId(): Promise<string>;
  /** Attach a known-user identity. */
  identify(distinctId: string): void;
  /** Attach one sticky metadata key/value. */
  setMetadata(key: string, value: string): void;
  /** Custom event; `propsJson` is a JSON string or null. */
  track(name: string, propsJson: string | null): void;
  /** Set the current screen name. */
  screen(name: string): void;
  /** Forward one captured network call as a JSON `NetworkRecord`. */
  recordNetwork(recordJson: string): void;
  /** Mask the native view backing a React node tag. */
  maskNode(reactTag: number): void;
  /** Remove a previously-applied node mask. */
  unmaskNode(reactTag: number): void;
}

const MODULE_NAME = 'ReplayNative';

let resolved: ReplayNativeModule | null | undefined;

/** Resolve the native module once (TurboModule first, legacy fallback). */
export function getNative(): ReplayNativeModule | null {
  if (resolved !== undefined) return resolved;
  const turbo = TurboModuleRegistry.get<TurboModule>(MODULE_NAME) as
    | ReplayNativeModule
    | null;
  const legacy = (
    NativeModules as Record<string, ReplayNativeModule | undefined>
  )[MODULE_NAME];
  resolved = turbo ?? legacy ?? null;
  return resolved;
}

export function nativeAvailable(): boolean {
  return getNative() != null;
}
