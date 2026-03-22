/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    appDir: true,
    typedRoutes: true
  },
  output: "standalone",
  transpilePackages: ["@amundson/projections", "@amundson/provenance"]
};

export default nextConfig;
