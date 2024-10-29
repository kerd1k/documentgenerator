#!/usr/bin/env node

import { DocumentGenerator } from "./DocumentGenerator";
import { copyFile, getArgument, replaceInFile } from "./utils";

try {
    const destination = getArgument("--destination", null);
    const injectFile = getArgument("--inject", null);
    const injectVariable = getArgument("--injectVariable", "{{docjson}}");
    const template = getArgument("--template", null);

    const settings = {
        sourcePath: getArgument("--source", null),
        apiEndpoint: getArgument("--endpoint", "/api"),
    };

    const documentGenerator = new DocumentGenerator(settings);

    if (destination) {
        documentGenerator.saveDocumentation(destination);
    }

    if (template) {
        copyFile("./template.html", template);
    }

    if (injectFile && injectVariable) {
        replaceInFile(injectFile, `${injectVariable}`, documentGenerator.getDocumentationString());
    }

    // console.log(documentGenerator.getDocumentation(true));
} catch (error) {
    console.error(`Error: ${error}`);
}

// console.log(`Welcome to The Matrix, Neo!`);
