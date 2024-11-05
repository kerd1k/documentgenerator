import * as fs from "fs";
import { lstatSync, PathLike } from "node:fs";

export const isDirectory = (path: PathLike) => (lstatSync(path) ? lstatSync(path).isDirectory() : false);

export const getArgument = (name: string, defaultValue: string | null = null): string | null | never => {
    let returnValue = defaultValue;

    process.argv.slice(2).forEach((arg) => {
        // if (arg.indexOf(name) !== -1) {
        if (arg.indexOf(name + "=") === 0) {
            // if (arg.indexOf("=") !== -1) {
            returnValue = arg.split("=")[1].trim();
            // } else {
            // throw new Error("Error in providing command line argument");
            // }
        }
    });

    return returnValue;
};

export const replaceInFile = (filePath: string, searchText: string, replaceText: any) => {
    if (!fs.existsSync(filePath)) {
        throw new Error("Inject file does not exist");
    }

    const data = fs.readFileSync(filePath, "utf-8");

    const updatedData = data.replace(new RegExp(searchText, "g"), replaceText);
    // const updatedData = data.replace(searchText, replaceText);

    fs.writeFileSync(filePath, updatedData, "utf-8");
};

export const copyFile = (sourcePath: string, destinationPath: string) => {
    if (!fs.existsSync(sourcePath)) {
        throw new Error("Copied file does not exist");
    }

    const data = fs.copyFileSync(sourcePath, destinationPath);
};
