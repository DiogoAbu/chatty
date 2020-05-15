/* eslint-disable no-underscore-dangle */
export default function getChildrenIds(children: any[], maxDepth = 4): number[] {
  let current = 0;
  return children
    .map((each: any) => {
      current++;
      if (each._children?.length && current <= maxDepth) {
        return [each._nativeTag, ...(getChildrenIds(each._children) || [])];
      }
      return [each._nativeTag];
    })
    .flat(current);
}
