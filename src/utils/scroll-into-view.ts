import { findNodeHandle, ScrollView } from 'react-native';

/**
 * Use SrollView method to scroll component into view
 */
export default function scrollIntoView(
  ref: React.RefObject<any>,
  scrollRef: React.RefObject<ScrollView>,
  animated?: boolean,
) {
  if (scrollRef && scrollRef.current) {
    requestAnimationFrame(() => {
      ref.current?.measureLayout?.(
        findNodeHandle(scrollRef.current)!,
        (_: number, y: number) => {
          scrollRef.current!.scrollTo({
            x: 0,
            y,
            animated: animated === false ? false : true,
          });
        },
        () => null,
      );
    });
  }
}

/**
 * Returns a function that will scroll the component into view, if valid.
 * @param ref Reference to a component
 * @param scrollRef Reference to the scroll view
 * @param animated Whether the scroll action should be animated
 */
export function focusNext(
  ref: React.RefObject<any>,
  scrollRef: React.RefObject<ScrollView>,
  animated?: boolean,
) {
  return () => {
    if (ref?.current) {
      scrollIntoView(ref, scrollRef, animated);
      ref.current?.focus?.();
    }
  };
}
