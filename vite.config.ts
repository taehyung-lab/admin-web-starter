// 파일 책임: 개발 서버·빌드 설정. 파일 route 생성(TanStack Router), React, Tailwind 4를 연결한다.
import tailwindcss from '@tailwindcss/vite';
import { tanstackRouter } from '@tanstack/router-plugin/vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [
    tanstackRouter({ target: 'react', autoCodeSplitting: true, routeFileIgnorePattern: '\\.test\\.' }),
    react(),
    tailwindcss(),
  ],
  resolve: { alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) } },
});
