# react-native-replayfy

Replayfy session replay + analytics for React Native.

A thin client over the native Replayfy SDKs (Android + iOS), which do the
heavy lifting — screenshots, taps, performance, crashes. The JS layer adds
what the native side can't see from React Native: **JS network traffic,
`console` output, and unhandled JS errors**, plus ergonomic helpers for
masking and navigation.

## Install

```sh
npm install react-native-replayfy
cd ios && pod install
```

## Quick start

```tsx
import Replay, { ReplayProvider, ReplayMask } from 'react-native-replayfy';

// Option A — imperative:
Replay.start({
  projectKey: 'rpl_pk_xxxxxxxx',
  ingestUrl: 'https://ingest.replayfy.io',
});

// Option B — provider (boots once on mount):
<ReplayProvider config={{ projectKey: 'rpl_pk_xxx', ingestUrl: '…' }}>
  <App />
</ReplayProvider>;
```

```ts
Replay.identify('user_123', { plan: 'pro', email: 'a@b.com' });
Replay.track('purchase', { amount: 4200 });
Replay.screen('Checkout');
const id = await Replay.getSessionId();
```

## Masking

Wrap anything sensitive — it's masked in playback via the native privacy
registry (resolved through the React node, no bespoke wrapper component):

```tsx
<ReplayMask>
  <CardNumberField />
</ReplayMask>
```

Secure / password inputs are masked automatically; set
`maskAllInputs: true` to mask every input.

## Navigation (React Navigation)

Dependency-free helper — wire it to your container:

```tsx
import { trackScreens } from 'react-native-replayfy';

const navRef = useNavigationContainerRef();
<NavigationContainer
  ref={navRef}
  onReady={() => trackScreens(navRef)}
  onStateChange={() => trackScreens(navRef)}
/>;
```

## `Replay.start(config)` options

| Option | Type | Default | Description |
|---|---|---|---|
| `projectKey` | string | **required** | Project API key |
| `ingestUrl` | string | **required** | Ingest base URL |
| `distinctId` | string | — | Known user id at start |
| `recordScreen` | boolean | `true` | Native screenshots/frames |
| `recordNetwork` | boolean | `true` | JS `fetch` + `XHR` capture |
| `recordConsole` | boolean | `true` | `console.*` capture |
| `recordErrors` | boolean | `true` | Unhandled JS error capture |
| `recordPerformance` | boolean | `true` | Native perf vitals |
| `maskAllInputs` | boolean | `false` | Mask all text inputs |
| `fps` | number | `1` | Snapshot frames/sec |
| `wifiOnly` | boolean | `false` | Upload only on wifi |
| `network` | object | — | `{ captureBodies, maxBodyBytes, redactHeaders, ignoreUrls }` |

## Status

JS layer complete and type-checked. Native modules (iOS/Android bridges)
and the example app are in progress — see the repo's task tracker.

## License

Commercial. Contact help@replayfy.io for terms.
