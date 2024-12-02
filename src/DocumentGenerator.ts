import * as fs from "fs";
import * as path from "path";
import { parse, Spec } from "comment-parser";
import { isDirectory } from "./utils";

declare type DocumentGeneratorConfig = {
    sourcePath: string | null;
    apiEndpoint: string | null;
    // savePath?: string | null;
    // savePathFileName?: string | null;
};

declare type DocumentGeneratorDocumentation = {
    [baseEndpointName: string]: {
        [endPointName: string]: DocumentGeneratorDocumentationEndpoint;
    };
};

declare type DocumentGeneratorDocumentationEndpoint = {
    private: boolean;
    handler: string;
    fullPath: string;
    method: string;
    ignoreInterceptor?: string;

    description?: string;
    parameters?: DocumentGeneratorDocumentationEndpointParameter[];
    headers?: Omit<DocumentGeneratorDocumentationEndpointDefaultParameter, "type">[];
    // returns?: Omit<DocumentGeneratorDocumentationEndpointParameter, "optional" | "default">[];
    returns?: DocumentGeneratorDocumentationEndpointDefaultParameter[];
    example?: string[];
    throws?: DocumentGeneratorDocumentationEndpointDefaultParameter[];
};

declare type DocumentGeneratorDocumentationEndpointDefaultParameter = {
    name: string;
    type: string;
    description: string;
};

declare type DocumentGeneratorDocumentationEndpointParameter = {
    optional?: boolean;
    default?: string;
} & DocumentGeneratorDocumentationEndpointDefaultParameter;

declare type DucumentGeneratorDocumentationEndpointJson = {
    endpoint: string;
    handler: string | { [method: string]: string | { controller: string; ignoreInterceptor?: string } };
    ignoreInterceptor?: string;
};

export class DocumentGenerator {
    private documentation: DocumentGeneratorDocumentation = {};
    private config: DocumentGeneratorConfig;

    constructor(config: DocumentGeneratorConfig) {
        this.config = config;

        this.generateDocumentation();
    }

    private getFiles(sourcePath: string): string[] {
        const files: string[] = [];

        for (const file of fs.readdirSync(sourcePath)) {
            if (isDirectory(path.resolve(sourcePath, file))) {
                files.push(...this.getFiles(path.resolve(sourcePath, file)));
                // files.(this.getFiles(path.resolve(sourcePath, file)));
            } else {
                files.push(path.resolve(sourcePath, file));
            }
        }

        // console.log(files);

        return files;
    }

    private getFileContent(filePath: string) {
        // return fs.readFileSync(path.resolve(this.config.sourcePath, file), "utf-8");
        return fs.readFileSync(filePath, "utf-8");
    }

    private generateDocumentation = () => {
        if (!this.config.sourcePath) {
            this.raiseError("No sourcePath in config.");
            // return;
        }

        if (!fs.existsSync(this.config.sourcePath)) {
            this.raiseError("Source directory does not exist");
            // return;
        }

        for (const file of this.getFiles(this.config.sourcePath)) {
            const fileContent = this.getFileContent(file);

            // get base endpoint
            const baseEndpoint = fileContent.match(/super\(['"](.*?)['"]\)/);
            if (!baseEndpoint) {
                console.error(`No base endpoint found in ${file}`);
                continue;
            }

            const nodeEndpoint = this.config.apiEndpoint + (baseEndpoint[1] ? "/" + baseEndpoint[1] : "");

            const endpointsRegex = /this\.registerEndpoints\(\s*\[([\s\S]*?)\]\s*\)/;
            const endpointsMatch = fileContent.match(endpointsRegex);
            if (!endpointsMatch) {
                // console.error("Can't find endpoints in registerEndpoints.");
                // this.raiseError("Can't find endpoints in registerEndpoints.");
                console.error(`Can't find endpoints in registerEndpoints: ${baseEndpoint}`);
                continue;
            }

            let endpointsContent = endpointsMatch[1];

            endpointsContent = endpointsContent
                .replace(/\/\/[^\n]*\n/g, "\n") // remove one-line comment //
                .replace(/\/\*[\s\S]*?\*\//g, "") // remove multi-line comments /**/
                .replace(/(,)\s*}/g, "}") // remove comma before bracket }
                .replace(/,\s*$/, "") // remove comma at the end
                .replace(/this\.(\w+)/g, '"$1"') // change "this.method" to "method"
                .replace(/'/g, '"') // change ' to "
                .replace(/(\w+):/g, '"$1":') // change all keys to JSON format ("key": value)
                .trim();

            const jsonEndpoints = `[${endpointsContent}]`;

            let endpointsArrayFromJson: DucumentGeneratorDocumentationEndpointJson[];
            try {
                endpointsArrayFromJson = JSON.parse(jsonEndpoints);
            } catch (e) {
                // console.error("Ошибка при парсинге JSON:", e as string);
                console.error(`Error parsing JSON: ${baseEndpoint} ${e as string}`);
                continue;
            }

            //TODO:!!!!!
            //TODO: parse handler as object
            for (const endpointFromJson of endpointsArrayFromJson) {
                const endpointName: string = endpointFromJson.endpoint;
                const handler = endpointFromJson.handler;
                const ignoreInterceptor = endpointFromJson.ignoreInterceptor;

                if (!this.documentation.hasOwnProperty(nodeEndpoint)) {
                    this.documentation[nodeEndpoint] = {};
                }

                const endpoint: DocumentGeneratorDocumentationEndpoint = {
                    handler,
                    ignoreInterceptor,
                    fullPath: nodeEndpoint + "/" + endpointName,
                    description: "",
                    method: "GET",
                    parameters: [],
                    private: false,
                    // headers: [],
                };

                this.parseEndPointComments(this.getCommentsByEndpoint(fileContent, handler), endpoint);

                if (endpoint.private !== true) {
                    this.documentation[nodeEndpoint][endpointName] = endpoint;
                }
            }

            //ENDPOINTS WITH RegEx
            // get all endpoints
            // const regex = /{\s*endpoint:\s*"(.*?)",\s*handler:\s*this\.(.*?)(?:,\s*ignoreInterceptor:\s*(true|false))?\s*}/g; //with commented endpoints - included
            // const regex = /(?<!\/\/\s*)({\s*endpoint:\s*"(.*?)",\s*handler:\s*this\.(.*?)(?:,\s*ignoreInterceptor:\s*(true|false))?\s*})/g; //commented endpoints - excluded

            // const endpoints = fileContent.matchAll(regex);

            // for (const match of endpoints) {
            //     const endpointName: string = match[2];
            //     const handler = match[3];
            //     const ignoreInterceptor = match[4];

            //     if (!this.documentation.hasOwnProperty(nodeEndpoint)) {
            //         this.documentation[nodeEndpoint] = {};
            //     }

            //     const endpoint: DocumentGeneratorDocumentationEndpoint = {
            //         handler,
            //         ignoreInterceptor,
            //         fullPath: nodeEndpoint + "/" + endpointName,
            //         description: "",
            //         method: "GET",
            //         parameters: [],
            //         private: false,
            //         // headers: [],
            //     };

            //     this.parseEndPointComments(this.getCommentsByEndpoint(fileContent, handler), endpoint);

            //     if (endpoint.private !== true) {
            //         this.documentation[nodeEndpoint][endpointName] = endpoint;
            //     }
            // }
        }

        // this.saveDocumentation();

        console.log("Documentation generated successfully");
    };

    private getCommentsByEndpoint(fileContent: string, handler: string): string {
        let comments: string = "";

        const regex = new RegExp(`(async )*${handler}(\\s*)\\(`, "g");
        const match = fileContent.match(regex);

        if (match) {
            // const indexHandler = fileContent.indexOf(`async ${handler}(`);
            const indexHandler = fileContent.indexOf(`${match[0]}`);

            // if (indexHandler === -1) {
            // 	indexHandler = fileContent.indexOf(`${handler}(`);
            // }

            if (indexHandler != -1) {
                const indexCommentStart = fileContent.lastIndexOf("/**", indexHandler);
                if (indexCommentStart != -1) {
                    const indexCommentEnd = fileContent.indexOf("*/", indexCommentStart);

                    if (indexCommentEnd != -1) {
                        const commentsSubstring = fileContent.substring(indexCommentStart, indexCommentEnd + 2);

                        if (commentsSubstring) {
                            const regexToCheckCommentWithMethod = new RegExp(
                                `${commentsSubstring.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}([\\s]*?)(async )*${handler}(\\s*)\\(`,
                                "g"
                            );

                            const matchToCheckCommentWithMethod = fileContent.match(regexToCheckCommentWithMethod);

                            if (matchToCheckCommentWithMethod) {
                                comments = commentsSubstring;
                            }
                        }
                    }
                }
            }
        }

        return comments;
    }

    private parseEndPointComments(comments: string, endpoint: DocumentGeneratorDocumentationEndpoint): DocumentGeneratorDocumentationEndpoint {
        if (comments) {
            const parsed = parse(comments, { spacing: "preserve" });
            if (parsed[0]) {
                const firstParsed = parsed[0];
                // console.log(firstParsed.tags);

                endpoint.description = this.tagModifications(firstParsed.description);

                firstParsed.tags.forEach((tag) => {
                    endpoint = this.tagToEndpoint(tag, endpoint);
                });
            }
        }

        return endpoint;
    }

    /**
     * From comment-parser library to json
     *
     * @param tag
     * @param endpoint
     * @returns
     */
    private tagToEndpoint(tag: Spec, endpoint: DocumentGeneratorDocumentationEndpoint): DocumentGeneratorDocumentationEndpoint {
        switch (tag.tag) {
            case "param":
                if (!endpoint.parameters) {
                    endpoint.parameters = [];
                }

                endpoint.parameters.push({
                    name: this.tagModifications(tag.name, "name"),
                    type: tag.type,
                    description: this.tagModifications(tag.description),
                    optional: tag.optional,
                    default: tag.default,
                });
                break;
            case "description":
                endpoint.description = this.tagModifications(tag.description);
                break;
            case "method":
                endpoint.method = tag.name;
                break;
            case "private":
                endpoint.private = true;
                break;
            case "example":
                if (!endpoint.example) {
                    endpoint.example = [];
                }

                endpoint.example.push(this.tagModifications(tag.description));
                break;
            case "returns":
                if (!endpoint.returns) {
                    endpoint.returns = [];
                }

                endpoint.returns.push({
                    name: this.tagModifications(tag.name, "name"),
                    type: tag.type,
                    description: this.tagModifications(tag.description),
                    // optional: tag.optional,
                });
                break;
            case "header":
                if (!endpoint.headers) {
                    endpoint.headers = [];
                }

                endpoint.headers.push({
                    name: this.tagModifications(tag.name, "name"),
                    // type: tag.type,
                    description: this.tagModifications(tag.description),
                    // optional: tag.optional,
                });
                break;
            case "throws":
                if (!endpoint.throws) {
                    endpoint.throws = [];
                }

                endpoint.throws.push({
                    name: this.tagModifications(tag.name, "name"),
                    type: tag.type,
                    description: this.tagModifications(tag.description),
                });
                break;
        }

        return endpoint;
    }

    /**
     *
     * modification after comment-parser library parsings with "-" in description
     *
     * @param text
     * @param field
     * @returns
     */
    private tagModifications(text: string, field: string = "description"): string {
        switch (field) {
            case "description":
                text = text
                    .trim()
                    .replace(/^(\-.)/, "")
                    .replaceAll('"', "'")
                    .trim();

                break;

            case "name":
                if (text === "-") {
                    text = "";
                }

                break;
        }

        return text;
    }

    public saveDocumentation(savePath: string): void {
        // const formatForSave = { data: this.documentation };
        if (!savePath) {
            this.raiseError("No savePath in config");
            // return;
        }

        const dir = path.dirname(savePath);
        if (!fs.existsSync(dir)) {
            // fs.mkdirSync(dir, { recursive: true });
            this.raiseError("Save directory does not exist");
            // return;
        }

        fs.writeFileSync(savePath, JSON.stringify(this.documentation, null, 2));
    }

    public getDocumentation(): DocumentGeneratorDocumentation {
        return this.documentation;
    }

    public getDocumentationString(): string {
        return JSON.stringify(this.documentation);
    }

    private raiseError(error: string): never {
        // console.log(`Error: ${error}`);
        throw new Error(error);
    }
}
