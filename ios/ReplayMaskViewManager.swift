import Foundation
import React
import Replay
import UIKit

/// Native privacy-mask view for React Native.
///
/// Mirrors the native SDKs (and the reference RN SDK's sanitized view): a real
/// native view that registers itself with the engine's privacy registry on
/// attach and unregisters on detach. The masked region therefore tracks the
/// live view (scroll / layout changes) and the screenshotter blurs it + paints
/// diagonal stripes — no React-tag round-trip, no UIManager-queue hop, no race.
@objc(ReplayMaskViewManager)
final class ReplayMaskViewManager: RCTViewManager {
  override func view() -> UIView! { ReplayMaskView() }
  override static func requiresMainQueueSetup() -> Bool { true }
}

/// Container view that self-registers as a privacy region while on screen.
final class ReplayMaskView: UIView {
  override func didMoveToWindow() {
    super.didMoveToWindow()
    if window != nil {
      Replay.addPrivacyView(self)
    } else {
      Replay.removePrivacyView(self)
    }
  }
}
