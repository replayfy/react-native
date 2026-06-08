package com.replayfy.reactnative

import android.content.Context
import com.facebook.react.uimanager.ThemedReactContext
import com.facebook.react.uimanager.ViewGroupManager
import com.facebook.react.views.view.ReactViewGroup
import com.replayfy.android.Replay

/**
 * Native privacy-mask view for React Native.
 *
 * Mirrors the native SDKs (and the reference RN SDK's sanitized view): the
 * view registers itself with the engine's privacy registry on attach and
 * unregisters on detach, so the masked region tracks the live view and the
 * capture pipeline paints the diagonal-stripe overlay over it. Replaces the
 * brittle findNodeHandle / maskNode tag round-trip.
 *
 * No getLocationInWindow scale-override here on purpose: our engine computes
 * the capture-scaled privacy rects itself (the same path native masking uses),
 * so correcting again at the view layer would double-scale the region.
 */
class ReplayMaskViewManager : ViewGroupManager<ReplayMaskView>() {
  override fun getName(): String = COMPONENT_NAME

  override fun createViewInstance(reactContext: ThemedReactContext): ReplayMaskView =
    ReplayMaskView(reactContext)

  companion object {
    const val COMPONENT_NAME = "ReplayMaskView"
  }
}

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
