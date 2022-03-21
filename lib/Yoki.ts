import { AkumaKodoLogger } from "./logger.ts";
import { defaultConfigurationOptions, LibraryState, YokiConfiguration } from "./types.ts";

export class Yoki {
    public static readonly version = "0.1.0";
    public static readonly lib_state: LibraryState = "alpha";
    private logger: AkumaKodoLogger
    public configuration: YokiConfiguration

    public constructor(config?: YokiConfiguration) {
        if (config) {
            this.configuration = config;
        } else {
            this.configuration = defaultConfigurationOptions
        }

        this.logger = new AkumaKodoLogger(this.configuration);

        this.logger.debug("info", "Yoki Constructor", "Yoki has been initialized!");
    }

    /**
     * @returns {string} The version of the library.
     */
    public static get getVersion(): string {
        return Yoki.version;
    }

    /**
     * @returns {string} The state of the library.
     */
    public static get getLibState(): string {
        return Yoki.lib_state;
    }
}