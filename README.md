# Replayfy for React Native

> Session replay, product analytics & error monitoring for React Native apps.

Replayfy records what your users actually do — screens, taps, gestures,
network calls, console output, and crashes — and turns it into replayable
sessions, product analytics, and error insights in your [Replayfy dashboard](https://app.replayfy.app).

## Features

- **Session replay** — automatic capture of screens, taps, gestures, and
  navigation, replayed pixel-for-pixel in the dashboard.
- **Product analytics** — identify users, track custom events, and set
  user/session properties to power funnels and cohorts.
- **Error monitoring** — automatic unhandled-error capture plus a
  `captureException` API for handled errors, with full stack traces.
- **Network & console capture** — every `fetch`/`XHR` request and
  `console.*` line is attached to the session timeline.
- **Privacy first** — mask any element with `<ReplayMask>`, auto-mask
  password, card and one-time-code inputs, occlude whole screens, and redact
  sensitive network headers.
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
  apiHost: 'https://us.replayfy.app',  // or your self-hosted API URL
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
        apiHost: 'https://us.replayfy.app',  // or your self-hosted API URL
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
| `apiHost` | `string` | **required** | Ingest host, e.g. `https://us.replayfy.app` (or your self-hosted API URL). |
| `distinctId` | `string` | — | Known user id at start (otherwise an install-stable anonymous id is used). |
| `recordScreen` | `boolean` | `true` | Capture screen frames. |
| `recordNetwork` | `boolean` | `true` | Capture `fetch` + `XHR` traffic. |
| `recordConsole` | `boolean` | `true` | Capture `console.*` output. |
| `recordErrors` | `boolean` | `true` | Capture unhandled JS errors. |
| `recordPerformance` | `boolean` | `true` | Capture performance vitals. |
| `maskAllInputs` | `boolean` | `false` | Mask every text input in replay; `trackInput` values are then recorded as `"***"`. The dashboard's **Always mask input values** setting masks every text input in replay for every session; `false` here doesn't undo it. |
| `fps` | `number` | `1` | Screen snapshot frames per second. |
| `wifiOnly` | `boolean` | `false` | Only upload over Wi-Fi. |
| `debug` | `boolean` | `false` | Verbose SDK logging. |
| `network` | `object` | — | Network capture tuning (see below). |

**Network capture options** (`config.network`):

| Option | Type | Default | Description |
|---|---|---|---|
| `captureBodies` | `boolean` | `true` | Read request/response bodies on the device (clipped at `maxBodyBytes`). They are uploaded only while the project's **Capture request / response bodies** setting is on (off by default); see [Network redaction](#network-redaction). |
| `maxBodyBytes` | `number` | `4096` | Truncate captured bodies beyond this length. |
| `redactHeaders` | `string[] \| boolean` | sensitive denylist | Header names to drop on the device; `true` drops all, `false` keeps all. Headers are uploaded only while the project's **Capture request / response headers** setting is on (off by default). |
| `ignoreUrls` | `Array<string \| RegExp>` | — | URLs to skip entirely (substring for strings, `.test` for RegExp). |

## API

Reach the client through the default export (`Replay`), or `getClient()`.

### `start(config)`

Boot the SDK and start recording. Idempotent.

```tsx
Replay.start({ apiKey: 'rpl_pk_xxx', apiHost: 'https://us.replayfy.app' });  // or your self-hosted API URL
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

### Screen exclusion

Exclude a screen from frame capture **by name**. While an excluded screen is in
the foreground the periodic screenshot loop pauses — taps, network, console, and
performance events keep flowing — and it resumes on the next non-excluded screen.
Names are matched case-insensitively against the tagged / auto-tagged screen name
(see `screen` / `trackScreens`).

This is distinct from `occludeSensitiveScreen`, which keeps recording frames but
blanks them: exclusion captures no frames of that screen at all.

```tsx
Replay.excludeScreen('PinEntry');                    // stop capturing frames here
Replay.unexcludeScreen('PinEntry');                  // capture it again
Replay.setExcludedScreens(['PinEntry', 'Billing']);  // replace the whole denylist
```

### `trackInput(label, value, masked?)`

Record a text input's value from a `TextInput`'s `onEndEditing`. Pass
`masked: true` for sensitive fields — the value is dropped (recorded as
`"***"`) and never leaves the device. Nothing is recorded for a field unless
you call this. `masked` only drops the value; it doesn't mask the field in
playback (see [Privacy & masking](#privacy--masking) for what is masked), and
the call can't see the field.

The value is dropped whatever `masked` says while every text field is masked
(`maskAllInputs` or `occludeAllTextFields(true)`) or the whole screen is
(`occludeSensitiveScreen(true)`); on Android also on a `FLAG_SECURE` window,
and on iOS also while the dashboard's **Always mask input values** setting is
on. On Android that dashboard setting masks the frames but not this value.

So pass `masked: true` for every other field that is masked in playback:
`secureTextEntry`, card and one-time-code fields, and anything inside
`<ReplayMask>`. Leave it off only for values that are fine to record, such as
a search query.

```tsx
<TextInput
  placeholder="Search"
  onEndEditing={(e) => Replay.trackInput('Search', e.nativeEvent.text)}
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
Replay.cancelSession();               // discard the current session without uploading (a fresh one can start after)
const recording = await Replay.isRecording();
const id = await Replay.getSessionId();
```

### `enableAdvancedGestureRecognizer(enabled)`

Additionally capture **pinch** and **rotate** gestures, on top of the always-on
tap / swipe / long-press. Off by default.

```tsx
Replay.enableAdvancedGestureRecognizer(true);
```

### `allowShortBreakForAnotherApp(allow, breakWindowMs?)`

Allow a brief switch to another app without ending the session. If the app comes
back to the foreground within `breakWindowMs` the **same** session continues; a
longer gap starts a **fresh** session on return. `breakWindowMs` defaults to
`30000` (30s).

```tsx
Replay.allowShortBreakForAnotherApp(true);         // 30s grace window
Replay.allowShortBreakForAnotherApp(true, 60000);  // allow up to 60s away
```

### `setMultiSessionRecord(enabled)`

Record multiple sessions per app launch (the default) or only one. When turned
off, the current/next session records and then no further sessions open for the
rest of this process.

```tsx
Replay.setMultiSessionRecord(false);  // record a single session this launch
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

Replayfy is built to keep sensitive data off your servers. Masking happens on
the device, before a frame is uploaded, and a masked region is painted as a
solid box by default, so no pixel of it leaves the device.

### Masked automatically

These `TextInput`s are masked with no code beyond the prop, and always as a
solid box:

| Field | Android | iOS |
|---|---|---|
| `secureTextEntry` | Yes (see the note below) | Yes |
| `autoComplete="cc-number"` | Android 8.0+ | Yes (see the note below) |
| `autoComplete="one-time-code"` | Android 8.0+ | Yes (see the note below) |
| `autoComplete="cc-csc"`, `"cc-exp"`, `"cc-exp-month"`, `"cc-exp-year"`, `"sms-otp"` | Android 8.0+ | No |
| `autoComplete="current-password"`, `"new-password"` | No | Yes (see the note below) |
| `textContentType="password"`, `"newPassword"`, `"oneTimeCode"`, `"creditCardNumber"` | No (iOS-only prop) | Yes |

So is anything inside `<ReplayMask>` (below). Every other field is recorded as
it appears on screen. For a card number or a one-time code,
`autoComplete="cc-number"` and `autoComplete="one-time-code"` are detected on
both platforms (on Android, React Native passes `one-time-code` on as
`sms-otp`; on an older React Native that doesn't, use `"sms-otp"` there).

> **Android:** `secureTextEntry` is **not** detected together with
> `keyboardType="phone-pad"`, `"email-address"`, `"url"` or
> `"visible-password"`. React Native then gives the field an input type that
> Android doesn't treat as a password, and Android shows its characters on the
> device too. Wrap such a field in `<ReplayMask>`. A secure PIN field with
> `keyboardType="number-pad"` (or `"numeric"` / `"decimal-pad"`) is detected.
> Card and one-time-code fields are found by their autofill hints, which React
> Native sets only on Android 8.0 (API 26) and later; on Android 7.x wrap them
> in `<ReplayMask>`.

> **iOS:** the SDK reads `textContentType`, and React Native fills it in from
> `autoComplete`. A `textContentType` you set yourself wins, so
> `autoComplete="one-time-code"` with `textContentType="none"` (or any value
> not in the table) is **not** detected. On a React Native version that
> doesn't map `autoComplete` on iOS, set `textContentType` instead.

Taps on masked content are recorded without its text, so a tap can't leak
what the frame hides.

### Masking more

- **`<ReplayMask>`** — wrap any element to mask it in replay:

  ```tsx
  import { ReplayMask } from '@replayfyapp/react-native';

  <ReplayMask>
    <CardNumberField />
  </ReplayMask>;
  ```

- **Every text input** — set `maskAllInputs: true` in the config, or call
  `Replay.occludeAllTextFields(true)`, to mask every `TextInput` (single- and
  multi-line) on both platforms. The dashboard's **Always mask input values**
  setting does the same for every session of the project, from the next
  session start, and `maskAllInputs: false` doesn't undo it. (On Android it
  doesn't reach values recorded with `trackInput`; see there.)

- **Screen occlusion** — hide text or entire sensitive flows from replay:

  ```tsx
  Replay.occludeAllTextFields(true);   // every text input
  Replay.occludeAllTextView(true);     // native text labels (see below)
  Replay.occludeSensitiveScreen(true); // the whole frame, as one solid box
  ```

  `occludeAllTextView` masks every `<Text>` on Android. On iOS it masks native
  labels only, and React Native draws `<Text>` without one, so wrap sensitive
  `<Text>` in `<ReplayMask>`. On iOS, taps on a screen hidden with
  `occludeSensitiveScreen(true)` are not recorded either.

- **Android `FLAG_SECURE`** — a screen whose window sets `FLAG_SECURE` is
  recorded as a black frame; its pixels are never copied. An app that sets it
  on its main window records black frames throughout.

- **Typed values** — `trackInput` records nothing unless you call it. Its
  value is dropped while every text field or the whole screen is masked; for
  any other field that is masked in playback, pass `masked: true` (see
  [`trackInput`](#trackinputlabel-value-masked)).

### Mask style

Masked regions are a solid box (`ReplayMaskStyle.Overlay`) by default. You can
blur or pixelate `<ReplayMask>` content and bulk-masked text instead:

```tsx
import { ReplayMaskStyle } from '@replayfyapp/react-native';

Replay.setMaskStyle(ReplayMaskStyle.Blur);    // Overlay (default) | Blur | Pixelate
```

The fields masked automatically, `occludeSensitiveScreen` and `FLAG_SECURE`
frames stay solid whatever the style: a blur can still show how long a
password is.

### Network redaction

Network calls are recorded with their URL, method, status and timing (while
the project's **Capture network requests** setting is on, the default).
Headers and bodies are uploaded only while the project's **Capture request /
response headers** and **Capture request / response bodies** settings are on in
the dashboard; both are off by default, and until then the native engine drops
them on the device before upload.

On the device, `Cookie`, `Set-Cookie`, `Authorization` and `X-API-Key` are
dropped by default (`config.network.redactHeaders`), and bodies are read and
clipped at `maxBodyBytes`. Set `config.network.captureBodies: false` to never
read bodies, or skip URLs entirely with `config.network.ignoreUrls`.

## Links

- Docs: https://docs.replayfy.app/platforms/react-native
- Dashboard: https://app.replayfy.app

## Native SDK distribution & Android build troubleshooting

`react-native-replayfy` is a thin bridge over the native Replayfy SDKs:

- **Android** → `app.replayfy:android-sdk` from **Maven Central** (primary;
  JitPack `com.github.replayfy:android-sdk` is a fallback).
- **iOS** → the **`Replayfy`** pod via **CocoaPods** (RN's default iOS channel).

**Android — `No route to host` fetching from `jitpack.io`:** the build host
can't reach JitPack (corporate/CI firewall, proxy, or IPv6). Maven Central (now
primary) avoids this. If a build still hits JitPack:
- confirm reachability on the *build host*: `curl -I https://jitpack.io`
- behind a proxy → set `systemProp.https.proxyHost/proxyPort` in `gradle.properties`
- IPv6 issue → `org.gradle.jvmargs=-Djava.net.preferIPv4Stack=true`
