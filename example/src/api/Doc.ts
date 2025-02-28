import { BaseEndpoint } from "badmfck-api-server/dist/apiServer/BaseEndpoint";
import { HTTPRequestVO, TransferPacketVO } from "badmfck-api-server/dist/apiServer/structures/Interfaces";
import { existsSync, readFileSync } from "fs";
import path from "path";
import { __root } from "../Main";
import { Errors } from "../Errors";

export class Doc extends BaseEndpoint {
    json: Record<string, any> | null = null;

    constructor() {
        super("doc");
        this.registerEndpoints([
            { endpoint: "", handler: { GET: this.getDocJson }, ignoreInterceptor: true },
            { endpoint: "ui", handler: { GET: this.getDocUi } },
        ]);
    }

    /**
     * @description - Get JSON with all project endpoints and descriptions
     * @private
     * @method GET
     * @returns {JSON} json - JSON from file
     * @throws {Error 1001} DOC_NO_DOCUMENT - no json file for documentation
     * @example - http://localhost/api/doc
     */
    async getDocJson(req: HTTPRequestVO): Promise<TransferPacketVO> {
        if (!this.json) {
            const filePath = path.resolve(__root, "doc.json");

            if (!existsSync(filePath)) {
                return { error: Errors.DOC_NO_DOCUMENT };
            }

            const file = readFileSync(filePath, "utf-8");
            this.json = JSON.parse(file.toString());
        }

        return { data: this.json };
    }

    /**
     * Show html page with parsed JSON
     * @returns {HTML} html - HTML file
     * @private
     * @mthod GET
     * @throws {Error 1002} DOC_NO_TEMPLATE - no template for documentation
     * @example - http://localhost/api/doc/ui
     */
    async getDocUi(): Promise<TransferPacketVO<any>> {
        const templatePath = path.resolve(__root, "documentation.html");

        if (!existsSync(templatePath)) {
            return { error: Errors.DOC_NO_TEMPLATE };
        }

        const fileContent = readFileSync(templatePath, "utf-8");

        return {
            rawResponse: true,
            data: fileContent,
        };
    }
}
