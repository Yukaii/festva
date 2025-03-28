import { withSerwist } from "@serwist/next";

let userConfig = undefined;
try {
  userConfig = await import('./v0-user-next.config');
} catch (e) {
  // ignore error
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  experimental: {
    webpackBuildWorker: true,
    parallelServerBuildTraces: true,
    parallelServerCompiles: true,
  },
};

function mergeConfig(config, userConf) {
  if (!userConf) {
    return;
  }

  for (const key in userConf) {
    if (
      typeof config[key] === 'object' &&
      !Array.isArray(config[key]) &&
      config[key] !== null
    ) {
      config[key] = {
        ...config[key],
        ...userConf[key],
      };
    } else {
      config[key] = userConf[key];
    }
  }
}

// Merge user config before wrapping with Serwist
mergeConfig(nextConfig, userConfig?.default || userConfig); // Handle both default and direct exports from user config

export default withSerwist({
  swSrc: "app/sw.ts",
  swDest: "public/sw.js",
  // Ensure fallbacks are configured if needed, similar to next-pwa
  // fallbacks: {
  //   document: "/~offline",
  // },
  // Add other Serwist options as needed
})(nextConfig);
