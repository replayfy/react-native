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

  /**
   * Record a text input's value on the session timeline. Call from a
   * `TextInput`'s `onEndEditing` (RN manages its own text widgets, so there's
   * no native field for the engine to auto-observe). Pass `masked: true` for
   * sensitive fields — the value is dropped (recorded as `"***"`) and never
   * leaves the device; the field is also blurred in playback.
   */
  trackInput(label: string, value: string, masked = false): void {
    getNative()?.input(value, masked, label);
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

  // ── Lifecycle ──────────────────────────────────────────────────
  /** Start a fresh session, ending the current one. */
  startNewSession(): void { getNative()?.startNewSession(); }
  /** Pause recording (keeps the session). */
  pauseRecording(): void { getNative()?.pauseRecording(); }
  /** Resume after {@link pauseRecording}. */
  resumeRecording(): void { getNative()?.resumeRecording(); }
  /** Discard the current session without uploading. */
  cancelSession(): void { getNative()?.cancelSession(); }
  /** Flush the current session immediately (e.g. before a logout). */
  stopApplicationAndUploadData(): void { getNative()?.stopApplicationAndUploadData(); }
  /** Whether a session is currently recording. */
  isRecording(): Promise<boolean> {
    return getNative()?.isRecording() ?? Promise.resolve(false);
  }

  // ── Identity / events ──────────────────────────────────────────
  /** Set a sticky user-level property. */
  setUserProperty(key: string, value: string): void { getNative()?.setUserProperty(key, value); }
  /** Set a session-scoped property. */
  setSessionProperty(key: string, value: string): void { getNative()?.setSessionProperty(key, value); }
  /** Tag the session with a named event + properties. */
  addTagWithProperties(name: string, props?: Record<string, unknown>): void {
    getNative()?.addTagWithProperties(name, props ? JSON.stringify(props) : null);
  }
  /** Report a manual bug event. */
  reportBugEvent(name: string, description = ''): void {
    getNative()?.reportBugEvent(name, description);
  }

  // ── Screens ────────────────────────────────────────────────────
  /** Toggle automatic screen-name tagging. */
  setAutomaticScreenNameTagging(enabled: boolean): void {
    getNative()?.setAutomaticScreenNameTagging(enabled);
  }

  // ── Privacy ────────────────────────────────────────────────────
  /** Occlude all text fields in screenshots. */
  occludeAllTextFields(occlude: boolean): void { getNative()?.occludeAllTextFields(occlude); }
  /** Occlude all multi-line text views in screenshots. */
  occludeAllTextView(occlude: boolean): void { getNative()?.occludeAllTextView(occlude); }
  /** Occlude the entire screen (e.g. a sensitive flow). */
  occludeSensitiveScreen(occlude: boolean): void { getNative()?.occludeSensitiveScreen(occlude); }

  // ── GDPR ───────────────────────────────────────────────────────
  /** Opt the user out of all recording. */
  optOut(optedOut: boolean): void { getNative()?.optOut(optedOut); }
  /** Whether the user is opted out. */
  isOptedOut(): Promise<boolean> {
    return getNative()?.isOptedOut() ?? Promise.resolve(false);
  }

  // ── Session extras ─────────────────────────────────────────────
  /** Flag the current session as a favorite. */
  markSessionAsFavorite(): void { getNative()?.markSessionAsFavorite(); }
  /** Associate a push token with the session/user. */
  setPushNotificationToken(token: string): void { getNative()?.setPushNotificationToken(token); }
  /** Set the host app version + build (keys crash symbol lookups). */
  setAppVersion(version: string, build = ''): void { getNative()?.setAppVersion(version, build); }
  /** Record multiple sessions per app launch instead of one. */
  setMultiSessionRecord(enabled: boolean): void { getNative()?.setMultiSessionRecord(enabled); }
  /** Allow a brief switch to another app without ending the session. */
  allowShortBreakForAnotherApp(allow: boolean): void { getNative()?.allowShortBreakForAnotherApp(allow); }
  /** Bridge a customer log line into the `$console` event stream (same path
   *  the JS console capture uses — no separate native call needed). */
  log(message: string, level = 'log'): void {
    getNative()?.track('$console', JSON.stringify({ level, message }));
  }

  // ── Deep links ─────────────────────────────────────────────────
  /** Shareable URL of the current session (empty when none). */
  urlForCurrentSession(): Promise<string> {
    return getNative()?.urlForCurrentSession() ?? Promise.resolve('');
  }
  /** Dashboard URL for the current user (empty when none). */
  urlForCurrentUser(): Promise<string> {
    return getNative()?.urlForCurrentUser() ?? Promise.resolve('');
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
