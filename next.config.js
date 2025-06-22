/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
    images: {
    domains: [
      'scontent.cdninstagram.com',
      'scontent-nrt1-1.cdninstagram.com',
      'scontent-nrt2-2.cdninstagram.com',
      'scontent-iad3-1.cdninstagram.com',
      'scontent-nrt1-1.cdninstagram.com',
      'scontent-lax3-2.cdninstagram.com',
      'scontent.xx.fbcdn.net',
      'instagram.com',
    ],
  },
}

module.exports = nextConfig
