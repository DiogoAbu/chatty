export default function getNormalizedSize(
  dimensions: { width?: number | null; height?: number | null },
  window: { winWidth: number; winHeight: number; isLandscape: boolean },
): {
  aspectRatio?: number;
  width?: number;
  height?: number;
} {
  if (!dimensions.width || !dimensions.height) {
    return { width: dimensions.width!, height: dimensions.height!, aspectRatio: undefined };
  }

  // Window is landscape but media is portrait
  if (window.isLandscape && dimensions.width < dimensions.height) {
    const aspectRatio = dimensions.height / dimensions.width;

    const height = Math.min(dimensions.height, window.winHeight);
    const width = height / aspectRatio;

    return { width, height, aspectRatio };
  }

  const aspectRatio = dimensions.width / dimensions.height;

  const width = Math.min(dimensions.width, window.winWidth);
  const height = width / aspectRatio;

  return { width, height, aspectRatio };
}
