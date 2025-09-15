/** @type {import('next').NextConfig} */

// Cloud Run 向けの Next.js 設定
const nextConfig = {
  // === Cloud Run 最適化設定 ===
  
  // Standalone モード（Cloud Run 推奨）
  output: 'standalone',
  
  // 圧縮有効化（Cloud Run のネットワーク最適化）
  compress: true,
  
  // セキュリティヘッダーの無効化（Cloud Run で管理）
  poweredByHeader: false,
  
  // === パフォーマンス最適化 ===
  
  // 実験的機能の有効化
  experimental: {
    // サーバーコンポーネントの最適化
    serverComponentsExternalPackages: ['@google-cloud/bigquery'],
    
    // メモリ使用量の最適化
    optimizePackageImports: ['@mantine/core', '@mantine/hooks'],
  },
  
  // === 画像最適化設定 ===
  images: {
    // Cloud Run でサポートされる画像形式
    formats: ['image/webp', 'image/avif'],
    
    // デバイスサイズの最適化
    deviceSizes: [640, 750, 828, 1080, 1200],
    imageSizes: [16, 32, 48, 64, 96, 128, 256],
    
    // 外部画像ドメインの許可（BigQuery から取得する画像URL用）
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'storage.googleapis.com',
        pathname: '/sakamichipenlightquiz/**',
      },
      {
        protocol: 'https', 
        hostname: 'lh3.googleusercontent.com',
        pathname: '/**',
      }
    ],
    
    // 画像最適化の設定
    minimumCacheTTL: 60 * 60 * 24 * 7, // 1週間
    dangerouslyAllowSVG: false,
  },
  
  // === webpack 設定 ===
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    // Cloud Run での最適化
    if (!dev && !isServer) {
      // バンドルサイズの最適化
      config.optimization.splitChunks.cacheGroups = {
        ...config.optimization.splitChunks.cacheGroups,
        // Mantine UI の分離
        mantine: {
          test: /[\\/]node_modules[\\/]@mantine[\\/]/,
          name: 'mantine',
          chunks: 'all',
          priority: 10,
        },
        // BigQuery クライアントの分離
        bigquery: {
          test: /[\\/]node_modules[\\/]@google-cloud[\\/]/,
          name: 'bigquery',
          chunks: 'all',
          priority: 10,
        },
      };
    }
    
    // BigQuery クライアントの外部化（サーバーサイドのみ）
    if (isServer) {
      config.externals = [
        ...config.externals,
        '@google-cloud/bigquery',
      ];
    }
    
    return config;
  },
  
  // === 環境変数設定 ===
  env: {
    // Cloud Run 環境での設定
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },
  
  // === PWA 設定（next-pwa 使用時） ===
  ...(process.env.NODE_ENV === 'production' && {
    // 本番環境でのみPWA機能を有効化
    pwa: {
      dest: 'public',
      disable: false,
      register: true,
      skipWaiting: true,
      runtimeCaching: [
        // BigQuery API レスポンスのキャッシュ
        {
          urlPattern: /^https:\/\/bigquery\.googleapis\.com\/.*/i,
          handler: 'CacheFirst',
          options: {
            cacheName: 'bigquery-api',
            expiration: {
              maxEntries: 50,
              maxAgeSeconds: 60 * 60 * 24, // 24時間
            },
          },
        },
        // 画像のキャッシュ
        {
          urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp|avif)$/i,
          handler: 'CacheFirst',
          options: {
            cacheName: 'images',
            expiration: {
              maxEntries: 100,
              maxAgeSeconds: 60 * 60 * 24 * 7, // 7日間
            },
          },
        },
      ],
    },
  }),
  
  // === ヘッダー設定 ===
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          // セキュリティヘッダー
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
          // Cloud Run でのキャッシュ最適化
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/api/(.*)',
        headers: [
          // API エンドポイントのキャッシュ設定
          {
            key: 'Cache-Control',
            value: 'public, max-age=300, s-maxage=300', // 5分間キャッシュ
          },
        ],
      },
    ];
  },
  
  // === リダイレクト設定 ===
  async redirects() {
    return [
      // 必要に応じてリダイレクト設定を追加
    ];
  },
  
  // === リライト設定 ===
  async rewrites() {
    return [
      // ヘルスチェックエンドポイント
      {
        source: '/health',
        destination: '/api/health',
      },
      {
        source: '/ready',
        destination: '/api/ready',
      },
    ];
  },
};

// PWA 設定の適用（next-pwa を使用する場合）
let configWithPWA = nextConfig;

if (process.env.NODE_ENV === 'production') {
  try {
    const withPWA = require('next-pwa').default;
    configWithPWA = withPWA(nextConfig);
  } catch (error) {
    console.warn('next-pwa is not installed, skipping PWA configuration');
  }
}

export default configWithPWA;