/** @type {import('next').NextConfig} */
const withTM = require("next-transpile-modules")(["react-draft-wysiwyg"]);

const nextConfig = withTM({
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "arenq.s3.ap-south-1.amazonaws.com",
      },
      {
        protocol: "https",
        hostname: "arenq.s3.amazonaws.com",
      },
    ],
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
});

module.exports = nextConfig;
