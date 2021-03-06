// deno-lint-ignore-file no-explicit-any

/**
 * Code Taken from - https://github.com/AkumaKodo/AkumaKodo/blob/alpha/internal/logger.ts
 */

import { bold, cyan, gray, italic, magenta, red, yellow } from "https://deno.land/std@0.117.0/fmt/colors.ts";
import { yoki_configuration } from "./types.ts";
import { default_configuration_options } from "./utils.ts";

export enum Loglevels {
  Debug,
  Info,
  Warn,
  Error,
  Fatal,
  Table,
}

const prefixes = new Map<Loglevels, string>([
  [Loglevels.Debug, "DEBUG"],
  [Loglevels.Info, "INFO"],
  [Loglevels.Warn, "WARN"],
  [Loglevels.Error, "ERROR"],
  [Loglevels.Fatal, "FATAL"],
  [Loglevels.Table, "TABLE"],
]);

const noColor: (str: string) => string = (msg) => msg;
const colorFunctions = new Map<Loglevels, (str: string) => string>([
  [Loglevels.Debug, gray],
  [Loglevels.Info, cyan],
  [Loglevels.Warn, yellow],
  [Loglevels.Error, (str: string) => red(str)],
  [Loglevels.Fatal, (str: string) => red(bold(italic(str)))],
  [Loglevels.Table, magenta],
]);

interface ll {
  logLevel?: Loglevels;
  name?: string;
}

export function logger({
  logLevel = Loglevels.Info,
  name,
}: ll = {}) {
  function log(level: Loglevels, ...args: any[]) {
    if (level < logLevel) return;

    let color = colorFunctions.get(level);
    if (!color) color = noColor;

    const date = new Date();
    const log = [
      `[${date.toLocaleDateString()} ${date.toLocaleTimeString()}]`,
      color(prefixes.get(level) || "DEBUG"),
      name ? `${name} >` : ">",
      ...args,
    ];

    switch (level) {
      case Loglevels.Debug:
        return console.debug(...log);
      case Loglevels.Info:
        return console.info(...log);
      case Loglevels.Warn:
        return console.warn(...log);
      case Loglevels.Error:
        return console.error(...log);
      case Loglevels.Fatal:
        return console.error(...log);
      case Loglevels.Table:
        return console.table(...log);
      default:
        return console.log(...log);
    }
  }

  function setLevel(level: Loglevels) {
    logLevel = level;
  }

  function debug(...args: any[]) {
    log(Loglevels.Debug, ...args);
  }

  function table(...args: any[]) {
    log(Loglevels.Table, ...args);
  }

  function info(...args: any[]) {
    log(Loglevels.Info, ...args);
  }

  function warn(...args: any[]) {
    log(Loglevels.Warn, ...args);
  }

  function error(...args: any[]) {
    log(Loglevels.Error, ...args);
  }

  function fatal(...args: any[]) {
    log(Loglevels.Fatal, ...args);
  }

  return {
    log,
    setLevel,
    debug,
    info,
    warn,
    error,
    fatal,
    table,
  };
}

export const log = logger;

/**
 * The internal logger for AkumaKomo
 * It can be enabled by the user in the bot config
 * @param level The log level to use
 * @param event The event to log
 * @param message The message to log
 */

export class AkumaKodoLogger {
  private configuration: yoki_configuration | undefined;
  public constructor(config?: yoki_configuration) {
    if (!config) {
      this.configuration = default_configuration_options;
    } else {
      this.configuration = config;
    }
  }
  public log(level: "debug" | "info" | "warn" | "error" | "fatal", event: string, message: string) {
    switch (level) {
      case "debug":
        log({
          logLevel: Loglevels.Debug,
          name: event,
        }).debug(message);
        break;
      case "info":
        log({
          logLevel: Loglevels.Info,
          name: event,
        }).info(message);
        break;
      case "warn":
        log({
          logLevel: Loglevels.Warn,
          name: event,
        }).warn(message);
        break;
      case "error":
        log({
          logLevel: Loglevels.Error,
          name: event,
        }).error(message);
        break;
      case "fatal":
        log({
          logLevel: Loglevels.Fatal,
          name: event,
        }).fatal(message);
        break;
      default:
        log({
          logLevel: Loglevels.Info,
          name: event,
        }).info(message);
        break;
    }
  }
  /**
   * Internal logger class for the framework
   * @param level The log level to use
   * @param event The event to log
   * @param context The context to log
   * @param status The status to log
   */
  public debug(
    level: "debug" | "info" | "warn" | "error" | "fatal" | "table",
    event: string,
    context: any,
    status?: "alpha" | "canary" | "stable" | "beta",
  ) {
    // Check if the user enabled internal logging.
    if (!this.configuration?.debug_mode) return;
    try {
      // Enable the unstable log level
      if (status && status !== "stable") {
        this.log(
          "warn",
          "AkumaKodo Logger",
          `The event ${event.toLowerCase()} is not status ${status.toLowerCase()} ~ Please keep in mind this method may have unsolved bugs.`,
        );
      }
      // check if internal logging is enabled, if not return
      switch (level) {
        case "debug":
          log({
            logLevel: Loglevels.Debug,
            name: `Yoki Internal - ${event.toUpperCase()}`,
          }).debug(context);
          break;
        case "info":
          log({
            logLevel: Loglevels.Info,
            name: `Yoki Internal - ${event.toUpperCase()}`,
          }).info(context);
          break;
        case "warn":
          log({
            logLevel: Loglevels.Warn,
            name: `Yoki Internal - ${event.toUpperCase()}`,
          }).warn(context);
          break;
        case "error":
          log({
            logLevel: Loglevels.Error,
            name: `Yoki Internal - ${event.toUpperCase()}`,
          }).error(context);
          break;
        case "fatal":
          log({
            logLevel: Loglevels.Fatal,
            name: `Yoki Internal - ${event.toUpperCase()}`,
          }).fatal(context);
          break;
        case "table":
          log({
            logLevel: Loglevels.Table,
            name: `Yoki Internal - ${event.toUpperCase()}`,
          }).info(context);
          break;
        default:
          log({
            logLevel: Loglevels.Info,
            name: `Yoki Internal - ${event.toUpperCase()}`,
          }).info(context);
          break;
      }
    } catch (e) {
      log({
        logLevel: Loglevels.Error,
        name: `Yoki Internal - ${event.toUpperCase()}`,
      }).error(e);
    }
  }
}
