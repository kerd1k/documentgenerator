#!/usr/bin/env node

import { DocumentGenerator } from "./DocumentGenerator";
import { getArgument, replaceInFile } from "./utils";

try {
    const destination = getArgument("--destination", null);
    const destinationFileName = getArgument("--destinationFileName", "doc.json");

    const injectFileName = getArgument("--injectFileName", null);
    const injectVariable = getArgument("--injectVariable", null);

    const settings = {
        sourcePath: getArgument("--source", null),
        apiEndpoint: getArgument("--endpoint", "/api"),
        // savePath: destination,
        // savePathFileName: destinationFileName,
    };

    const documentGenerator = new DocumentGenerator(settings);

    if (destination && destinationFileName) {
        documentGenerator.saveDocumentation(destination, destinationFileName);
    }

    if (injectFileName && injectVariable) {
        replaceInFile(injectFileName, `${injectVariable}`, documentGenerator.getDocumentationString());
    }

    // console.log(documentGenerator.getDocumentation(true));
} catch (error) {
    console.error(`Error: ${error}`);
}

// console.log(`Welcome to The Matrix, Neo!`);
