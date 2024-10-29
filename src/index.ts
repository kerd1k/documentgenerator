#!/usr/bin/env node

import { DocumentGenerator } from "./DocumentGenerator";
import { getArgument } from "./utils";

// const [, , ...args] = process.argv;

try {
    const settings = {
        sourcePath: getArgument("--source", null),
        apiEndpoint: getArgument("--endpoint", "/api"),
        savePath: getArgument("--destination", "./"),
        savePathFileName: getArgument("--destination", "doc.json"),
    };

    // console.log(settings);

    const documentGenerator = new DocumentGenerator(settings);

    // this.saveDocumentation();

    console.log(documentGenerator.getDocumentation(true));
} catch (error) {
    console.error(`Error: ${error}`);
}

console.log(`Welcome to The Matrix, Neo!`);
