export interface ToolBaseInfo {
    name: string;
    description: string;
    tags: string[];
    icon: any|null;
    author?: string;
    email?: string;
}


export interface ToolLoadedInfo extends ToolBaseInfo {
    path: string;
}
