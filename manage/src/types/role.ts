interface TreeDataProp {
    key: string | symbol | undefined;
    title: string | symbol | undefined;
    children: string | ChildrenProp[];
}

export interface ChildrenProp {
    title: string | symbol | undefined;
    key: string | symbol | undefined;
}

export interface RoleProp {
    buttonsAuths: Array<string>;
    contentsAuths: Array<string>;
    othersAuths: Array<string>;
    routesAuths: Array<string>;
    desc: string;
    name: string;
    _id?: string;
}

export interface PageLevelProp {
    treeData: TreeDataProp[];
    expandedKeys: string[];
    autoExpandParent: boolean;
    checkedKeys: string[];
    selectedKeys: string[];
}

export interface ResProp {
    msg: string;
    data: RoleProp[];
}