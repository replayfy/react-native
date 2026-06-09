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

RCT_EXTERN_METHOD(shutdown)

RCT_EXTERN_METHOD(sessionId:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)

@end
