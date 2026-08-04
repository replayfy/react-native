/**
 * How a masked (privacy-sensitive) region is rendered in the recording.
 * Mirrors the native engines' `ReplayMaskStyle` — the index must match
 * (blur = 0, overlay = 1, pixelate = 2).
 *
 *  - `Blur`     — the underlying pixels are blurred.
 *  - `Overlay`  — a solid box is painted over the region (no pixel survives).
 *  - `Pixelate` — the region is reduced to coarse mosaic blocks.
 */
export enum ReplayMaskStyle {
  Blur = 0,
  Overlay = 1,
  Pixelate = 2,
}

/** Options for the JS-side network observer. */
export interface NetworkCaptureOptions {
  /** Capture request/response bodies (off by default — PII risk). */
  captureBodies?: boolean;
  /** Truncate captured bodies beyond this many chars. Default 4096. */
  maxBodyBytes?: number;
  /** Header names to drop, `true` to drop all, `false` to keep all.
   *  Defaults to a sensitive-header denylist. */
  redactHeaders?: string[] | boolean;
  /** URLs to skip entirely (substring match for strings, `.test` for RegExp). */
  ignoreUrls?: Array<string | RegExp>;
}

/** Top-level config passed to `Replay.start(config)`. */
export interface ReplayConfig {
  /** Project API key from the dashboard (publishable, e.g. `rpl_pk_…`). */
  apiKey: string;
  /** Ingest base URL, e.g. `https://us.replayfy.app`. */
  apiHost: string;
  /** Known user id at start (else an install-stable anonymous id). */
  distinctId?: string;

  /** Capture screenshots/frames (native). Default true. */
  recordScreen?: boolean;
  /** Capture JS network traffic (fetch + XHR). Default true. */
  recordNetwork?: boolean;
  /** Capture `console.*` output. Default true. */
  recordConsole?: boolean;
  /** Capture unhandled JS errors. Default true. */
  recordErrors?: boolean;
  /** Capture native performance vitals. Default true. */
  recordPerformance?: boolean;

  /** Auto-mask all text inputs (native). Default false. */
  maskAllInputs?: boolean;
  /** Snapshot frames per second (native). Default 1. */
  fps?: number;
  /** Only upload over wifi (native). Default false. */
  wifiOnly?: boolean;
  /** Verbose SDK logging. Default false. */
  debug?: boolean;

  /** Network-observer tuning. */
  network?: NetworkCaptureOptions;
}

/** One captured network call, assembled JS-side then handed to native. */
export interface NetworkRecord {
  url: string;
  method: string;
  status: number;
  startedAt: number;
  durationMs: number;
  request: { headers: Record<string, string>; body?: string | null };
  response: { headers: Record<string, string>; body?: string | null };
  error?: string;
}
