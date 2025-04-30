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
  reactStrictMode: false,
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb'
    }
  }
}
export default nextConfig
