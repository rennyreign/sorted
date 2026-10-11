// Type shims for runtime-optional dependencies that are not installed
// in this environment. The Anthropic SDK is only loaded lazily when a
// real (non-dry-run, non-injected) generation call executes.
declare module '@anthropic-ai/sdk' {
  const Anthropic: any;
  export default Anthropic;
}
declare module 'dotenv/config';
