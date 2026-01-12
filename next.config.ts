import type { NextConfig } from "next";

// Increase max event listeners to prevent MaxListenersExceededWarning
require('events').EventEmitter.defaultMaxListeners = 20;

const nextConfig: NextConfig = {
  /* config options here */
  productionBrowserSourceMaps: false,
};

export default nextConfig;
// Enable calling `getCloudflareContext()` in `next dev`.
// See https://opennext.js.org/cloudflare/bindings#local-access-to-bindings.
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";
initOpenNextCloudflareForDev();
