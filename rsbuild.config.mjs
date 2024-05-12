import { defineConfig } from '@rsbuild/core';
import { pluginReact } from '@rsbuild/plugin-react';
import { pluginSvgr } from '@rsbuild/plugin-svgr';

export default defineConfig({
  plugins: [pluginReact(), pluginSvgr()],
  html: {
    template: './public/index.html',
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
  
    { from: './src/content.js', to: 'content.js' }
  ]
  },
});
