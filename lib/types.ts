// deno-lint-ignore-file
export type library_state = "alpha" | "beta" | "stable";

export interface yoki_configuration {
  debug_mode: boolean;
  max_cache_size?: number;
  sweeper?: {
    enabled: boolean;
    settings?: yoki_pool_sweeper<any, any>;
  };
}

export type valid_key_option = string | number;

export interface yoki_pool_sweeper<K, V> {
  /** The filter to determine whether an element should be deleted or not */
  filter: (value: V, key: K, ...args: any[]) => boolean;
  /** The interval in which the sweeper should run */
  interval: number;
}
