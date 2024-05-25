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
      index: './src/down.js'
    },
  },
  html: {
    inject: 'body',
    template:'./src/down.html'
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
    copy: [{ from: './manifest.json', to: 'manifest.json' },

    { from: './src/content.js', to: 'content.js' },
    ]
  },
});
