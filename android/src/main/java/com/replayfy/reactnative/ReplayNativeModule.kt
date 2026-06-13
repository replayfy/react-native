package com.replayfy.reactnative

import android.app.Application
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
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
    // Tag the session as React-Native-captured (dashboard shows "Captured by
    // …"; platform stays android). Must precede init() — read in /start.
    Replay.setFramework("react-native")

    // Native knobs from the JS config. recordScreen gates the frame archive;
    // maskAllInputs auto-occludes text fields. fps is server-authoritative
    // (set from the /start response), so it isn't forwarded here.
    val cfg = try { JSONObject(configJson) } catch (e: Exception) { JSONObject() }
    val recordScreen = cfg.optBoolean("recordScreen", true)
    Replay.init(
      app,
      ReplayConfig(apiKey = projectKey, apiHost = ingestUrl, captureSnapshotPixels = recordScreen),
    )
    if (cfg.optBoolean("maskAllInputs", false)) {
      Replay.occludeAllTextFields(true)
    }
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
  fun setMaskStyle(style: Int) {
    // Global default style (blur = 0, overlay = 1) — JS sends the raw index.
    Replay.setMaskStyle(com.replayfy.android.ReplayMaskStyle.from(style))
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

  // ── Lifecycle ──
  @ReactMethod fun startNewSession() { Replay.startNewSession() }
  @ReactMethod fun pauseRecording() { Replay.pauseRecording() }
  @ReactMethod fun resumeRecording() { Replay.resumeRecording() }
  @ReactMethod fun cancelSession() { Replay.cancelSession() }
  @ReactMethod fun stopApplicationAndUploadData() { Replay.stopApplicationAndUploadData() }
  @ReactMethod fun isRecording(promise: Promise) { promise.resolve(Replay.isRecording()) }

  // ── Identity / events ──
  @ReactMethod fun setUserProperty(key: String, value: String) { Replay.setUserProperty(key, value) }
  @ReactMethod fun setSessionProperty(key: String, value: String) { Replay.setSessionProperty(key, value) }
  @ReactMethod fun addTagWithProperties(name: String, propsJson: String?) { Replay.addTagWithProperties(name, parseProps(propsJson)) }
  @ReactMethod fun reportBugEvent(name: String, description: String) { Replay.reportBugEvent(name, description) }

  // ── Screens ──
  @ReactMethod fun setAutomaticScreenNameTagging(enabled: Boolean) { Replay.setAutomaticScreenNameTagging(enabled) }

  // ── Privacy ──
  @ReactMethod fun occludeAllTextFields(occlude: Boolean) { Replay.occludeAllTextFields(occlude) }
  @ReactMethod fun occludeAllTextView(occlude: Boolean) { Replay.occludeAllTextView(occlude) }
  @ReactMethod fun occludeSensitiveScreen(occlude: Boolean) { Replay.occludeSensitiveScreen(occlude) }

  // ── GDPR ──
  @ReactMethod fun optOut(optedOut: Boolean) { Replay.optOutOverall(optedOut) }
  @ReactMethod fun isOptedOut(promise: Promise) { promise.resolve(Replay.isOptedOutOverall()) }

  // ── Session extras ──
  @ReactMethod fun markSessionAsFavorite() { Replay.markSessionAsFavorite() }
  @ReactMethod fun setPushNotificationToken(token: String) { Replay.setPushNotificationToken(token) }
  @ReactMethod fun setAppVersion(version: String, build: String) { Replay.setAppVersion(version, build.ifEmpty { null }) }
  @ReactMethod fun setMultiSessionRecord(enabled: Boolean) { Replay.setMultiSessionRecord(enabled) }
  @ReactMethod fun allowShortBreakForAnotherApp(allow: Boolean) { Replay.allowShortBreakForAnotherApp(allow) }

  // ── Deep links ──
  @ReactMethod fun urlForCurrentSession(promise: Promise) { promise.resolve(Replay.urlForCurrentSession() ?: "") }
  @ReactMethod fun urlForCurrentUser(promise: Promise) { promise.resolve(Replay.urlForCurrentUser() ?: "") }

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
