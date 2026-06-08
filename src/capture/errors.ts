type Emit = (message: string, stack: string | null, fatal: boolean) => void;

export interface ErrorCaptureHandle {
  uninstall: () => void;
}

type GlobalHandler = (error: unknown, isFatal?: boolean) => void;

interface ErrorUtilsLike {
  getGlobalHandler?: () => GlobalHandler;
  setGlobalHandler?: (handler: GlobalHandler) => void;
}

/** Chain onto RN's global error handler so unhandled JS errors reach
 *  the engine as `$exception` events. Always re-delegates to the prior
 *  handler (so red-box / Crashlytics still fire). */
export function installErrorCapture(emit: Emit): ErrorCaptureHandle {
  const errorUtils = (globalThis as unknown as { ErrorUtils?: ErrorUtilsLike })
    .ErrorUtils;
  const previous = errorUtils?.getGlobalHandler?.();

  const handler: GlobalHandler = (error, isFatal) => {
    try {
      const err = error as Error | undefined;
      emit(err?.message ?? String(error), err?.stack ?? null, !!isFatal);
    } catch {
      // best-effort
    }
    previous?.(error, isFatal);
  };

  errorUtils?.setGlobalHandler?.(handler);

  return {
    uninstall() {
      if (previous) errorUtils?.setGlobalHandler?.(previous);
    },
  };
}
