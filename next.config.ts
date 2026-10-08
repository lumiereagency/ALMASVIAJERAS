import type { NextConfig } from 'next';

const config: NextConfig = {
  output: 'standalone', // imagem Docker enxuta
  poweredByHeader: false,
  reactStrictMode: true,
};

export default config;
