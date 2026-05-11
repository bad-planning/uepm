// @ts-check
import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import react from '@astrojs/react';

// https://astro.build/config
export default defineConfig({
  integrations: [
    tailwind(),
    react()
  ],
  output: 'static',
  build: {
    assets: 'assets',
    // Enable asset optimization
    assetsPrefix: process.env.NODE_ENV === 'production' ? '/assets/' : undefined,
    // Inline small assets
    inlineStylesheets: 'auto',
  },
  // Performance optimizations
  compressHTML: true,
  // Image optimization
  image: {
    // Enable responsive images
    remotePatterns: [{ protocol: "https" }],
    // Optimize image formats
    service: {
      entrypoint: 'astro/assets/services/sharp',
      config: {
        limitInputPixels: false,
      }
    }
  },
  // Prefetch configuration
  prefetch: {
    prefetchAll: true,
    defaultStrategy: 'viewport'
  },
  vite: {
    optimizeDeps: {
      include: ['react', 'react-dom', 'lucide-react']
    },
    build: {
      // Enable CSS code splitting
      cssCodeSplit: true,
      // Optimize chunks
      rollupOptions: {
        output: {
          // Optimize chunk splitting
          manualChunks: {
            'vendor': ['react', 'react-dom'],
            'icons': ['lucide-react'],
            'utils': ['shiki']
          },
          // Optimize asset naming
          assetFileNames: (assetInfo) => {
            const info = assetInfo.name.split('.');
            const ext = info[info.length - 1];
            if (/\.(css)$/.test(assetInfo.name)) {
              return `css/[name]-[hash].${ext}`;
            }
            if (/\.(png|jpe?g|svg|gif|tiff|bmp|ico|webp|avif)$/i.test(assetInfo.name)) {
              return `images/[name]-[hash].${ext}`;
            }
            if (/\.(woff2?|eot|ttf|otf)$/i.test(assetInfo.name)) {
              return `fonts/[name]-[hash].${ext}`;
            }
            return `assets/[name]-[hash].${ext}`;
          },
          chunkFileNames: 'js/[name]-[hash].js',
          entryFileNames: 'js/[name]-[hash].js'
        }
      },
      // Minification options
      minify: 'terser',
      terserOptions: {
        compress: {
          drop_console: process.env.NODE_ENV === 'production',
          drop_debugger: process.env.NODE_ENV === 'production',
        }
      }
    }
  }
});
