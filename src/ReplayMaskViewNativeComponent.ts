import type { HostComponent, ViewProps } from 'react-native';
import codegenNativeComponent from 'react-native/Libraries/Utilities/codegenNativeComponent';

/**
 * Codegen spec for the native privacy-mask view.
 *
 * A propless marker view — its only job is to exist in the native view tree so
 * the engine's privacy registry can mask its live bounds (the view registers
 * itself via `Replay.addPrivacyView` on attach). Declaring it through codegen
 * registers a Fabric component descriptor so it resolves under the New
 * Architecture; on the old architecture `codegenNativeComponent` falls back to
 * `requireNativeComponent`, so a single export works on both.
 */
// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface NativeProps extends ViewProps {}

export default codegenNativeComponent<NativeProps>(
  'ReplayMaskView'
) as HostComponent<NativeProps>;
