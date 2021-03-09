import { RouteRecordRaw } from "vue-router";
export interface RoleProps {
    buttonsAuths: Array<string>;
    contentsAuths: Array<string>;
    othersAuths: Array<string>;
    routesAuths: Array<string>;
    desc: string;
    name: string;
    _id: string;
}

export interface UserProps {
    avatar: string;
    name?: string;
    nickname?: string;
    role: RoleProps;
    username?: string;
    _id?: string;
}

export interface GlobalDataProps {
    token: string;
    addRoutesDone: boolean;
    menu: Array<RouteRecordRaw>;
    userInfo: UserProps;
}