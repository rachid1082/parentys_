/** @type {import('next').NextConfig} */
const nextConfig = {
  // ❌ REMOVE this if you have it:
  // output: "export",

  // keep this if you want to ignore TS build errors
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
