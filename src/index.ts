#!/usr/bin/env node

// import path from "path";
// import fs from "fs";
import { DocumentGenerator } from "./DocumentGenerator";
import { copyFile, getArgument, replaceInFile } from "./utils";

//TODO: get interfaces and types + set to UI
//TODO: Errors parse and add to UI
//TODO: add NodeJS example

try {
    const config = {
        source: getArgument("--source", null),
        endpoint: getArgument("--endpoint", "/api"),
        destination: getArgument("--destination", null),
        inject: getArgument("--inject", null),
        injectVariable: getArgument("--injectVariable", "{{docjson}}"),
        template: getArgument("--template", null),
        templatePath: getArgument("--templatePath", `${__dirname}/template.html`),
        docPath: getArgument("--docPath", null),
    };

    const documentGeneratorConfig = {
        sourcePath: config.source,
        apiEndpoint: config.endpoint,
        docPath: config.docPath,
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

// const projectRoot = path.resolve(__dirname, "../example/api");

// function getAllTSFiles(dir: string): string[] {
//     let results: string[] = [];
//     const list = fs.readdirSync(dir);

//     for (const file of list) {
//         const filePath = path.join(dir, file);
//         const stat = fs.statSync(filePath);

//         if (stat && stat.isDirectory()) {
//             results = results.concat(getAllTSFiles(filePath));
//         } else if (file.endsWith(".ts") || file.endsWith(".tsx")) {
//             results.push(filePath);
//         }
//     }
//     return results;
// }

// function extractTypesAndInterfaces(filePath: string): Record<string, string> {
//     const content = fs.readFileSync(filePath, "utf8");
//     const matches = content.match(/(?:interface|type)\s+[A-Za-z0-9_]+\s*(?:=\s*[^;]+;|\{[^}]*\})/gs) || [];
//     const result: Record<string, string> = {};

//     matches.forEach((match) => {
//         const nameMatch = match.match(/(?:interface|type)\s+([A-Za-z0-9_]+)/);
//         if (nameMatch) {
//             result[nameMatch[1]] = match;
//         }
//     });

//     return result;
// }

// function collectAllTypesAndInterfaces(): Record<string, string> {
//     const tsFiles = getAllTSFiles(projectRoot);
//     let collected: Record<string, string> = {};

//     for (const file of tsFiles) {
//         Object.assign(collected, extractTypesAndInterfaces(file));
//     }

//     return collected;
// }

// const allTypesAndInterfaces = collectAllTypesAndInterfaces();
// console.log(allTypesAndInterfaces);
