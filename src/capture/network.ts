import type { NetworkCaptureOptions, NetworkRecord } from '../types';

const DEFAULT_REDACT = ['cookie', 'set-cookie', 'authorization', 'x-api-key'];

type Emit = (record: NetworkRecord) => void;

export interface NetworkCaptureHandle {
  uninstall: () => void;
}

/**
 * Install a unified network observer over `fetch` + `XMLHttpRequest`.
 * Each call is modelled as a single {@link NetworkRecord} accumulated
 * across its lifecycle, sanitized, then emitted once. RN traffic is
 * JS-side, so this is the only layer that can see it. Returns a handle
 * to restore the originals.
 */
export function installNetworkCapture(
  ctx: typeof globalThis,
  opts: NetworkCaptureOptions,
  emit: Emit
): NetworkCaptureHandle {
  const redact = opts.redactHeaders ?? DEFAULT_REDACT;
  // Capture request/response bodies by default — the Network tab's Payload +
  // Response panels are empty without them. Sensitive headers are still
  // redacted via `redact`; callers can opt out with `captureBodies: false`.
  const captureBodies = opts.captureBodies ?? true;
  const maxBody = opts.maxBodyBytes ?? 4096;
  const ignore = opts.ignoreUrls ?? [];

  // Recording must never break the host's request. The emit callback hops to
  // the native bridge, so guard it the same way console/error capture do — a
  // throw here (e.g. native unreachable) must not reject the caller's
  // fetch().then / XHR handler.
  const safeEmit: Emit = (record) => {
    try {
      emit(record);
    } catch {
      // swallow — a dropped network record is never worth a host-app failure
    }
  };

  const isIgnored = (url: string): boolean =>
    ignore.some((m) => (typeof m === 'string' ? url.includes(m) : m.test(url)));

  const keepHeader = (name: string): boolean => {
    if (redact === true) return false;
    if (redact === false) return true;
    const lower = name.toLowerCase();
    return !redact.some((h) => h.toLowerCase() === lower);
  };

  const clip = (s: string | null): string | null =>
    s != null && s.length > maxBody ? `${s.slice(0, maxBody)}…[clipped]` : s;

  const toBody = (b: unknown): string | null => {
    if (b == null) return null;
    if (typeof b === 'string') return b;
    try {
      return JSON.stringify(b);
    } catch {
      return String(b);
    }
  };

  const fromInit = (h: HeadersInit | undefined): Record<string, string> => {
    const out: Record<string, string> = {};
    if (!h) return out;
    const put = (k: string, v: string) => {
      if (keepHeader(k)) out[k] = v;
    };
    if (typeof Headers !== 'undefined' && h instanceof Headers) {
      h.forEach((v: string, k: string) => put(k, v));
    } else if (Array.isArray(h)) {
      h.forEach(([k, v]) => put(k, v));
    } else {
      Object.entries(h as Record<string, string>).forEach(([k, v]) => put(k, v));
    }
    return out;
  };

  const fromResponse = (h: Headers): Record<string, string> => {
    const out: Record<string, string> = {};
    h.forEach((v: string, k: string) => {
      if (keepHeader(k)) out[k] = v;
    });
    return out;
  };

  const fromRaw = (raw: string): Record<string, string> => {
    const out: Record<string, string> = {};
    raw
      .trim()
      .split(/[\r\n]+/)
      .forEach((line) => {
        const i = line.indexOf(':');
        if (i > 0) {
          const k = line.slice(0, i).trim();
          if (keepHeader(k)) out[k] = line.slice(i + 1).trim();
        }
      });
    return out;
  };

  const origFetch = ctx.fetch;
  const OrigXHR = ctx.XMLHttpRequest;

  if (origFetch) {
    const wrapped: typeof fetch = (input, init) => {
      const asRequest =
        typeof input !== 'string' && !(input instanceof URL)
          ? (input as Request)
          : null;
      const url =
        typeof input === 'string'
          ? input
          : input instanceof URL
            ? input.href
            : asRequest!.url;

      if (isIgnored(url)) return origFetch(input as RequestInfo, init);

      const method = (init?.method ?? asRequest?.method ?? 'GET').toUpperCase();
      const startedAt = Date.now();
      const reqHeaders = fromInit(init?.headers);
      const reqBody = captureBodies ? clip(toBody(init?.body)) : null;

      const done = (
        status: number,
        resHeaders: Record<string, string>,
        resBody: string | null,
        error?: string
      ) =>
        safeEmit({
          url,
          method,
          status,
          startedAt,
          durationMs: Date.now() - startedAt,
          request: { headers: reqHeaders, body: reqBody },
          response: { headers: resHeaders, body: resBody },
          error,
        });

      return origFetch(input as RequestInfo, init).then(
        (res) => {
          const resHeaders = fromResponse(res.headers);
          if (captureBodies) {
            res
              .clone()
              .text()
              .then(
                (t) => done(res.status, resHeaders, clip(t)),
                () => done(res.status, resHeaders, null)
              );
          } else {
            done(res.status, resHeaders, null);
          }
          return res;
        },
        (err) => {
          done(0, {}, null, String(err));
          throw err;
        }
      );
    };
    ctx.fetch = wrapped;
  }

  if (OrigXHR) {
    class ReplayXHR extends OrigXHR {
      private _u = '';
      private _m = 'GET';
      private _t0 = 0;
      private _rb: string | null = null;
      private _rh: Record<string, string> = {};

      // axios (the common RN HTTP client) sets request headers via
      // setRequestHeader, so capture them here — otherwise the XHR path
      // reports empty request headers.
      setRequestHeader(name: string, value: string): void {
        if (keepHeader(name)) this._rh[name] = value;
        super.setRequestHeader(name, value);
      }

      open(
        method: string,
        url: string | URL,
        async: boolean = true,
        user?: string | null,
        pass?: string | null
      ): void {
        this._m = (method || 'GET').toUpperCase();
        this._u = typeof url === 'string' ? url : url.toString();
        super.open(method, url, async, user, pass);
      }

      send(body?: Document | XMLHttpRequestBodyInit | null): void {
        this._t0 = Date.now();
        this._rb = captureBodies ? clip(toBody(body)) : null;
        if (!isIgnored(this._u)) {
          this.addEventListener('loadend', () => {
            let resBody: string | null = null;
            if (captureBodies) {
              try {
                resBody =
                  this.responseType === '' || this.responseType === 'text'
                    ? clip(this.responseText)
                    : null;
              } catch {
                resBody = null;
              }
            }
            safeEmit({
              url: this._u,
              method: this._m,
              status: this.status,
              startedAt: this._t0,
              durationMs: Date.now() - this._t0,
              request: { headers: this._rh, body: this._rb },
              response: {
                headers: fromRaw(this.getAllResponseHeaders()),
                body: resBody,
              },
            });
          });
        }
        super.send(body);
      }
    }
    ctx.XMLHttpRequest = ReplayXHR as unknown as typeof XMLHttpRequest;
  }

  return {
    uninstall() {
      if (origFetch) ctx.fetch = origFetch;
      if (OrigXHR) ctx.XMLHttpRequest = OrigXHR;
    },
  };
}
