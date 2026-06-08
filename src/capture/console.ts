type Emit = (level: string, message: string) => void;

const LEVELS = ['log', 'info', 'warn', 'error', 'debug'] as const;

export interface ConsoleCaptureHandle {
  uninstall: () => void;
}

function fmt(v: unknown): string {
  if (typeof v === 'string') return v;
  if (v instanceof Error) return v.stack ?? v.message;
  try {
    return JSON.stringify(v);
  } catch {
    return String(v);
  }
}

/** Patch `console.*` to mirror each line into the engine, while still
 *  delegating to the original. Returns a handle to restore originals. */
export function installConsoleCapture(emit: Emit): ConsoleCaptureHandle {
  const c = console as unknown as Record<string, (...a: unknown[]) => void>;
  const originals: Record<string, (...a: unknown[]) => void> = {};

  for (const level of LEVELS) {
    const orig = c[level];
    if (typeof orig !== 'function') continue;
    originals[level] = orig;
    c[level] = (...args: unknown[]) => {
      try {
        emit(level, args.map(fmt).join(' '));
      } catch {
        // never let capture break logging
      }
      orig(...args);
    };
  }

  return {
    uninstall() {
      for (const level of Object.keys(originals)) c[level] = originals[level];
    },
  };
}
