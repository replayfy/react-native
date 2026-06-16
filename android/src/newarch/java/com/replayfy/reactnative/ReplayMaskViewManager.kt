package com.replayfy.reactnative

import com.facebook.react.module.annotations.ReactModule
import com.facebook.react.uimanager.ThemedReactContext
import com.facebook.react.uimanager.ViewGroupManager
import com.facebook.react.uimanager.ViewManagerDelegate
import com.facebook.react.viewmanagers.ReplayMaskViewManagerDelegate
import com.facebook.react.viewmanagers.ReplayMaskViewManagerInterface

/**
 * New Architecture (Fabric) manager for the privacy-mask view.
 *
 * Implements the codegen-generated [ReplayMaskViewManagerInterface] and wires
 * the [ReplayMaskViewManagerDelegate] so Fabric registers `ReplayMaskView` as a
 * real Fabric component (and resolves its static view config) instead of
 * falling back to the legacy Paper interop. It's a prop-less marker view, so
 * the interface/delegate carry no setters.
 */
@ReactModule(name = ReplayMaskViewManager.COMPONENT_NAME)
class ReplayMaskViewManager :
  ViewGroupManager<ReplayMaskView>(),
  ReplayMaskViewManagerInterface<ReplayMaskView> {

  private val mDelegate: ViewManagerDelegate<ReplayMaskView> =
    ReplayMaskViewManagerDelegate(this)

  override fun getDelegate(): ViewManagerDelegate<ReplayMaskView> = mDelegate

  override fun getName(): String = COMPONENT_NAME

  override fun createViewInstance(reactContext: ThemedReactContext): ReplayMaskView =
    ReplayMaskView(reactContext)

  companion object {
    const val COMPONENT_NAME = "ReplayMaskView"
  }
}
