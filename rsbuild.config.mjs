import { defineConfig } from '@rsbuild/core';
import { pluginReact } from '@rsbuild/plugin-react';
import { pluginSvgr } from '@rsbuild/plugin-svgr';
export default defineConfig({
  plugins: [pluginReact(), pluginSvgr()],
  source: {
    entry: {
      index: './src/popup/index.tsx',
      setting: './src/setting/index.tsx',
      background: './src/background/background.ts',
      content: './src/content/index.tsx',
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
    { from: './src/content/content.css', to: 'content.css' },
    ]
  },
});
