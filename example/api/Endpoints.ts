import { BaseEndpoint } from "badmfck-api-server/dist/apiServer/BaseEndpoint";
import { HTTPRequestVO, TransferPacketVO } from "badmfck-api-server/dist/apiServer/structures/Interfaces";
import { Errors } from "../Errors";
import { GD } from "../GD";
import { Validator } from "badmfck-api-server";

export class Example extends BaseEndpoint {
    constructor() {
        super("example"); // registrate route endpoint, as in /api/v1/example
        this.registerEndpoints([
            // { endpoint: "test", handler: this.test },
            { endpoint: "testDocs", handler: this.testDocs },
            { endpoint: "testDocumentation", handler: this.testDocs, ignoreInterceptor: true },
            { endpoint: "testPrivate", handler: this.testDocsPrivate, ignoreInterceptor: true },
        ]);
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
    * Represents a book.
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
