import { Dimensions, PixelRatio } from 'react-native';

export interface Transformations {
  width?: number;
  height?: number;
  quality?: number;
  cropping?:
    | 'scale'
    | 'fit'
    | 'limit'
    | 'mfit'
    | 'fill'
    | 'lfill'
    | 'pad'
    | 'lpad'
    | 'mpad'
    | 'fill_pad'
    | 'crop'
    | 'thumb';

  pixelRatio?: number;
}

type TransformationTuple = [keyof Transformations, any];

const screenSize = Dimensions.get('screen');
const defaultTransformations: Transformations = {
  width: screenSize.width > screenSize.height ? Math.floor(screenSize.height) : Math.floor(screenSize.width),
  quality: 80,
  cropping: 'limit',
};

const findString = '/upload/';

export default function transformUri(uri?: string, transformations?: Transformations): string | undefined {
  if (!uri) {
    return uri;
  }

  const findIndex = uri.indexOf(findString) + findString.length;
  if (findIndex < 0) {
    return uri;
  }

  const transforms = {
    ...defaultTransformations,
    ...transformations,
  };

  const left = uri.substring(0, findIndex);
  const right = uri.substring(findIndex);

  const transformed = Object.entries(transforms)
    .map((each) => {
      const [key, value] = each as TransformationTuple;
      if (key === 'width') {
        return width(value);
      }
      if (key === 'height') {
        return height(value);
      }
      if (key === 'quality') {
        return quality(value);
      }
      if (key === 'cropping') {
        return cropping(value);
      }
      return '';
    })
    .filter((e) => !!e);

  let newUri = `${left}`;

  if (transformed.length) {
    newUri += `${transformed.join(',')}/`;
  }

  newUri += `${pixelRatio(transformations?.pixelRatio ?? PixelRatio.get())}/`;

  newUri += `${right}`;

  return newUri;
}

function width(value: Transformations['width']) {
  return value ? `w_${value}` : '';
}

function height(value: Transformations['height']) {
  return value ? `h_${value}` : '';
}

function quality(value: Transformations['quality']) {
  return value ? `q_${value}` : '';
}

function cropping(value: Transformations['cropping']) {
  return value ? `c_${value}` : '';
}

function pixelRatio(value: Transformations['pixelRatio']) {
  return value ? `dpr_${value}` : '';
}
