/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
    images: {
    domains: [
      'scontent.cdninstagram.com',
      'scontent.xx.fbcdn.net',
      'instagram.com'
    ],
  },
}

module.exports = nextConfig
