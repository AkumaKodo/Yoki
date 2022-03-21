export type library_state = "alpha" | "beta" | "stable";

export interface yoki_configuration {
    debug_mode: boolean;
}

export const default_configuration_options = {
    debug_mode: false
} as yoki_configuration;

export type valid_key_option = string | number