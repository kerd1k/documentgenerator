import { BaseEndpoint } from "badmfck-api-server/dist/apiServer/BaseEndpoint";
import { HTTPRequestVO, IError, TransferPacketVO } from "badmfck-api-server/dist/apiServer/structures/Interfaces";
import { ErrorUtils, Validator } from "badmfck-api-server";
import { GD } from "../GD";
import { Errors } from "../Errors";

export class Acquirer extends BaseEndpoint {
    constructor() {
        super("acquirer");

        this.registerEndpoints([
            { endpoint: "add", handler: { POST: this.add } },
            { endpoint: "update/:id", handler: { POST: this.update } },
            { endpoint: "update", handler: { POST: this.update } },
            { endpoint: "delete", handler: { DELETE: this.delete } },
            { endpoint: "delete/:id", handler: { DELETE: this.delete } },
            { endpoint: "list", handler: this.list },
            { endpoint: "get/:id", handler: this.get },
            { endpoint: "get/", handler: this.get },
        ]);
    }

    /**
     * Add new acquirer
     * Multi-line **description**
     *
     * @param {object} data - payment details depends on type
     * @returns {IAcquirer} IAcquirer - acquirer object
     * @throws {Error 400} WRONG_PARAMS - wrong params
     * @throws {Error 3000} ACQUIRER_ERROR - acquirer error
     *
     * @example
     *	curl --location 'http://localhost:8095/api/template/transfer/add' \
        --header 'Authorization: ZEZyZLkoH-6q-Gr6hp2tk8Ktdci787WEfjfiuT38IWE' \
        --header 'Content-Type: application/json' \
        --data '{
            "amount": 235,
            "currency": 1,
            "paymentMethod": "internal",
            "paymentAccountUid": "123456789",
            "includeFeeIntoAmount2": 0,
            "paymentMethodDetails": {
                    "accountUID": "amazing cardUID",
                    "type":"amazingCard"
            },
            "target": {
                    "details": "accountUID",
                    "type": "amazingCash"
            }
        }'
     */
    async add(req: HTTPRequestVO): Promise<TransferPacketVO<IAcquirer | IError>> {
        const acquirer = await GD.REQ_ACQUIRER_ADD.request({ data: req.data });

        if (ErrorUtils.isError(acquirer)) return { error: acquirer as IError };

        return { data: acquirer as IAcquirer };
    }

    /**
     * Update
     *
     * @param {string} id - id to update
     * @param {object} data - acquirer data
     * @returns {boolean} true - if updated
     * @throws {Error 400} WRONG_PARAMS - wrong params
     * @throws {Error 3000} ACQUIRER_ERROR - acquirer error
     *
     * @example
     *	POST http://localhost/api/acquirer/update/<ID>
     * @example
     *	POST http://localhost/api/acquirer/update/
     */
    async update(req: HTTPRequestVO): Promise<TransferPacketVO<boolean | IError>> {
        if (!Validator.validateObject(["id"], req.params) && !Validator.validateObject(["id"], req.data))
            return { error: { ...Errors.WRONG_PARAMS, details: "id is missing" } };

        const id = req.params.id || req.data.id;

        const acquirer = await GD.REQ_ACQUIRER_UPDATE.request({ data: req.data, id: id });

        if (ErrorUtils.isError(acquirer)) return { error: acquirer as IError };

        return { data: true };
    }

    /**
     * Delete
     *
     * @param {string} id - id to delete
     * @returns {boolean} result - true if deleted
     * @throws {Error 400} WRONG_PARAMS - wrong params
     * @throws {Error 3000} ACQUIRER_ERROR - acquirer error
     *
     * @example
     *	DELETE http://localhost/api/acquirer/delete/<ID>
     */
    async delete(req: HTTPRequestVO): Promise<TransferPacketVO<IError | boolean>> {
        if (!Validator.validateObject(["id"], req.params) && !Validator.validateObject(["id"], req.data))
            return { error: { ...Errors.WRONG_PARAMS, details: "id is missing" } };

        const id = req.params.id || req.data.id;

        const result = await GD.REQ_ACQUIRER_DELETE.request({ data: { id } });

        if (ErrorUtils.isError(result)) return { error: result as IError };

        return { data: result as boolean };
    }

    /**
     * Get all
     *
     * @returns {IAcquirer[]} IAcquirer - list of acquirers
     * @throws {Error 400} WRONG_PARAMS - wrong params
     * @throws {Error 3000} ACQUIRER_ERROR - acquirer error
     *
     * @example
     *	POST http://localhost/api/acquirer/list
     */
    async list(req: HTTPRequestVO): Promise<TransferPacketVO<IAcquirer[] | IError>> {
        const acquirers = await GD.REQ_ACQUIRER_GET_ALL.request({});

        if (ErrorUtils.isError(acquirers)) return { error: acquirers as IError };

        return { data: acquirers as IAcquirer[] };
    }

    /**
     * Get acquirer by ID
     *
     * @returns {IAcquirer[]} IAcquirer - list of acquirers
     * @throws {Error 400} WRONG_PARAMS - wrong params
     * @throws {Error 3000} ACQUIRER_ERROR - acquirer error
     *
     * @example
     *	POST http://localhost/api/acquirer/get/<ID>
     *
     * @example
     *  POST http://localhost/api/acquirer/get/
     *
     */
    async get(req: HTTPRequestVO): Promise<TransferPacketVO<IAcquirer | IError>> {
        if (!Validator.validateObject(["id"], req.params) && !Validator.validateObject(["id"], req.data))
            return { error: { ...Errors.WRONG_PARAMS, details: "id is missing" } };

        const id = req.params.id || req.data.id;
        let acquirer: IAcquirer | IError;

        if (id.toString() === "0") acquirer = await GD.REQ_ACQUIRER_GET_EMPTY_OBJECT.request({});
        else acquirer = await GD.REQ_ACQUIRER_GET_BY_ID.request({ data: { id } });

        if (ErrorUtils.isError(acquirer)) return { error: acquirer as IError };

        return { data: acquirer as IAcquirer };
    }
}
