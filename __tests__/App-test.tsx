import 'react-native';

import React from 'react';

import renderer, { act } from 'react-test-renderer';

import App from '../src/App';

it('renders correctly', async () => {
  // eslint-disable-next-line @typescript-eslint/require-await
  await act(async () => {
    renderer.create(<App />);
  });
});
