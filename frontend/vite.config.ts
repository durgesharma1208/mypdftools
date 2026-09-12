import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

/**
 * Dev/preview servers bind to 0.0.0.0 and accept proxied hosts so the app can
 * be previewed from a container or tunnel. `VITE_API_URL` only affects runtime
 * behaviour; the proxy below is what makes same-origin `/api` calls work.
 */
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const proxyTarget = env.VITE_DEV_PROXY_TARGET || 'http://localhost:8000';
  const configuredHosts = (env.VITE_DEV_ALLOWED_HOSTS || '')
    .split(',')
    .map((host) => host.trim())
    .filter(Boolean);
  // `true` disables the host check so tunnels and container previews work in
  // development. Set VITE_DEV_ALLOWED_HOSTS to restrict it.
  const allowedHosts: true | string[] = configuredHosts.length > 0 ? configuredHosts : true;

  const server = {
    host: true,
    port: Number(env.VITE_DEV_PORT || 5173),
    strictPort: false,
    allowedHosts,
    proxy: {
      '/api': {
        target: proxyTarget,
        changeOrigin: true,
        secure: false,
      },
    },
  };

  return {
    plugins: [...react()],
    server,
    preview: { ...server, port: Number(env.VITE_PREVIEW_PORT || 4173) },
    build: {
      outDir: 'dist',
      target: 'es2020',
      sourcemap: false,
      chunkSizeWarningLimit: 900,
      rollupOptions: {
        output: {
          manualChunks: {
            react: ['react', 'react-dom', 'react-router-dom'],
          },
        },
      },
    },
  };
});
