
  import { defineConfig } from 'vite';
  import react from '@vitejs/plugin-react-swc';
  import path from 'path';

  export default defineConfig({
    plugins: [react()],
    resolve: {
      extensions: ['.js', '.jsx', '.ts', '.tsx', '.json'],
      alias: {
        '@jsr/supabase__supabase-js@2.49.8': '@jsr/supabase__supabase-js',
        '@': path.resolve(__dirname, './src'),
      },
    },
    build: {
      // use a slightly narrower target so esbuild on some hosts (Vercel, old Node) is compatible
      target: 'es2020',
      outDir: 'build'
    },
    server: {
      port: 3000,
      open: true,
    },
  });