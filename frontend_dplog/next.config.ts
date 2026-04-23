import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  // [보안] 프로덕션 빌드 시 브라우저 소스맵 완전 차단 (역공학 방지)
  productionBrowserSourceMaps: false,
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'assets.aceternity.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        pathname: '/**',
      }
    ],
  },
  webpack: (config, { dev, isServer }) => {
    // [보안] 개발 환경이 아닐 때 난독화 극대화 및 로그 삭제
    if (!dev && !isServer) {
      config.optimization.minimize = true;
      if (config.optimization.minimizer && config.optimization.minimizer.length > 0) {
        const terserPlugin = config.optimization.minimizer[0];
        if (terserPlugin && terserPlugin.options && terserPlugin.options.terserOptions) {
          terserPlugin.options.terserOptions.compress = {
            ...terserPlugin.options.terserOptions.compress,
            drop_console: true,    // console.log 흔적 전부 지우기
            drop_debugger: true,   // debugger 코드 차단
          };
        }
      }
    }
    return config;
  },
};

export default nextConfig;
