export type LibraryState = "alpha" | "beta" | "stable";

export interface YokiConfiguration {
    debug_mode: boolean;
}

export const defaultConfigurationOptions = {
    debug_mode: false
} as YokiConfiguration;