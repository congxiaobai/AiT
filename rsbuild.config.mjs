import { defineConfig } from '@rsbuild/core';
import { pluginReact } from '@rsbuild/plugin-react';
import { pluginSvgr } from '@rsbuild/plugin-svgr';
import path from 'node:path';
const templates = {
  index: './public/index.html',
  setting: './public/setting.html',
}
export default defineConfig({
  plugins: [pluginReact(), pluginSvgr()],
  source: {
    entry({ target }) {
      if (target === 'web') {
        return {
          index: './src/index.jsx',
          setting: './src/setting/index.jsx',
        };
      }
      if (target === 'node') {
        return {
          background: './src/background.js',
        };
      }
    },
  },
  tools: {
    htmlPlugin: false,

  },
  performance: {
    chunkSplit: {
      strategy: 'all-in-one',
    },
  },
  output: {
    filenameHash: false,
    legalComments: 'none',
    distPath: {
      js: './', css: './', server: './',
    },
    sourceMap: {
      js: 'source-map',
    },
    targets: ['web', 'node'],
    copy: [{ from: './manifest.json', to: 'manifest.json' },

    { from: './src/content.js', to: 'content.js' },
    ]
  },
});
