import { BaseService } from "badmfck-api-server/dist/apiServer/BaseService";
import { Req } from "badmfck-signal";
import { IUser } from "./UserService";
import { GD } from "../GD";
import { EntityService } from "./EntityService";
import { ErrorUtils, UID } from "badmfck-api-server";
import { Errors } from "../Errors";
import dayjs from "dayjs";
import { IError } from "badmfck-api-server/dist/apiServer/structures/Interfaces";

export type IAccountType = "private" | "business";
export type IAccountStatus = "active" | "blocked";
export type TAccountType = "user" | "external";

/*export interface IBalance{
    uid:string,
    account_uid:string,
    currency_id:number,
    credit:number,
    debet:number,
    last_transaction_id:number
}*/

export interface ITransactionAccount {
    uid: string;
    project_id: number;
    owner: string;
    type: "user" | "merchant" | "service" | "system";
    status: "active" | "blocked";
    ctime: Date;
    utime: Date;
}

export interface IAccount2 {
    // NEW
    /* uid:string,
    iban:string,
    project_id:number,
    
    
    type:TAccountType,
    status:"active"|"blocked",
    ctime:Date,
    utime:Date
   */

    uid: string;
    user_uid: string;
    currency_id: number;
    pending: number;
    income: number;
    expense: number;
    type: string;

    // OLD
    /*last_transaction_id:number,
    
    status:IAccountStatus,
    created_at:Date,
    updated_at:Date,
    creator_uid:string,
    balances:IAccountBalance[]*/
}

interface IAccountGetParams {
    user: IUser;
}

interface IAccountPostParams {
    type: IAccountType;
    user: IUser;
}

export interface IAccountUpdatedSignal {
    userUID: string;
    account: IAccount;
}

export const REQ_ACCOUNTS_GET = new Req<IAccountGetParams, IAccount[] | IError>();
export const REQ_ACCOUNT_GET_BY_CURRENCY = new Req<{ user: IUser; currency_id: number }, IAccount | IError>();

interface IAcquirerEntity extends Omit<IAcquirer, "deletedAt" | "createdAt" | "updatedAt" | "data"> {
    deleted_at: string | null;
    ctime: string;
    utime: string | null;
    data: string;
}
type IAcquirerCreateDto = Omit<IAcquirer, "id" | "createdAt" | "updatedAt" | "deletedAt">;
type IAcquirerUpdateDto = Partial<IAcquirerCreateDto>;

export class AcquirerService extends EntityService<IAcquirer, IAcquirerEntity, IAcquirerCreateDto, IAcquirerUpdateDto> {
    table: string = "acquirers";
    fieldsToCheckAdd = ["data"];
    fieldsToCheckUpdate = ["data"];
    fieldsForSelect = [];
    error = Errors.ACQUIRER_ERROR;
    primaryField = "id";

    constructor() {
        super("AcquirerService");

        GD.REQ_ACQUIRER_ADD.listener = async (data) => this.add(data.data);
        GD.REQ_ACQUIRER_UPDATE.listener = async (data) => this.update(data);
        GD.REQ_ACQUIRER_DELETE.listener = async (data) => this.delete(data);
        GD.REQ_ACQUIRER_GET_ALL.listener = async (data) => this.getAll(data);
        GD.REQ_ACQUIRER_GET_BY_ID.listener = async (data) => this.getById(data);
        GD.REQ_ACQUIRER_GET_EMPTY_OBJECT.listener = async () => this.getEmptyObject();
    }

    async add(data: any): Promise<IAcquirer | IError> {
        const addResult = super.add(data);

        if (ErrorUtils.isError(addResult)) return addResult;

        return addResult;
    }

    dataToDto(data: any): IAcquirerCreateDto {
        return {
            data: data.data,
            project_id: data.project_id,
        };
    }

    dtoToSaveEntity(dto: IAcquirerCreateDto): IAcquirerEntity {
        const id = UID.generateNumberic();

        return {
            // ...dto,
            id: id,
            data: dto.data ? JSON.stringify(dto.data) : "",
            ctime: dayjs(new Date()).format("YYYYMMDDHHMMss"),
            utime: null,
            deleted_at: null,
            project_id: dto.project_id,
        };
    }

    dtoToUpdateEntity(dto: IAcquirerUpdateDto): Partial<IAcquirerEntity> {
        return {
            data: dto.data ? JSON.stringify(dto.data) : "",
            utime: dayjs(new Date()).format("YYYYMMDDHHMMss"),
        };
    }

    entityToModel(entity: IAcquirerEntity): IAcquirer {
        return {
            id: entity.id,
            data: entity.data ? JSON.parse(entity.data) : {},
            createdAt: entity.ctime,
            updatedAt: entity.utime,
            deletedAt: entity.deleted_at,
            project_id: entity.project_id,
        };
    }

    getEmptyObject(): Required<IAcquirer> {
        return {
            id: 0,
            data: {},
            createdAt: "",
            updatedAt: "",
            deletedAt: null,
            project_id: 0,
            trx_uid: "",
        };
    }
}
