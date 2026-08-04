# Changelog

All notable changes to `@replayfyapp/react-native` are documented here.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
