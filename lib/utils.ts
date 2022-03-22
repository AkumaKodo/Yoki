import { yoki_configuration } from "./types.ts";

export const default_configuration_options = {
  debug_mode: false,
  max_pool_size: 5_000,
  sweeper: {
    enabled: false,
  },
} as yoki_configuration;
