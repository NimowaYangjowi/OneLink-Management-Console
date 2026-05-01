import type { NextConfig } from "next";
import { codeInspectorPlugin } from "code-inspector-plugin";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  turbopack: {
    rules: codeInspectorPlugin({
      bundler: "turbopack",
    }),
  },
};

export default nextConfig;
