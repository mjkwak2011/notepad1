import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack(config) {
    config.resolve.alias = {
      ...config.resolve.alias,
      // tsconfig @/ alias가 Render 환경에서 누락되는 경우를 방지
      '@/': path.resolve(__dirname) + '/',
    };
    return config;
  },
};

export default nextConfig;
