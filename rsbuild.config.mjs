import { defineConfig } from '@rsbuild/core';
import { pluginReact } from '@rsbuild/plugin-react';

export default defineConfig({
  plugins: [pluginReact()],
  html: {
    template: './public/index.html',
  },
  output: {
    filenameHash: false,
    legalComments: 'none',
    distPath: {
      root:'dist',
    },
    copy: [{ from: './manifest.json', to: 'manifest.json' }]
  },
});
