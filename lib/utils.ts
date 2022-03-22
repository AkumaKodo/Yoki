import { yoki_configuration } from "./types.ts";

export const default_configuration_options = {
  debug_mode: false,
  max_pool_size: 5_000,
  sweeper: {
    // deno-lint-ignore no-explicit-any
    filter: (value: any, key: any, ...args: any[]) => {
      return true;
    },
    interval: 10_000,
  },
  sweeper_mode: false,
} as yoki_configuration;
