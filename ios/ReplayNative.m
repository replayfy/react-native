#import <React/RCTBridgeModule.h>

// Old-architecture bridge registration. The implementation lives in
// ReplayNative.swift; this exposes it to the RN bridge.
@interface RCT_EXTERN_MODULE(ReplayNative, NSObject)

RCT_EXTERN_METHOD(boot:(NSString *)projectKey
                  ingestUrl:(NSString *)ingestUrl
                  configJson:(NSString *)configJson)

RCT_EXTERN_METHOD(identify:(NSString *)distinctId)

RCT_EXTERN_METHOD(setMetadata:(NSString *)key value:(NSString *)value)

RCT_EXTERN_METHOD(track:(NSString *)name propsJson:(NSString *)propsJson)

RCT_EXTERN_METHOD(screen:(NSString *)name)

RCT_EXTERN_METHOD(setMaskStyle:(NSInteger)style)

RCT_EXTERN_METHOD(recordNetwork:(NSString *)recordJson)

RCT_EXTERN_METHOD(input:(NSString *)value masked:(BOOL)masked label:(NSString *)label)

RCT_EXTERN_METHOD(shutdown)

RCT_EXTERN_METHOD(sessionId:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)

// ── Lifecycle ──
RCT_EXTERN_METHOD(startNewSession)
RCT_EXTERN_METHOD(pauseRecording)
RCT_EXTERN_METHOD(resumeRecording)
RCT_EXTERN_METHOD(cancelSession)
RCT_EXTERN_METHOD(stopApplicationAndUploadData)
RCT_EXTERN_METHOD(isRecording:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)

// ── Identity / events ──
RCT_EXTERN_METHOD(setUserProperty:(NSString *)key value:(NSString *)value)
RCT_EXTERN_METHOD(setSessionProperty:(NSString *)key value:(NSString *)value)
RCT_EXTERN_METHOD(addTagWithProperties:(NSString *)name propsJson:(NSString *)propsJson)
RCT_EXTERN_METHOD(reportBugEvent:(NSString *)name description:(NSString *)description)

// ── Screens ──
RCT_EXTERN_METHOD(setAutomaticScreenNameTagging:(BOOL)enabled)

// ── Privacy ──
RCT_EXTERN_METHOD(occludeAllTextFields:(BOOL)occlude)
RCT_EXTERN_METHOD(occludeAllTextView:(BOOL)occlude)
RCT_EXTERN_METHOD(occludeSensitiveScreen:(BOOL)occlude)

// ── GDPR ──
RCT_EXTERN_METHOD(optOut:(BOOL)optedOut)
RCT_EXTERN_METHOD(isOptedOut:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)

// ── Session extras ──
RCT_EXTERN_METHOD(markSessionAsFavorite)
RCT_EXTERN_METHOD(setPushNotificationToken:(NSString *)token)
RCT_EXTERN_METHOD(setAppVersion:(NSString *)version build:(NSString *)build)
RCT_EXTERN_METHOD(setMultiSessionRecord:(BOOL)enabled)
RCT_EXTERN_METHOD(allowShortBreakForAnotherApp:(BOOL)allow)

// ── Deep links ──
RCT_EXTERN_METHOD(urlForCurrentSession:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)
RCT_EXTERN_METHOD(urlForCurrentUser:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)

@end
