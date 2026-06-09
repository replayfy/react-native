import type { NetworkRecord, ReplayConfig } from './types';
import { ReplayMaskStyle } from './types';
import { getNative, nativeAvailable } from './native';
import {
  installNetworkCapture,
  type NetworkCaptureHandle,
} from './capture/network';
import {
  installConsoleCapture,
  type ConsoleCaptureHandle,
} from './capture/console';
import {
  installErrorCapture,
  type ErrorCaptureHandle,
} from './capture/errors';

/**
 * The Replayfy React Native client. A thin façade over the native
 * recording engine plus the JS-only capture the native side can't see
 * (network / console / errors). One singleton per app — reach it via
 * the default export or {@link getClient}.
 */
export class ReplayClient {
  private started = false;
  private network: NetworkCaptureHandle | null = null;
  private consoleTap: ConsoleCaptureHandle | null = null;
  private errors: ErrorCaptureHandle | null = null;

  /** Boot the engine and start recording. Idempotent. */
  start(config: ReplayConfig): void {
    if (this.started) return;
    const native = getNative();
    if (!native) {
      console.warn(
        '[replayfy] native module not found — rebuild the app after installing react-native-replayfy'
      );
      return;
    }
    this.started = true;

    native.boot(
      config.projectKey,
      config.ingestUrl,
      JSON.stringify({
        recordScreen: config.recordScreen ?? true,
        recordPerformance: config.recordPerformance ?? true,
        maskAllInputs: config.maskAllInputs ?? false,
        fps: config.fps ?? 1,
        wifiOnly: config.wifiOnly ?? false,
        debug: config.debug ?? false,
      })
    );
    if (config.distinctId) native.identify(config.distinctId);

    if (config.recordNetwork ?? true) {
      this.network = installNetworkCapture(
        globalThis,
        config.network ?? {},
        (record: NetworkRecord) =>
          getNative()?.recordNetwork(JSON.stringify(record))
      );
    }
    if (config.recordConsole ?? true) {
      this.consoleTap = installConsoleCapture((level, message) =>
        getNative()?.track('$console', JSON.stringify({ level, message }))
      );
    }
    if (config.recordErrors ?? true) {
      this.errors = installErrorCapture((message, stack, fatal) =>
        getNative()?.track('$exception', JSON.stringify({ message, stack, fatal }))
      );
    }
  }

  /** Attach a known-user identity (+ optional traits as metadata). */
  identify(distinctId: string, traits?: Record<string, unknown>): void {
    const native = getNative();
    if (!native) return;
    native.identify(distinctId);
    if (traits) {
      for (const [key, value] of Object.entries(traits)) {
        native.setMetadata(key, String(value));
      }
    }
  }

  /** Attach one sticky metadata key/value. */
  setMetadata(key: string, value: string): void {
    getNative()?.setMetadata(key, value);
  }

  /** Fire a custom timeline / funnel event. */
  track(name: string, props?: Record<string, unknown>): void {
    getNative()?.track(name, props ? JSON.stringify(props) : null);
  }

  /** Set the current screen name (also driven by the nav integration). */
  screen(name: string): void {
    getNative()?.screen(name);
  }

  /**
   * Set the global mask render style — {@link ReplayMaskStyle.Blur} (default)
   * or {@link ReplayMaskStyle.Overlay} (a solid box). Applies to every
   * `<ReplayMask>`, bulk-occluded text, and whole-screen occlusion. Call any
   * time after {@link start}.
   */
  setMaskStyle(style: ReplayMaskStyle): void {
    getNative()?.setMaskStyle(style);
  }

  /** Resolve the active session id, or null when not recording. */
  getSessionId(): Promise<string | null> {
    const native = getNative();
    return native ? native.sessionId().then((s) => s || null) : Promise.resolve(null);
  }

  /** Stop recording, flush, and detach the JS observers. */
  stop(): void {
    this.network?.uninstall();
    this.consoleTap?.uninstall();
    this.errors?.uninstall();
    this.network = null;
    this.consoleTap = null;
    this.errors = null;
    getNative()?.shutdown();
    this.started = false;
  }

  /** Whether the native module is linked. */
  get isAvailable(): boolean {
    return nativeAvailable();
  }
}

let singleton: ReplayClient | null = null;

/** The process-wide client singleton. */
export function getClient(): ReplayClient {
  if (!singleton) singleton = new ReplayClient();
  return singleton;
}
