import { defineConfig } from '@rsbuild/core';
import { pluginReact } from '@rsbuild/plugin-react';
import { pluginSvgr } from '@rsbuild/plugin-svgr';
export default defineConfig({
  plugins: [pluginReact(), pluginSvgr()],
  source: {
    entry: {
        index: './src/setting/index.tsx',
      }
  },
  html: {
    template: './public/index.html',
  }
});
