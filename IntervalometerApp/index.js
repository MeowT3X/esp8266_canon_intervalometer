/**
 * @format
 */

import React from 'react';
import {AppRegistry} from 'react-native';
import App from './src/App';
import {name as appName} from './app.json';
import {ThemeProvider} from './src/components/ThemeProvider';

const Main = () => (
  <>
    <ThemeProvider>
      <App />
    </ThemeProvider>
  </>
);

AppRegistry.registerComponent(appName, () => Main);
