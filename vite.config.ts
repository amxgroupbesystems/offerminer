import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import {defineConfig} from 'vite';

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss()],
    // Bundle the local SSR graph so Vercel's native ESM runtime does not
    // attempt to resolve extensionless TypeScript imports at runtime.
    ssr: { noExternal: true },
    resolve: {
      alias: {
        '@': import.meta.dirname,
      },
    },
    server: {
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {
        ignored: ['**/server/data/**', '**/server/data/*.tmp'],
      },
    },
  };
});
