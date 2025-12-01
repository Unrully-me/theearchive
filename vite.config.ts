
  import { defineConfig } from 'vite';
  import react from '@vitejs/plugin-react-swc';
  import path from 'path';

  export default defineConfig({
    plugins: [react()],
    resolve: {
      extensions: ['.js', '.jsx', '.ts', '.tsx', '.json'],
      alias: {
        '@supabase/supabase-js@2': '@supabase/supabase-js',
        '@jsr/supabase__supabase-js@2.49.8': '@jsr/supabase__supabase-js',
        '@': path.resolve(__dirname, './src'),
      },
    },
    build: {
      // Target a modern but widely supported ES version for mobile browsers.
      // 'esnext' can emit syntax (optional chaining, nullish coalescing, etc.)
      // that older mobile browsers don't understand and causes blank screens.
      target: 'es2018',
      outDir: 'build',
    },
    server: {
      port: 3000,
      open: true,
    },
  });