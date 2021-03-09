export interface PaginationProp {
    current: number;
    pageSize: number;
    total?: number;
}

export interface FilterOpreationProp {
    username: string[];
    name: string[];
    module: string[];
    type: string[];
    operator: string[];
    contents: string[];
}

export interface FilterLoginProp {
    username: string[];
    name: string[];
}
export interface OperatiomProp {
    type: string;
    module: string;
    operator: string;
    contents: string;
    time: string;
    __v?: number;
    _id: string;
}

export interface LoginProp {
    ip: string;
    name: string;
    staff: string;
    time: string;
    username: string;
    __v?: number;
    _id: string;
}

export interface FiltersProp {
    username?: string[];
    name?: string[];
    module?: string[];
    type?: string[];
    contents?: string[];
    operator?: string[];
}
export interface ResProp {
    msg: string;
    data: LoginProp[];
    total: number;
}

export interface ResOperaProp {
    msg: string;
    data: OperatiomProp[];
    total: number;
}

