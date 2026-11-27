import react from '@vitejs/plugin-react';
import { readFileSync } from 'node:fs';
import { defineConfig, loadEnv } from 'vite';

const { version } = JSON.parse(readFileSync(new URL('./package.json', import.meta.url), 'utf8')) as { version: string };

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const apiTarget = env.VITE_API_PROXY_TARGET || 'https://localhost:44340';
  // La API local usa el certificado de desarrollo de ASP.NET (autofirmado): secure: false.
  const proxy = { target: apiTarget, changeOrigin: true, secure: false };

  return {
    plugins: [react()],
    define: {
      __APP_VERSION__: JSON.stringify(version),
    },
    server: {
      proxy: {
        '/simaveh': proxy,
        '/version': proxy,
      },
    },
  };
});
