package com.replayfy.reactnative

import com.facebook.react.uimanager.ThemedReactContext
import com.facebook.react.uimanager.ViewGroupManager

/**
 * Old Architecture (Paper) manager for the privacy-mask view. The generated
 * Fabric delegate/interface don't exist off the New Architecture, so this
 * variant is a plain [ViewGroupManager]; the shared [ReplayMaskView] does the
 * privacy-registry work on attach/detach.
 */
class ReplayMaskViewManager : ViewGroupManager<ReplayMaskView>() {
  override fun getName(): String = COMPONENT_NAME

  override fun createViewInstance(reactContext: ThemedReactContext): ReplayMaskView =
    ReplayMaskView(reactContext)

  companion object {
    const val COMPONENT_NAME = "ReplayMaskView"
  }
}
