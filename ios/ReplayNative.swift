import Foundation
import React
import Replay
#if canImport(UIKit)
import UIKit
#endif

/// React Native bridge for Replayfy. Thin forwarder onto the native
/// `Replay` SDK (which drives the live `ReplayCore` engine). JS-only
/// signals (network / console / errors) arrive here pre-assembled; the
/// engine handles screenshots, taps, performance, and crashes itself.
@objc(ReplayNative)
public final class ReplayNative: NSObject {

  @objc public static func requiresMainQueueSetup() -> Bool { false }

  @objc(boot:ingestUrl:configJson:)
  public func boot(_ projectKey: String, ingestUrl: String, configJson: String) {
    // Tag the session as React-Native-captured (dashboard shows "Captured by
    // …"; platform stays ios). Must precede start() — it's read in /start.
    ReplayBridge.setFramework("react-native")

    // Native knobs from the JS config. recordScreen gates the frame archive;
    // maskAllInputs auto-occludes text fields. fps is server-authoritative
    // (set from the /start response), so it isn't forwarded here.
    let cfg = Self.dict(from: configJson) ?? [:]
    let recordScreen = (cfg["recordScreen"] as? Bool) ?? true
    Replay.start(with: ReplayConfig(
      apiKey: projectKey,
      apiHost: ingestUrl,
      captureSnapshotPixels: recordScreen
    ))
    if (cfg["maskAllInputs"] as? Bool) == true {
      ReplayBridge.occludeAllTextFields(true)
    }
  }

  @objc(identify:)
  public func identify(_ distinctId: String) {
    Replay.identify(distinctId, properties: nil)
  }

  @objc(setMetadata:value:)
  public func setMetadata(_ key: String, value: String) {
    ReplayBridge.recordMetadata(key, value: value)
  }

  @objc(track:propsJson:)
  public func track(_ name: String, propsJson: String?) {
    Replay.track(name, properties: Self.dict(from: propsJson))
  }

  @objc(screen:)
  public func screen(_ name: String) {
    Replay.tagScreenName(name)
  }

  @objc(setMaskStyle:)
  public func setMaskStyle(_ style: Int) {
    // Global default style (blur = 0, overlay = 1) — JS sends the raw index,
    // we rebuild the Swift enum the engine consumes.
    Replay.setMaskStyle(ReplayMaskStyle(rawValue: style) ?? .blur)
  }

  @objc(recordNetwork:)
  public func recordNetwork(_ recordJson: String) {
    guard
      let data = recordJson.data(using: .utf8),
      let o = try? JSONSerialization.jsonObject(with: data) as? [String: Any]
    else { return }
    ReplayBridge.recordNetwork(
      url: o["url"] as? String ?? "",
      method: o["method"] as? String ?? "GET",
      request: Self.json(o["request"]),
      response: Self.json(o["response"]),
      status: o["status"] as? Int ?? 0,
      duration: o["durationMs"] as? Int ?? 0
    )
  }

  @objc
  public func shutdown() {
    ReplayBridge.stopEngine()
  }

  @objc(sessionId:rejecter:)
  public func sessionId(
    _ resolve: @escaping RCTPromiseResolveBlock,
    rejecter _: @escaping RCTPromiseRejectBlock
  ) {
    resolve(ReplayBridge.currentSessionId() ?? "")
  }

  // MARK: - Helpers

  private static func dict(from json: String?) -> [String: Any]? {
    guard
      let json,
      let data = json.data(using: .utf8),
      let obj = try? JSONSerialization.jsonObject(with: data) as? [String: Any]
    else { return nil }
    return obj
  }

  private static func json(_ value: Any?) -> String {
    guard
      let value,
      JSONSerialization.isValidJSONObject(value),
      let data = try? JSONSerialization.data(withJSONObject: value),
      let str = String(data: data, encoding: .utf8)
    else { return "{}" }
    return str
  }
}
