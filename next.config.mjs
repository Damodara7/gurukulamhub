/** @type {import('next').NextConfig} */

const nextConfig = {
  staticPageGenerationTimeout: 180,
  transpilePackages: ['mui-file-input'],
  images: {
    domains: ['squizme-quiz.s3.ap-south-1.amazonaws.com'] // Add your S3 bucket domain here
  },
  basePath: process.env.BASEPATH,
  redirects: async () => {
    return [
      {
        source: '/',
        destination: '/en',
        permanent: true,
        locale: false
      }
    ]
  },
  allowedDevOrigins: [
    'http://192.168.31.199:3000',
    'http://192.168.31.199',
    'https://192.168.31.199:3000',
    'https://192.168.31.199',
    'http://localhost:3000',
    'http://172.17.27.250:3000',
    'http://172.17.27.250',
    'http://ec2-13-51-204-221.eu-north-1.compute.amazonaws.com:3000',
    'https://gurukulamhub-production.up.railway.app',
    'https://gurukulamhub.up.railway.app',
    'https://gurukulamhub.com',
    'https://willyard-larue-acquiescingly.ngrok-free.dev',
  ],
  reactStrictMode: false,
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb'
    }
  }
}
export default nextConfig
