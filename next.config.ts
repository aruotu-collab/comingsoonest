import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  // Keep Turbopack rooted in this app (avoids parent-folder lockfile confusion)
  turbopack: {
    root: path.join(__dirname),
  },
};

export default nextConfig;
