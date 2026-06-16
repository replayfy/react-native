package com.replayfy.reactnative

import android.content.Context
import com.facebook.react.views.view.ReactViewGroup
import com.replayfy.android.Replay

/**
 * The privacy-mask view itself — shared across architectures.
 *
 * Registers itself with the engine's privacy registry on attach and
 * unregisters on detach (the exact mechanism the native iOS/Android SDKs use),
 * so the masked region tracks the live view and the capture pipeline blurs it
 * and overlays diagonal stripes.
 *
 * The arch-specific ViewManager lives in `src/newarch` (Fabric: implements the
 * codegen-generated delegate so it registers as a real Fabric component) and
 * `src/oldarch` (Paper).
 */
class ReplayMaskView(context: Context) : ReactViewGroup(context) {
  override fun onAttachedToWindow() {
    super.onAttachedToWindow()
    Replay.addPrivacyView(this)
  }

  override fun onDetachedFromWindow() {
    super.onDetachedFromWindow()
    Replay.removePrivacyView(this)
  }
}
