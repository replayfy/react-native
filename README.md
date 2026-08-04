# Replayfy for React Native

> Session replay, product analytics & error monitoring for React Native apps.

Replayfy records what your users actually do — screens, taps, gestures,
network calls, console output, and crashes — and turns it into replayable
sessions, product analytics, and error insights in your [Replayfy dashboard](https://replayfy.app).

## Features

- **Session replay** — automatic capture of screens, taps, gestures, and
  navigation, replayed pixel-for-pixel in the dashboard.
- **Product analytics** — identify users, track custom events, and set
  user/session properties to power funnels and cohorts.
- **Error monitoring** — automatic unhandled-error capture plus a
  `captureException` API for handled errors, with full stack traces.
- **Network & console capture** — every `fetch`/`XHR` request and
  `console.*` line is attached to the session timeline.
- **Privacy first** — mask any element with `<ReplayMask>`, auto-mask secure
  inputs, occlude whole screens, and redact sensitive network headers.
- **React Navigation aware** — one-line screen tracking for React Navigation.
- **Native performance** — recording runs on the native iOS/Android engines,
  keeping the JS thread free.

## Install

```sh
npm install @replayfyapp/react-native
```

Then install the iOS pods:

```sh
cd ios && pod install
```

React Native links the native module automatically. Rebuild the app (a fresh
`npx react-native run-ios` / `run-android`) after installing so the native
module is bundled.

### Android (JitPack)

The native Android recording engine is distributed through JitPack. If your app
uses Gradle's centralized repositories (a `dependencyResolutionManagement` block
in `android/settings.gradle`), add JitPack there so the transitive native SDK
resolves:

```gradle
dependencyResolutionManagement {
  repositories {
    google()
    mavenCentral()
    maven { url 'https://jitpack.io' }
  }
}
```

## Quick start

```tsx
import Replay from '@replayfyapp/react-native';

Replay.start({
  apiKey: 'rpl_pk_xxxxxxxx',
  apiHost: 'https://us.replayfy.app',
});
```

Or boot once from a provider at the top of your tree:

```tsx
import { ReplayProvider } from '@replayfyapp/react-native';

export default function App() {
  return (
    <ReplayProvider
      config={{
        apiKey: 'rpl_pk_xxxxxxxx',
        apiHost: 'https://us.replayfy.app',
      }}
    >
      <RootNavigator />
    </ReplayProvider>
  );
}
```

Once recording, identify your users and track what matters:

```tsx
Replay.identify('user_123', { plan: 'pro', email: 'a@b.com' });
Replay.track('purchase', { amount: 4200, currency: 'USD' });
Replay.screen('Checkout');
```

## Configuration

Pass these to `Replay.start(config)`:

| Option | Type | Default | Description |
|---|---|---|---|
| `apiKey` | `string` | **required** | Your project API key from the dashboard. |
| `apiHost` | `string` | **required** | Ingest host, e.g. `https://us.replayfy.app`. |
| `distinctId` | `string` | — | Known user id at start (otherwise an install-stable anonymous id is used). |
| `recordScreen` | `boolean` | `true` | Capture screen frames. |
| `recordNetwork` | `boolean` | `true` | Capture `fetch` + `XHR` traffic. |
| `recordConsole` | `boolean` | `true` | Capture `console.*` output. |
| `recordErrors` | `boolean` | `true` | Capture unhandled JS errors. |
| `recordPerformance` | `boolean` | `true` | Capture performance vitals. |
| `maskAllInputs` | `boolean` | `false` | Mask every text input in replay. |
| `fps` | `number` | `1` | Screen snapshot frames per second. |
| `wifiOnly` | `boolean` | `false` | Only upload over Wi-Fi. |
| `debug` | `boolean` | `false` | Verbose SDK logging. |
| `network` | `object` | — | Network capture tuning (see below). |

**Network capture options** (`config.network`):

| Option | Type | Default | Description |
|---|---|---|---|
| `captureBodies` | `boolean` | `false` | Capture request/response bodies. |
| `maxBodyBytes` | `number` | `4096` | Truncate captured bodies beyond this length. |
| `redactHeaders` | `string[] \| boolean` | sensitive denylist | Header names to drop; `true` drops all, `false` keeps all. |
| `ignoreUrls` | `Array<string \| RegExp>` | — | URLs to skip entirely (substring for strings, `.test` for RegExp). |

## API

Reach the client through the default export (`Replay`), or `getClient()`.

### `start(config)`

Boot the SDK and start recording. Idempotent.

```tsx
Replay.start({ apiKey: 'rpl_pk_xxx', apiHost: 'https://us.replayfy.app' });
```

### `identify(distinctId, traits?)`

Attach a known-user identity, with optional traits stored as metadata.

```tsx
Replay.identify('user_123', { plan: 'pro', email: 'a@b.com' });
```

### `track(name, props?)`

Record a custom timeline / funnel event.

```tsx
Replay.track('add_to_cart', { sku: 'AB-12', qty: 2 });
```

### `captureException(error, opts?)`

Report a handled error to the session timeline and the dashboard's issues.
`handled` defaults to `true`; extra keys on `opts` are merged into the payload.

```tsx
try {
  await checkout();
} catch (err) {
  Replay.captureException(err, { handled: true, step: 'payment' });
}
```

### `stopApplicationAndUploadData()`

Flush and upload the current session's buffered data immediately (e.g. before
a logout).

```tsx
Replay.stopApplicationAndUploadData();
```

### `stop()`

Stop recording, flush, and detach the JS observers.

```tsx
Replay.stop();
```

### `screen(name)`

Set the current screen name.

```tsx
Replay.screen('Checkout');
```

### `trackScreens(navigationRef)`

Automatic screen tracking for React Navigation.

```tsx
import { trackScreens } from '@replayfyapp/react-native';

const navRef = useNavigationContainerRef();

<NavigationContainer
  ref={navRef}
  onReady={() => trackScreens(navRef)}
  onStateChange={() => trackScreens(navRef)}
/>;
```

### `trackInput(label, value, masked?)`

Record a text input's value from a `TextInput`'s `onEndEditing`. Pass
`masked: true` for sensitive fields — the value is dropped (recorded as
`"***"`) and never leaves the device.

```tsx
<TextInput
  placeholder="Email"
  onEndEditing={(e) => Replay.trackInput('Email', e.nativeEvent.text)}
/>
<TextInput
  secureTextEntry
  onEndEditing={(e) => Replay.trackInput('Password', e.nativeEvent.text, true)}
/>
```

### Properties & tags

```tsx
Replay.setUserProperty('plan', 'pro');       // sticky, user-level
Replay.setSessionProperty('ab_variant', 'B'); // this session only
Replay.setMetadata('team', 'acme');          // sticky metadata
Replay.addTagWithProperties('promo_seen', { id: 'summer' });
```

### Session control

```tsx
Replay.pauseRecording();
Replay.resumeRecording();
Replay.startNewSession();
Replay.cancelSession();               // discard without uploading
const recording = await Replay.isRecording();
const id = await Replay.getSessionId();
```

### Deep links

```tsx
const sessionUrl = await Replay.urlForCurrentSession();
const userUrl = await Replay.urlForCurrentUser();
```

### Privacy opt-out (GDPR)

```tsx
Replay.optOut(true);                  // stop all recording for this user
const out = await Replay.isOptedOut();
```

### Session extras

```tsx
Replay.markSessionAsFavorite();
Replay.setAppVersion('1.4.2', '142');
Replay.setPushNotificationToken(token);
Replay.log('checkout started', 'info'); // bridge a log line onto the timeline
```

## Privacy & masking

Replayfy is built to keep sensitive data off your servers.

- **`<ReplayMask>`** — wrap any element to mask it in replay:

  ```tsx
  import { ReplayMask } from '@replayfyapp/react-native';

  <ReplayMask>
    <CardNumberField />
  </ReplayMask>;
  ```

- **Automatic input masking** — secure/password inputs are masked
  automatically. Set `maskAllInputs: true` to mask every input.

- **Mask style** — choose how masked regions render:

  ```tsx
  import { ReplayMaskStyle } from '@replayfyapp/react-native';

  Replay.setMaskStyle(ReplayMaskStyle.Blur);    // Blur | Overlay | Pixelate
  ```

- **Screen occlusion** — hide fields or entire sensitive flows from replay:

  ```tsx
  Replay.occludeAllTextFields(true);
  Replay.occludeAllTextView(true);
  Replay.occludeSensitiveScreen(true);
  ```

- **Network redaction** — drop sensitive headers or skip URLs entirely via
  `config.network.redactHeaders` and `config.network.ignoreUrls`; request and
  response bodies are off by default.

## Links

- Docs: https://docs.replayfy.app/platforms/react-native
- Dashboard: https://replayfy.app
