# Changelog

All notable changes to `@replayfyapp/react-native` are documented here.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.0.7] - 2026-10-14

### Fixed

- **Recordings no longer lose frames and events when the app goes to the
  background**, on iOS and Android. Requires the native iOS SDK `Replayfy`
  0.0.6 or later and bundles the native Android SDK 0.0.6. Uploads now finish
  as the app is backgrounded (an iOS background task; a full drain on
  Android), leftovers go out on return, and a session end that never reached
  the server is resent on the next launch (Android).
- **Android: no more crash in apps that use Jetpack Compose.** When PixelCopy
  failed (common on Android 8 and 9) the native SDK drew the view tree on a
  background thread, and Compose crashed the app on its next frame with
  `Detected multithreaded access to SnapshotStateObserver`.
- **`recordScreen: false` is respected after a return.** The native screenshot
  timer used to restart when the app came back to the foreground, when a
  `pauseRecording` was lifted or when the user left an excluded screen, so
  apps that turned screen capture off got screenshots anyway.
- **Excluded screens and `pauseRecording` hold** across background,
  foreground and session rotation; on Android a screen named with `screen()`
  keeps its name (and its exclusion) when the app returns.
- **iOS: calls into the native SDK run on the main thread.** React Native
  called the module on a background queue, while the engine's session and
  frame state (start, stop, screen exclusion, pause/resume) is main-thread
  only, so a stop or an exclusion could race the capture timer.
- **iOS: `pod install` works with `use_frameworks!`.** The pod is now a static
  framework like the `Replayfy` pod it depends on; before, any app whose
  Podfile used frameworks failed with "transitive dependencies that include
  statically linked binaries".

### Changed

- The package and podspec declare the MIT license, matching `LICENSE` (they
  said BSD-3-Clause).

To update: `npm install @replayfyapp/react-native@0.0.7`, then
`cd ios && pod update Replayfy --repo-update`, rebuild both apps and ship new
builds.

## [0.0.6]

- Wire the mobile engine stubs + screen exclusion through the bridge, and
  bundle native Android SDK 0.0.4.

## [0.0.5] - 2026-08-21

### Changed

- Android: the bundled native SDK now resolves from **Maven Central**
  (`app.replayfy:android-sdk:0.0.3`) as the primary source, with JitPack kept as
  a fallback. Fixes Gradle `No route to host` against jitpack.io on locked-down
  networks and removes the need to add the JitPack repository to your app's
  `android/settings.gradle`.

## [0.0.4] - 2026-08-04

### Changed

- **Breaking:** renamed `ReplayConfig.projectKey` -> `apiKey` and `ingestUrl` ->
  `apiHost` to match the other Replayfy SDKs (web, iOS, Android). Update your
  `Replay.start({ apiKey, apiHost })` call.

## [0.0.3] - 2026-08-04

### Changed

- Relicensed under BSD-3-Clause (was MIT).

## [0.0.1] - 2026-08-03

### Added

- Initial release of the Replayfy SDK for React Native.
- Session replay with automatic screen capture, taps, gestures, and screen
  navigation.
- Product analytics: `identify`, `track`, custom events, user/session
  properties, and screen tracking.
- Error monitoring: automatic unhandled-JS-error capture plus
  `captureException` for handled errors.
- Automatic JavaScript network (`fetch` + `XHR`) and `console` capture.
- Privacy controls: `<ReplayMask>`, automatic secure-input masking,
  `maskAllInputs`, per-field masked input tracking, and screen occlusion.
- React Navigation screen tracking via `trackScreens`.
- GDPR opt-out controls and session deep links.
