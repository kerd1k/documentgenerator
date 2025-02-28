declare interface IAcquirer {
  id: number;
  data: IAcquirerData;
  createdAt: string;
  updatedAt: string | null;
  deletedAt: string | null;
  project_id: number;
  trx_uid?:string;
}

declare interface IAcquirerData {
  general?: IAcquirerDataGeneral;
}

declare interface IAcquirerDataGeneral {
  name?: string;
  number?: string;
  country?: string;
  city?: string;
  address?: string;
}
