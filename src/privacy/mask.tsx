import type { ComponentType } from 'react';
import {
  Platform,
  requireNativeComponent,
  UIManager,
  type ViewProps,
} from 'react-native';

const COMPONENT_NAME = 'ReplayMaskView';

const LINKING_ERROR =
  `The native view "${COMPONENT_NAME}" from 'react-native-replayfy' isn't linked. ` +
  Platform.select({
    ios: "Run 'pod install' in ios/ and rebuild the app.\n",
    default: 'Rebuild the app after installing react-native-replayfy.\n',
  }) +
  '- Make sure you are not using Expo Go.\n';

/**
 * Mask everything rendered inside this component in playback.
 *
 * Backed by a native view (RCTViewManager on iOS, ViewGroupManager on
 * Android) that registers itself with the engine's privacy registry on attach
 * and unregisters on detach — the exact mechanism the native iOS/Android SDKs
 * use. The masked region therefore tracks the live view (scroll / layout) and
 * the screenshotter blurs it and overlays diagonal stripes. Nest freely.
 *
 * Fails loud (throws on render) if the native view isn't linked, rather than
 * silently leaving sensitive content unmasked — privacy should never degrade
 * to a no-op.
 */
export const ReplayMask = (
  UIManager.getViewManagerConfig(COMPONENT_NAME) != null
    ? requireNativeComponent<ViewProps>(COMPONENT_NAME)
    : () => {
        throw new Error(LINKING_ERROR);
      }
) as ComponentType<ViewProps>;
