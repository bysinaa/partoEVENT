import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const apiUrl = new URL(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3006');

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  outputFileTracingRoot: path.join(__dirname, '../..'),
  images: {
    remotePatterns: [
      { protocol: 'http', hostname: 'localhost', port: '9000' },
      { protocol: 'http', hostname: 'localhost', port: '9002' },
      {
        protocol: apiUrl.protocol.replace(':', ''),
        hostname: apiUrl.hostname,
        port: apiUrl.port,
      },
    ],
  },
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3006',
  },
};

export default nextConfig;
