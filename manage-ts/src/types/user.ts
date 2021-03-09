export interface FilterProp {
    name: string[];
    role: string[];
}

export interface StaffProp {
    name: string;
    username: string;
    nickname: string;
    avatar?: string;
    role?: { name: string; _id: string };
    password?: string;
    __v?: number;
    _id?: string;
}
export interface RoleProp {
    name: string;
    _id: string;
}
export interface PaginationProp {
    current: number;
    pageSize: number;
    total?: number;
}

export interface FileProp {
    uid: string;
    name?: string;
    status?: string;
    response?: { imageUrl: string; msg?: string };
    percent?: number;
    url?: string;
    preview?: string;
    originFileObj?: any;
}
export interface FileInfo {
    file: FileProp;
    fileList: FileProp[];
}

export interface FiltersProp {
    name?: string[];
    role?: string[];
}
export interface ResProp {
    msg: string;
    data: StaffProp[];
    total: number;
}
export interface StaffProps {
    role: {
        buttonsAuths: Array<string>;
        contentsAuths: Array<string>;
        othersAuths: Array<string>;
        routesAuths: Array<string>;
        desc: string;
        name: string;
        _id: string;
    };
    username: string;
    name: string;
    avatar: string;
    nickname: string;
    _id: string;
}