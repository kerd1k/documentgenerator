#!/usr/bin/env node

import { DocumentGenerator } from "./DocumentGenerator";
import { copyFile, getArgument, replaceInFile } from "./utils";

try {
    const config = {
        source: getArgument("--source", null),
        endpoint: getArgument("--endpoint", "/api"),
        destination: getArgument("--destination", null),
        inject: getArgument("--inject", null),
        injectVariable: getArgument("--injectVariable", "{{docjson}}"),
        template: getArgument("--template", null),
        templatePath: getArgument("--templatePath", `${__dirname}/template.html`),
    };

    const documentGeneratorConfig = {
        sourcePath: config.source,
        apiEndpoint: config.endpoint,
    };

    const documentGenerator = new DocumentGenerator(documentGeneratorConfig);

    if (config.destination) {
        documentGenerator.saveDocumentation(config.destination);
    }

    if (config.template && config.templatePath) {
        copyFile(config.templatePath, config.template);
    }

    if (config.inject && config.injectVariable) {
        replaceInFile(config.inject, `${config.injectVariable}`, documentGenerator.getDocumentationString());
    }
} catch (error) {
    console.error(`Error: ${error}`);
}

// console.log(`Welcome to The Matrix, Neo!`);
