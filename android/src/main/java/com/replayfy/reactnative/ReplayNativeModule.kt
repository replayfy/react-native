package com.replayfy.reactnative

import android.app.Application
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.uimanager.UIManagerModule
import com.replayfy.android.Replay
import com.replayfy.android.ReplayConfig
import org.json.JSONObject

/**
 * React Native bridge for Replayfy on Android. Thin forwarder onto the
 * native `Replay` SDK (which drives the live ReplayCore engine). JS-only
 * signals (network / console / errors) arrive here pre-assembled; the
 * engine handles screenshots, taps, performance, and crashes itself.
 */
class ReplayNativeModule(private val reactContext: ReactApplicationContext) :
  ReactContextBaseJavaModule(reactContext) {

  override fun getName(): String = "ReplayNative"

  @ReactMethod
  fun boot(projectKey: String, ingestUrl: String, configJson: String) {
    val app = reactContext.applicationContext as? Application ?: return
    // configJson knobs aren't consumed by the live engine yet (parity
    // with the native SDKs' current behaviour); accepted + ignored.
    Replay.init(app, ReplayConfig(apiKey = projectKey, apiHost = ingestUrl))
  }

  @ReactMethod
  fun identify(distinctId: String) {
    Replay.identify(distinctId)
  }

  @ReactMethod
  fun setMetadata(key: String, value: String) {
    Replay.recordMetadata(key, value)
  }

  @ReactMethod
  fun track(name: String, propsJson: String?) {
    Replay.track(name, parseProps(propsJson))
  }

  @ReactMethod
  fun screen(name: String) {
    Replay.tagScreenName(name)
  }

  @ReactMethod
  fun recordNetwork(recordJson: String) {
    val o = try {
      JSONObject(recordJson)
    } catch (_: Throwable) {
      return
    }
    Replay.recordNetwork(
      url = o.optString("url"),
      method = o.optString("method", "GET"),
      request = o.optJSONObject("request")?.toString() ?: "{}",
      response = o.optJSONObject("response")?.toString() ?: "{}",
      status = o.optInt("status", 0),
      duration = o.optLong("durationMs", 0L),
    )
  }

  @ReactMethod
  fun shutdown() {
    Replay.stopEngine()
  }

  @ReactMethod
  fun sessionId(promise: Promise) {
    promise.resolve(Replay.currentSessionId() ?: "")
  }

  @ReactMethod
  fun maskNode(reactTag: Double) {
    resolveAndMask(reactTag.toInt(), mask = true)
  }

  @ReactMethod
  fun unmaskNode(reactTag: Double) {
    resolveAndMask(reactTag.toInt(), mask = false)
  }

  /** Resolve a React tag to its native view on the UI thread, then
   *  hand it to the SDK's privacy registry. (Legacy-arch path; Fabric
   *  resolution is a follow-up.) */
  private fun resolveAndMask(tag: Int, mask: Boolean) {
    val uiManager =
      reactContext.getNativeModule(UIManagerModule::class.java) ?: return
    uiManager.addUIBlock { nvhm ->
      val view = try {
        nvhm.resolveView(tag)
      } catch (_: Throwable) {
        null
      } ?: return@addUIBlock
      if (mask) Replay.addPrivacyView(view) else Replay.removePrivacyView(view)
    }
  }

  private fun parseProps(json: String?): Map<String, Any?>? {
    if (json.isNullOrBlank()) return null
    return try {
      val obj = JSONObject(json)
      buildMap {
        for (key in obj.keys()) put(key, obj.get(key))
      }
    } catch (_: Throwable) {
      null
    }
  }
}
