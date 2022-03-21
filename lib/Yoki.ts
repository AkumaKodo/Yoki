// deno-lint-ignore-file
import { AkumaKodoLogger } from "./logger.ts";
import { default_configuration_options, library_state, valid_key_option, yoki_configuration } from "./types.ts";

export class Yoki {
    /** Lib version */
    public static readonly version = "0.1.0";
    /** Enables some functions if state is "x" */
    public static readonly lib_state: library_state = "alpha";
    /** Internal logger if debug mode is set to true */
    private static logger: AkumaKodoLogger
    /** The settings for the lib */
    public configuration: yoki_configuration
    /** The cache pool */
    private static pool: Map<any, any>

    /**
     * Lib options
     * @param config The configuration for the library.
     */
    public constructor(config?: yoki_configuration) {
        if (config) {
            this.configuration = config;
        } else {
            this.configuration = default_configuration_options
            Yoki.logger.debug("warn", "Yoki.constructor", "No configuration options were provided, using default options!");
        }
        // init
        Yoki.pool = new Map();
        Yoki.logger = new AkumaKodoLogger(this.configuration);

        Yoki.logger.debug("info", "Yoki.Constructor", "Yoki has been initialized!");
    }

    /**
     * Deletes a key from the cache pool.
     * @param key The key to delete from the pool
     * @returns {boolean} Returns true if the key was deleted, false if it wasn't
     */
    public delete(key: valid_key_option): boolean {
        Yoki.logger.debug("info", "Yoki.delete", `Key: ${key}`);
        return Yoki.pool.delete(key);
    }

    /**
     *  Clears the entire cache pool.
     * @returns {void} void
     */
    public clear(): void {
        Yoki.logger.debug("info", "Yoki.clear", "Pool has been cleared!");
        return Yoki.pool.clear()
    }

    /**
     * @Returns {number} The size of the cache pool.
     */
    public get size(): number {
        Yoki.logger.debug("info", "Yoki.size", "Pool size: " + Yoki.pool.size);
        return Yoki.pool.size ?? 0;
    }

    /**
     * @returns {string} The version of the library.
     */
    public get getVersion(): string {
        Yoki.logger.debug("info", "Yoki.getVersion", `Version: ${Yoki.version}`);
        return Yoki.version;
    }

    /**
     * @returns {string} The state of the library.
     */
    public get getLibState(): string {
        Yoki.logger.debug("info", "Yoki.getLibState", `State: ${Yoki.lib_state}`);
        return Yoki.lib_state;
    }
}