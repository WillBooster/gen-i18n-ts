import { Plugin } from "rollup";

export interface Options {
    /**
     * Modules names to keep import expressions.
     */
    moduleNames: string[];
}

export declare function keepImport(options?: Options): Plugin;
