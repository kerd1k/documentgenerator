#!/usr/bin/env node

// import { DocumentGenerator } from "./DocumentGenerator";

//TODO: parse args + default params
// const sourcePath = "";
// const apiEndpoint = "";
// const savePath = "";
// const savePathFileName = "";

// new DocumentGenerator({
//     sourcePath,
//     apiEndpoint,
//     savePath,
//     savePathFileName,
// });

// const args = process.argv;
const [, , ...args] = process.argv;

console.log(`Welcome to The Matrix, Neo! ${args}`);
