/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [
      'images.unsplash.com',
      'randomuser.me',
      'res.cloudinary.com',
      'localhost'
    ],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        pathname: '/**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3000',
        pathname: '/**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3001',
        pathname: '/**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3002',
        pathname: '/**',
      }
    ],
    unoptimized: true, // Allow local SVGs to be served without optimization
    dangerouslyAllowSVG: true, // Allow SVGs to be served
    contentSecurityPolicy: "script-src 'none'; frame-src 'none'", // Required for SVGs
  },
  webpack: (config, { isServer }) => {
    // Add a rule to handle the realtime client
    config.module.rules.push({
      test: /\.m?js$/,
      include: /node_modules\/@supabase\/realtime-js/,
      use: {
        loader: 'babel-loader',
        options: {
          presets: ['@babel/preset-env'],
          plugins: ['@babel/plugin-transform-runtime']
        }
      }
    })

    return config
  },
  // Disable static generation for dynamic routes
  output: 'standalone',
  experimental: {
    serverComponentsExternalPackages: ['@supabase/supabase-js'],
  }
}

module.exports = nextConfig