import withSerwistPlugin from "@serwist/next";

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
mergeConfig(nextConfig, userConfig?.default || userConfig);

export default withSerwistPlugin({
  swDest: "public/sw.js",
  swSrc: "app/sw.ts",
  disable: process.env.NODE_ENV === 'development',
})(nextConfig);
