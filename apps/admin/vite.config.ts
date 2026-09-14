import crypto from 'node:crypto';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Polyfill crypto.getRandomValues cho các phiên bản Node.js cũ (< Node 19)
try {
  if (typeof (crypto as any).getRandomValues !== 'function') {
    Object.defineProperty(crypto, 'getRandomValues', {
      value: function <T extends ArrayBufferView | null>(array: T): T {
        if (array) {
          crypto.randomFillSync(array as any);
        }
        return array;
      },
      configurable: true,
      writable: true,
    });
  }
} catch {
  (crypto as any).getRandomValues = function <T extends ArrayBufferView | null>(array: T): T {
    if (array) {
      crypto.randomFillSync(array as any);
    }
    return array;
  };
}

if (typeof globalThis.crypto === 'undefined') {
  // @ts-ignore
  globalThis.crypto = (crypto as any).webcrypto || {};
}
if (typeof globalThis.crypto.getRandomValues !== 'function') {
  // @ts-ignore
  globalThis.crypto.getRandomValues = (crypto as any).getRandomValues;
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5174,
    host: true,
    // Proxy API tương đối tránh hard-code URL tuyệt đối
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
      '/uploads': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
});
