import { BaseEndpoint } from "badmfck-api-server/dist/apiServer/BaseEndpoint";
import { HTTPRequestVO, TransferPacketVO } from "badmfck-api-server/dist/apiServer/structures/Interfaces";
import { Errors } from "../Errors";
import { GD } from "../GD";
import { Validator } from "badmfck-api-server";

export interface ExampleRequestVO {
    test: string;
    name: string;
    age: number;
    isAdmin: boolean;
}

export type TProject = "vibo.tips" | "amazing.money" | "freeply.cards";

export class Example extends BaseEndpoint {
    constructor() {
        super("example"); // registrate route endpoint, as in /api/v1/example
        this.registerEndpoints([
            // { endpoint: "test", handler: this.test },
            { endpoint: "test", handler: this.testDocs },
            // { endpoint: "test", handler: this.test },
            { endpoint: "testWithIgnoreInterceptor", handler: this.testDocs, ignoreInterceptor: true },
            { endpoint: "testPrivate", handler: this.testDocsPrivate },
            { endpoint: "testWithCommentInside", handler: this.testDocsPrivate /*testDocsPrivate2*/ },
            { endpoint: "ui/testWithMultiSlash", handler: this.testDocs, validationModel: _IBalancerStrageyRequest },
            {
                ignoreInterceptor: false,
                endpoint: "testWithMultiline",
                handler: this.testDocs,
                validationModel: _IBalancerStrageyRequest,
            },
            {
                endpoint: "ui/testWithDifferentMethods",
                ignoreInterceptor: false,
                handler: {
                    POST: this.getDocTestPost,
                    GET: this.getDocTestGet,
                    DELETE: this.getDocTestDel,
                    PUT: {
                        controller: this.getDocTestPut,
                        ignoreInterceptor: true,
                    },
                    ASD: this.getDocTestAsd,
                },
            },
        ]);
    }

    /**
     * @description - TEST GET
     * @returns {JSON2} json - JSON from file
     * @throws {DOC_NO_DOCUMENT} DOC_NO_DOCUMENT - no json file for documentation
     * @example - GET http://localhost/auth/doc/ui/test/
     */
    async getDocTestGet(): Promise<TransferPacketVO<any>> {
        return { data: "TEST GET" };
    }

    /**
     * @description - TEST DELETE
     * @returns {JSON6} json - JSON from file
     * @throws {Error 1006} DOC_NO_DOCUMENT - no json file for documentation
     * @example - DELETE http://localhost/auth/doc/ui/test/
     */
    async getDocTestDel(): Promise<TransferPacketVO<any>> {
        return { data: "TEST DEL" };
    }

    /**
     * @description - TEST POST
     * @returns {JSON3} json - JSON from file
     * @throws {Error 1003} DOC_NO_DOCUMENT - no json file for documentation
     * @example - POST http://localhost/auth/doc/ui/test/
     */
    async getDocTestPost(): Promise<TransferPacketVO<any>> {
        return { data: "TEST POST" };
    }

    /**
     * @description - TEST PUT
     * @returns {JSON4} json - JSON from file
     * @throws {Error 1004} DOC_NO_DOCUMENT - no json file for documentation
     * @example - PUT http://localhost/auth/doc/ui/test/
     */
    async getDocTestPut(): Promise<TransferPacketVO<any>> {
        return { data: "TEST PUT" };
    }

    /**
     * @description - TEST ASD - manual method
     * @returns {JSON5} json - JSON from file
     * @throws {Error 1005} DOC_NO_DOCUMENT - no json file for documentation
     * @example - ASD http://localhost/auth/doc/ui/test/
     */
    async getDocTestAsd(): Promise<TransferPacketVO<any>> {
        return { data: "TEST ASD" };
    }

    /**
     * @description - Test route for /api/v1/example/test
     * @param req - Request object, contains all nessessary data
     * @returns {TransferPacketVO<any>} - response object
     * @example
        http://localhost:8015/api/v1/example/test?test=test - will return {data:true}
        http://localhost:8015/api/v1/example/test?test=test2 - will return {data:false}
        http://localhost:8015/api/v1/example/test - will return error
     */
    async test(req: HTTPRequestVO): Promise<TransferPacketVO<any>> {
        if (req.method !== "GET") {
            return {
                error: {
                    ...Errors.TEST_ERROR,
                    httpStatus: 405,
                },
            };
        }

        // req.data  - parsed request data
        if (!Validator.validateObject(["test"], req.data)) {
            return { error: Errors.WRONG_REQUEST };
        }

        // Emit request through GD
        const result = await GD.REQ_EXAMPLE_TEST.request(req.data.test);

        return { data: result };
    }

    /**
    * Represents a book - this description not shown, becuase of @description
    *
    * @class - (synonyms: @constructor)
    * @async
    * @extends
    * @abstract
    * @interface
    * @static
    * @deprecated
    * @author - Aleksejs Cetverikovs <kerd1k@gmail.com>
    * 
    * @header {string} authorization - user auth token, to get user from API
    *
    * @param {Object} employee - The employee who is responsible for the project.
    * @param {string} employee.name - The name of the employee.
    * @param {string} employee.department - The employee's department.
    * @param {Object[]} employees - The employees who are responsible for the project.
    * @param {string} employees[].name - The name of an employee.
    * @param {string} employees[].department - The employee's department.
    * @param {string} somebody - Somebody's name.
    * @param {string} [somebody] - Somebody's name.
    * @param {string} [somebody=John Doe] - Somebody's name.
    * @param {string} [somebody=John Doe] Somebody's name.
    * @param {(string|string[])} [somebody=John Doe] - Somebody's name, or an array of names.

    * @throws {InvalidArgumentException}
    * @throws - Will throw an error if the argument is null.
    * @throws {DivideByZero} - Argument x must be non-zero.

    * @returns {TransferPacketVO<any>} - response object
		* @example
		* // returns 2
		* globalNS.method1(5, 10);
		* @example
		* // returns 3
		* globalNS.method(5, 15);
    * @example 
		* http://localhost:8015/api/v1/example/test?test=test - will return {data:true}
    * http://localhost:8015/api/v1/example/test?test=test2 - will return {data:false}
    * http://localhost:8015/api/v1/example/test - will return error

    * @description - TestDocs route
	 */
    async testDocs(req: HTTPRequestVO): Promise<TransferPacketVO<any>> {
        if (req.method !== "GET") {
            return {
                error: {
                    ...Errors.TEST_ERROR,
                    httpStatus: 405,
                },
            };
        }

        // req.data  - parsed request data
        if (!Validator.validateObject(["test"], req.data)) {
            return { error: Errors.WRONG_REQUEST };
        }

        // Emit request through GD
        const result = await GD.REQ_EXAMPLE_TEST.request(req.data.test);

        return { data: result };
    }

    /**
    * Test endpoint with private method - need to ignore
    *
    * @class - (synonyms: @constructor)
    * @private
    * @param {string} employee.name - The name of the employee.
    * @param {string} employee.department - The employee's department.
    * @param {string} [somebody=John Doe] Somebody's name.
    * @param {(string|string[])} [somebody=John Doe] - Somebody's name, or an array of names.~
    * @throws {DivideByZero} - Argument x must be non-zero.
    * @returns {TransferPacketVO<any>} - response object
    * @example 
    * http://localhost:8015/api/v1/example/test - will return error

    * @description - TestDocs route
	 */
    async testDocsPrivate(req: HTTPRequestVO): Promise<TransferPacketVO<any>> {
        if (req.method !== "GET") {
            return {
                error: {
                    ...Errors.TEST_ERROR,
                    httpStatus: 405,
                },
            };
        }

        // req.data  - parsed request data
        if (!Validator.validateObject(["test"], req.data)) {
            return { error: Errors.WRONG_REQUEST };
        }

        // Emit request through GD
        const result = await GD.REQ_EXAMPLE_TEST.request(req.data.test);

        return { data: result };
    }
}
