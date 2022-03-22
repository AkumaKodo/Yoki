// deno-lint-ignore-file
import { sealed } from "./decorator/mod.ts";
import { AkumaKodoLogger } from "./logger.ts";
import { library_state, valid_key_option, yoki_configuration, yoki_pool_sweeper } from "./types.ts";
import { default_configuration_options } from "./utils.ts";

@sealed
export class Yoki {
  /** Lib version */
  public static readonly version = "0.1.0";
  /** Enables some functions if state is "x" */
  public static readonly lib_state: library_state = "alpha";
  /** Internal logger if debug mode is set to true */
  private static logger: AkumaKodoLogger;
  /** The settings for the lib */
  public configuration: yoki_configuration;
  /** The cache pool */
  private static pool: Map<any, any>;

  private static maxPoolSize: number;

  private static sweeper: yoki_pool_sweeper<any, any> & { intervalId?: number };

  /**
   * Lib options
   * @param config The configuration for the library.
   */
  public constructor(config?: yoki_configuration) {
    try {
      // init
      this.configuration = default_configuration_options;
      Yoki.pool = new Map();

      if (config) {
        Yoki.logger = new AkumaKodoLogger(config);
        this.configuration = config;
        Yoki.maxPoolSize = this.configuration.max_cache_size! ?? default_configuration_options.max_cache_size;
        if (config.sweeper_mode && config.sweeper) {
          this.createSweeper(config.sweeper);
        } else {
          Yoki.logger = new AkumaKodoLogger(this.configuration);
          Yoki.logger.debug(
            "warn",
            "Yoki.constructor",
            "Sweeper is disabled! It's recommended to enable during production!",
          );
        }
      } else {
        Yoki.logger.debug("warn", "Yoki.constructor", "No configuration options were provided, using default options!");
      }
      Yoki.logger.debug("info", "Yoki.Constructor", "Yoki has been initialized!");
    } catch (e) {
      Yoki.logger.debug("error", "Yoki.constructor", "Failed to initialize Yoki!");
      throw e;
    }
  }

  /**
   * Creates a new cache sweeper for the pool.
   * @param options
   * @returns
   */
  public createSweeper(options: yoki_pool_sweeper<any, any>): number | undefined {
    if (Yoki.sweeper?.intervalId) clearInterval(Yoki.sweeper.intervalId);

    if (this.configuration.sweeper_mode) {
      Yoki.sweeper = options;
      Yoki.logger.debug("info", "Yoki.createSweeper", "Sweeper has been created!");
      Yoki.sweeper.intervalId = setInterval(() => {
        Yoki.pool.forEach((value, key) => {
          if (!Yoki.sweeper.filter(value, key)) return;
          this.delete(key);
          return key;
        });
      }, options.interval);
      return Yoki.sweeper.intervalId;
    }
  }

  /**
   * Deletes the active sweeper interval.
   * @returns {void} void
   */
  public destroySweeper(): void {
    Yoki.logger.debug("info", "Yoki.destroySweeper", "Sweeper has been destroyed!");
    return clearInterval(Yoki.sweeper?.intervalId);
  }

  /**
   * Update the interval in the cache sweeper without creating a new one.
   * @param newInterval
   */
  public updateSweeperInterval(newInterval: number) {
    if (this.configuration.sweeper_mode) {
      Yoki.logger.debug("info", "Yoki.updateSweeperInterval", `New interval: ${newInterval}`);
      this.createSweeper({ filter: Yoki.sweeper.filter, interval: newInterval });
    }
  }

  /**
   * Create a new key in the cache pool.
   * @param key The key to create in the pool
   * @param value The value to create in the pool
   * @returns {any} The value of the key.
   */
  public create(key: valid_key_option, value: any): any {
    Yoki.logger.debug(
      "info",
      "Yoki.create",
      `Key: ${key} | Value: ${value !== typeof Object ? JSON.stringify(value) : value}`,
    );
    Yoki.pool.set(key, value);
    return value;
  }

  /**
   * Check if a key exists in the cache pool.
   * @param key The key to search in the pool
   * @returns {boolean} Returns true if the key exists in the pool, false if it doesn't.
   */
  public exists(key: valid_key_option): boolean {
    Yoki.logger.debug("info", "Yoki.exists", `Key: ${key}`);
    return Yoki.pool.has(key);
  }

  /**
   * Access each key in the cache pool in a for loop.
   * @param callback The callback to run for each key in the pool.
   */
  public forEach(callback?: (value: any, key: any, map: Map<any, any>) => void): void {
    if (callback) {
      Yoki.pool.forEach(callback);
      Yoki.logger.debug("info", "Yoki.forEach", "Pool has been iterated!");
    } else {
      Yoki.logger.debug("info", "Yoki.forEach", "Pool has been iterated!");
      if (Yoki.pool.size > 250) {
        Yoki.logger.debug(
          "warn",
          "Yoki.forEach",
          "Pool size is over 250, this may cause performance issues! Default loop canceled used!",
        );
      } else {
        Yoki.pool.forEach((value, key) => {
          Yoki.logger.debug(
            "info",
            "Yoki.forEach",
            `Key: ${key} | Value: ${value !== typeof Object ? JSON.stringify(value) : value}`,
          );
        });
      }
    }
  }

  /**
   * Gets a key value in the cache pool.
   * @param key The key to find in the pool
   * @returns {any} The value of the key.
   */
  public get(key: valid_key_option): any {
    const value = Yoki.pool.get(key);
    if (value !== undefined) {
      Yoki.logger.debug("info", "Yoki.find", `Value: ${value !== typeof Object ? JSON.stringify(value) : value}`);
      return value;
    } else {
      Yoki.logger.debug("warn", "Yoki.find", `Key: ${key} not found!`);
      return value;
    }
  }

  /**
   * @returns {any} The keys of the cache pool.
   */
  public get findKeys(): IterableIterator<any> {
    Yoki.logger.debug("info", "Yoki.findKeys", "Pool keys: " + Array.from(Yoki.pool.keys()));
    return Yoki.pool.keys();
  }

  /**
   * @returns {any} The values of the cache pool.
   */
  public get findValues(): IterableIterator<any> {
    Yoki.logger.debug("info", "Yoki.findValues", "Pool values: " + JSON.stringify(Array.from(Yoki.pool.values())));
    return Yoki.pool.values();
  }

  public filter(callback: (value: any, key: any) => boolean) {
    const relevant = new Map<any, any>();
    this.forEach((value, key) => {
      if (callback(value, key)) relevant.set(key, value);
    });

    Yoki.logger.debug("info", "Yoki.filter", "Pool filtered: " + JSON.stringify(Array.from(relevant.values())));
    return relevant;
  }

  public map<T>(callback: (value: any, key: any) => T) {
    const results = [];
    for (const key of Yoki.pool.keys()) {
      const value = this.get(key)!;
      results.push(callback(value, key));
    }

    Yoki.logger.debug("info", "Yoki.map", "Pool has been mapped!");
    return results;
  }

  public some(callback: (value: any, key: any) => boolean) {
    for (const key of Yoki.pool.keys()) {
      const value = this.get(key)!;
      if (callback(value, key)) {
        Yoki.logger.debug(
          "info",
          "Yoki.some",
          `Key: ${key} | Value: ${value !== typeof Object ? JSON.stringify(value) : value}`,
        );
        return true;
      }
    }

    Yoki.logger.debug("warn", "Yoki.some", "No keys found!");
    return false;
  }

  public every(callback: (value: any, key: any) => boolean) {
    for (const key of Yoki.pool.keys()) {
      const value = this.get(key)!;
      if (!callback(value, key)) {
        Yoki.logger.debug("warn", "Yoki.every", "Every callback returned false!");
        return false;
      }
    }

    Yoki.logger.debug("info", "Yoki.every", "Every callback returned true!");
    return true;
  }

  public reduce<T>(callback: (accumulator: T, value: any, key: any) => T, initialValue?: T): T {
    let accumulator: T = initialValue!;

    for (const key of Yoki.pool.keys()) {
      const value = this.get(key)!;
      accumulator = callback(accumulator, value, key);
    }

    Yoki.logger.debug("info", "Yoki.reduce", `Accumulator: ${accumulator}`);
    return accumulator;
  }

  /**
   * Find a key or value by a filter function.
   * @param callback The callback to run for each key in the pool.
   */
  public find(callback: (value: any, key: any) => boolean) {
    for (const key of Yoki.pool.keys()) {
      const value = this.get(key)!;
      if (callback(value, key)) {
        Yoki.logger.debug(
          "info",
          "Yoki.find",
          `Key: ${key} | Value: ${value !== typeof Object ? JSON.stringify(value) : value}`,
        );
        return value;
      }
    }
    Yoki.logger.debug("warn", "Yoki.find", "No key found!");
    // If nothing matched
    return;
  }

  /**
   * @returns {Array<any>} An array of values in the cache pool.
   */
  public get array() {
    Yoki.logger.debug("info", "Yoki.array", "Pool values: " + JSON.stringify(Array.from(Yoki.pool.values())));
    return [...Yoki.pool.values()];
  }

  /**
   * @returns The first value of the cache pool.
   */
  public get first() {
    Yoki.logger.debug(
      "info",
      "Yoki.first",
      "Pool values: " + JSON.stringify(Array.from(Yoki.pool.values().next().value)),
    );
    return [Yoki.pool.values().next().value];
  }

  /**
   * @returns The last value of the cache pool.
   */
  public get last() {
    Yoki.logger.debug("info", "Yoki.last", "Pool values: " + [Yoki.pool.values()][this.size - 1]);
    return [Yoki.pool.values()][this.size - 1];
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
  public get clear(): void {
    Yoki.logger.debug("info", "Yoki.clear", "Pool has been cleared!");
    return Yoki.pool.clear();
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
