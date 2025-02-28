import * as fs from "fs";
import * as path from "path";
import { parse, Spec } from "comment-parser";
import { isDirectory } from "./utils";
import { Validator } from "./Validator";

declare type DocumentGeneratorConfig = {
    sourcePath: string | null;
    apiEndpoint: string | null;
    docPath: string | null;
    // savePath?: string | null;
    // savePathFileName?: string | null;
};

declare type DocumentGeneratorDocumentation = {
    [baseEndpointName: string]: {
        description: string;
        endpoints: {
            [endPointName: string]: DocumentGeneratorDocumentationEndpoint;
        };
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
    throws?: DocumentGeneratorDocumentationEndpointDefaultErrorParameter[];
};

declare type DocumentGeneratorDocumentationEndpointDefaultParameter = {
    name: string;
    type: string;
    description: string;
};

declare type DocumentGeneratorDocumentationEndpointDefaultErrorParameter = DocumentGeneratorDocumentationEndpointDefaultParameter & {
    status: number;
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

declare type DocumentGeneratorType = {
    [typeName: string]: any;
};

declare type DocumentGeneratorError = {
    [typeName: string]: {
        code: number;
        message: string;
        httpStatus: number;
    };
};

export class DocumentGenerator {
    private documentation: DocumentGeneratorDocumentation = {};
    private types: DocumentGeneratorType = {};
    private errors: DocumentGeneratorError = {};
    private config: DocumentGeneratorConfig;

    constructor(config: DocumentGeneratorConfig) {
        this.config = config;

        this.generateTypesInterfacesErrors();
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

    private extractInterfaces(content: string): Record<string, string> {
        const matches = content.match(/interface\s+[A-Za-z0-9_]+(?:\s+extends\s+[A-Za-z0-9_,\s<>|"']+)?\s*\{[^}]*\}/gs) || [];
        const result: Record<string, string> = {};

        matches.forEach((match) => {
            const nameMatch = match.match(/interface\s+([A-Za-z0-9_]+)/);

            if (nameMatch) {
                result[nameMatch[1]] = match
                    .replace(/\/\/[^\n]*\n/g, "\n") // remove one-line comment //
                    .replace(/\/\*[\s\S]*?\*\//g, "") // remove multi-line comments /**/
                    .replace(/'/g, '"') // change ' to "
                    .trim();
            }
        });

        return result;
    }

    private extractTypes(content: string): Record<string, string> {
        const matches = content.match(/type\s+[A-Za-z0-9_]+\s*=\s*[^;]+;/gs) || [];
        const result: Record<string, string> = {};

        matches.forEach((match) => {
            const nameMatch = match.match(/type\s+([A-Za-z0-9_]+)/);

            if (nameMatch) {
                result[nameMatch[1]] = match
                    .replace(/\/\/[^\n]*\n/g, "\n") // remove one-line comment //
                    .replace(/\/\*[\s\S]*?\*\//g, "") // remove multi-line comments /**/
                    .replace(/'/g, '"') // change ' to "
                    .trim();
            }
        });

        return result;
    }

    extractErrors(content: string): Record<string, any> {
        const matches = content.match(/static\s+([A-Z0-9_]+):\s*IError\s*=\s*\{[^}]+\}/gs) || [];
        const result: Record<string, any> = {};

        matches.forEach((match) => {
            const nameMatch = match.match(/static\s+([A-Z0-9_]+):\s*IError\s*=\s*(\{[^}]+\})/);
            if (nameMatch) {
                try {
                    result[nameMatch[1]] = eval(`(${nameMatch[2]})`);
                } catch {
                    result[nameMatch[1]] = nameMatch[2]; // В случае ошибки парсинга оставляем как строку
                }
            }
        });

        return result;
    }

    private generateTypesInterfacesErrors = () => {
        if (!this.config.sourcePath) {
            this.raiseError("No sourcePath in config.");

            // return;
        }

        if (!fs.existsSync(this.config.sourcePath)) {
            this.raiseError("Source directory does not exist");

            // return;
        }

        // let collected: Record<string, string> = {};

        for (const file of this.getFiles(this.config.sourcePath)) {
            const fileContent = this.getFileContent(file);

            Object.assign(this.types, this.extractInterfaces(fileContent));
            Object.assign(this.types, this.extractTypes(fileContent));
            Object.assign(this.errors, this.extractErrors(fileContent));
        }

        // console.dir(this.types);
    };

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
                // console.error(`No base endpoint found in ${file}`);

                continue;
            }

            const nodeEndpoint = this.config.apiEndpoint + (baseEndpoint[1] ? "/" + baseEndpoint[1] : "");

            const endpointsRegex = /this\.registerEndpoints\(\s*\[([\s\S]*?)\]\s*\)/;
            const endpointsMatch = fileContent.match(endpointsRegex);
            if (!endpointsMatch) {
                // console.error("Can't find endpoints in registerEndpoints.");
                // this.raiseError("Can't find endpoints in registerEndpoints.");

                // console.error(`Can't find endpoints in registerEndpoints: ${baseEndpoint}`);

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
                console.error(`Error parsing JSON: ${baseEndpoint} ${e as string}`);

                continue;
            }

            for (const endpointFromJson of endpointsArrayFromJson) {
                if (!Validator.validateObject(["endpoint", "handler"], endpointFromJson)) {
                    console.error(`Error validating object:`, endpointFromJson);

                    continue;
                }

                const endpointName: string = endpointFromJson.endpoint;
                const handler = endpointFromJson.handler;
                const ignoreInterceptor = endpointFromJson.ignoreInterceptor;

                if (!this.documentation.hasOwnProperty(nodeEndpoint)) {
                    this.documentation[nodeEndpoint] = {
                        description: baseEndpoint[1] && this.config.docPath ? this.getDescription(baseEndpoint[1]) : "",
                        endpoints: {},
                    };
                }

                if (typeof handler === "string") {
                    let method = "ALL";
                    let endpoint = this.generateEndpoint(handler, ignoreInterceptor, nodeEndpoint + "/" + endpointName, method, fileContent);

                    if (endpoint && endpoint.private !== true) {
                        this.documentation[nodeEndpoint]["endpoints"][method + " " + endpointName] = endpoint;
                    }
                } else {
                    for (let method in handler) {
                        let endpoint: DocumentGeneratorDocumentationEndpoint | null = null;

                        if (typeof handler[method] === "string") {
                            endpoint = this.generateEndpoint(
                                handler[method],
                                ignoreInterceptor,
                                nodeEndpoint + "/" + endpointName,
                                method,
                                fileContent
                            );
                        } else {
                            if (Validator.validateObject(["controller"], handler[method])) {
                                const ignoreInterceptorHandler = Validator.validateObject(["ignoreInterceptor"], handler[method])
                                    ? handler[method].ignoreInterceptor
                                    : ignoreInterceptor;

                                endpoint = this.generateEndpoint(
                                    handler[method].controller,
                                    ignoreInterceptorHandler,
                                    nodeEndpoint + "/" + endpointName,
                                    method,
                                    fileContent
                                );
                            } else {
                                console.error(`Error validating handler, no controller:`, handler[method]);

                                continue;
                            }
                        }

                        if (endpoint && endpoint.private !== true) {
                            this.documentation[nodeEndpoint]["endpoints"][method + " " + endpointName] = endpoint;
                        }
                    }
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

            //remove group if no endpoints inside
            if (this.documentation[nodeEndpoint]) {
                if (Object.keys(this.documentation[nodeEndpoint]["endpoints"]).length === 0) {
                    delete this.documentation[nodeEndpoint];
                }
            }
        }

        // this.saveDocumentation();

        console.log("Documentation generated successfully");
    };

    /**
     *
     * start generating endpoint - with default values
     *
     * @param handler
     * @param ignoreInterceptor
     * @param fullPath
     * @param fileContent
     */
    private generateEndpoint(
        handler: string,
        ignoreInterceptor: string | undefined,
        fullPath: string,
        method: string,
        fileContent: string
    ): DocumentGeneratorDocumentationEndpoint {
        const endpoint: DocumentGeneratorDocumentationEndpoint = {
            handler,
            ignoreInterceptor,
            fullPath,
            method,
            description: "",
            parameters: [],
            private: false,
            // headers: [],
        };

        this.parseEndPointComments(this.getCommentsByEndpoint(fileContent, handler), endpoint);

        return endpoint;
    }

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

    /**
     *
     * From comment-parser library to json
     *
     * @param comments
     * @param endpoint
     * @returns
     */
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

    private getType(type: string) {
        if (type) {
            //check if [] exists
            if (type.includes("[]")) {
                type = type.replace("[]", "");

                if (type in this.types) {
                    return this.types[type].replace(/</g, "&lt;").replace(/>/g, "&gt;") + "[]";
                }
            } else {
                if (type in this.types) {
                    return this.types[type].replace(/</g, "&lt;").replace(/>/g, "&gt;");
                }
            }
        }

        return type;
    }

    private getError(tag: Spec): DocumentGeneratorDocumentationEndpointDefaultErrorParameter {
        const error: DocumentGeneratorDocumentationEndpointDefaultErrorParameter = {
            name: this.tagModifications(tag.name, "name"), //error name - Error in html page
            type: tag.type, //type in {} - Code in html page
            description: this.tagModifications(tag.description), //description - get message or description
            status: 0,
        };

        //static METHOD_NOT_ALLOWED: IError = { code: 405, message: "Method not allowed", httpStatus: 405 };
        if (tag.type in this.errors) {
            if (this.errors[tag.type].httpStatus) error.status = this.errors[tag.type].httpStatus;

            if (this.errors[tag.type].code) error.type = this.errors[tag.type].code.toString();

            if (this.errors[tag.type].message) error.description = this.errors[tag.type].message;
        }

        return error;
    }

    /**
     *
     * @param {Spec} tag - from comment-parser library generated tag ("Spec" type from comment-library)
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
                    type: this.getType(tag.type),
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
                    type: this.getType(tag.type),
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

                endpoint.throws.push(this.getError(tag));
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

    private getDescription(baseEndpoint: string): string {
        if (!this.config.docPath) return "";

        const dir = path.resolve(this.config.docPath);
        baseEndpoint = baseEndpoint.replace(/[\/\\]/g, "");

        if (!fs.existsSync(dir)) return "";

        const file = path.resolve(dir, `${baseEndpoint}.md`);

        if (!fs.existsSync(file)) return "";

        return fs.readFileSync(file, "utf-8");
    }
}
