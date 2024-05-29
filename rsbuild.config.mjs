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
    entry: {
        index: './src/index.jsx',
        setting: './src/setting/index.jsx',
        background: './src/background.js',
      }
  },
  html: {
    template: './public/index.html',
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
      js: './', css: './'
    },
    sourceMap: {
      js: 'source-map',
    },
    targets: ['web'],
    copy: [{ from: './manifest.json', to: 'manifest.json' },

    { from: './src/content.js', to: 'content.js' },
    ]
  },
});
