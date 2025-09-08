/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Warning: This allows production builds to successfully complete even if
    // your project has TypeScript errors.
    ignoreBuildErrors: true,
  },
  // Disable static optimization to avoid suspense issues
  experimental: {
    missingSuspenseWithCSRBailout: false,
  },
  // Force dynamic rendering for all pages
  output: 'standalone',
};

export default nextConfig;
