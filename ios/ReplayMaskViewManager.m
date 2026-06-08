#import <React/RCTViewManager.h>

// Old-architecture registration for the native privacy-mask view. The
// implementation lives in ReplayMaskViewManager.swift; this exposes the view
// manager (component name "ReplayMaskView") to the RN bridge.
@interface RCT_EXTERN_MODULE(ReplayMaskViewManager, RCTViewManager)
@end
