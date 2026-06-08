const path = require('path');
const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');

// Watch the parent package so edits to ../src|lib are picked up, and pin
// react / react-native to the example's copies (the linked parent has its
// own, which would otherwise double-load).
const root = path.resolve(__dirname, '..');

const config = {
  watchFolders: [root],
  resolver: {
    extraNodeModules: {
      react: path.resolve(__dirname, 'node_modules/react'),
      'react-native': path.resolve(__dirname, 'node_modules/react-native'),
    },
  },
};

module.exports = mergeConfig(getDefaultConfig(__dirname), config);
