import type { ComponentType } from 'react';
import type { ViewProps } from 'react-native';
import ReplayMaskView from '../ReplayMaskViewNativeComponent';

/**
 * Mask everything rendered inside this component in playback.
 *
 * Backed by a native view (RCTViewManager on iOS, ViewGroupManager on
 * Android) that registers itself with the engine's privacy registry on attach
 * and unregisters on detach — the exact mechanism the native iOS/Android SDKs
 * use. The masked region therefore tracks the live view (scroll / layout) and
 * the screenshotter blurs it and overlays diagonal stripes. Nest freely.
 *
 * Declared via codegen ({@link ReplayMaskView}) so it resolves as a Fabric
 * component under the New Architecture; on the old architecture
 * `codegenNativeComponent` falls back to `requireNativeComponent`. Fails loud
 * (throws on render) if the native view isn't linked, rather than silently
 * leaving sensitive content unmasked — privacy should never degrade to a no-op.
 */
export const ReplayMask = ReplayMaskView as ComponentType<ViewProps>;
