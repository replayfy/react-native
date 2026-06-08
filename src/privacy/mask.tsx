import React, { useCallback, useRef } from 'react';
import { findNodeHandle, View, type ViewProps } from 'react-native';
import { getNative } from '../native';

/**
 * Mask everything rendered inside this component in playback. Reuses the
 * native SDK's existing privacy registry via the React node tag — no
 * bespoke native wrapper component. Safe to nest; safe before the native
 * module is available (no-ops until it is).
 */
export function ReplayMask({ children, ...rest }: ViewProps) {
  const taggedRef = useRef<number | null>(null);

  const handleRef = useCallback((node: View | null) => {
    const native = getNative();
    if (!native) return;
    if (node) {
      const tag = findNodeHandle(node);
      if (tag != null) {
        taggedRef.current = tag;
        native.maskNode(tag);
      }
    } else if (taggedRef.current != null) {
      native.unmaskNode(taggedRef.current);
      taggedRef.current = null;
    }
  }, []);

  return (
    <View ref={handleRef} {...rest}>
      {children}
    </View>
  );
}
