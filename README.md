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

## Text input tracking

Secure inputs auto-mask. To also record *what* a user types (funnel
debugging), call `trackInput` from a `TextInput`'s `onEndEditing` — pass
`masked: true` for sensitive fields (the value is dropped to `"***"` and
never leaves the device):

```tsx
<TextInput placeholder="Email"
  onEndEditing={(e) => Replay.trackInput('Email', e.nativeEvent.text)} />
<TextInput secureTextEntry
  onEndEditing={(e) => Replay.trackInput('Password', e.nativeEvent.text, true)} />
```

## Methods

| Method | Purpose |
|---|---|
| `start(config)` | Boot + start recording |
| `identify(distinctId, traits?)` | Attach a known user |
| `track(name, props?)` | Custom timeline / funnel event |
| `trackInput(label, value, masked?)` | Record a text input's value (masked → `"***"`) |
| `screen(name)` | Set the current screen name |
| `setMetadata` / `setUserProperty` / `setSessionProperty` | Sticky key/values |
| `addTagWithProperties(name, props?)` | Tag the session |
| `getSessionId()` → `Promise` | Resolve the active session id |
| `setMaskStyle(style)` | Global mask style (`ReplayMaskStyle.Blur` / `Overlay` / `Pixelate`) |
| `pauseRecording` / `resumeRecording` / `stop` / `startNewSession` / `cancelSession` | Lifecycle |
| `optOut(bool)` / `isOptedOut()` | GDPR opt-out |
| `urlForCurrentSession()` / `urlForCurrentUser()` | Session / user deep links |
| `<ReplayMask>` | Mask sensitive content (wrap any element) |

Native screenshots, taps, gestures, screen navigation, device info
(incl. network type), performance, and crashes are captured automatically.

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

JS layer + native bridges (iOS / Android) are functional and type-checked.
Network, console, errors, masking, text-input, and screen tracking are
wired end-to-end. `ReplayMask` renders under both the New (Fabric) and old
architectures.

## License

Commercial. Contact help@replayfy.io for terms.
