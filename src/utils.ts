import { error } from "node:console";
import { lstatSync, PathLike } from "node:fs";

export const isDirectory = (path: PathLike) => (lstatSync(path) ? lstatSync(path).isDirectory() : false);

export const getArgument = (name: string, defaultValue: string | null = null): string | null | never => {
    let returnValue = defaultValue;

    process.argv.slice(2).forEach((arg) => {
        if (arg.indexOf(name) !== -1) {
            if (arg.indexOf("=") !== -1) {
                returnValue = arg.split("=")[1].trim();
            } else {
                throw Error("Error in providing command line argument");
            }
        }
    });

    return returnValue;
};
