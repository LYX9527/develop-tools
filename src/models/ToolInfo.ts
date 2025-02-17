/**
 * 定义工具的基础信息接口
 * 接口用于标准化工具基本信息，包括工具的名称、描述、标签、图标以及可选的作者和邮箱信息
 *
 * 创建工具后请创建一个Info.ts文件来暴露一个ToolBaseInfo的对象，
 * 用于提供给程序进行读取工具相关的信息和创建工具访问卡片
 */
export interface ToolBaseInfo {
    // 工具的名称，是工具信息中最重要的标识字段
    name: string;
    // 工具的描述，提供工具功能和用途的详细说明
    description: string;
    // 工具的标签，用于分类或搜索工具时使用
    tags: string[];
    // 工具的图标，提供直观的视觉标识，请用组件或null，为Null时会自动生成默认图标
    icon: any|null;
    // 工具作者的姓名，是一个可选字段
    author?: string;
    // 工具作者的邮箱，是一个可选字段，用于联系作者
    email?: string;
    // 工具的github地址，是一个可选字段，用于提供工具的github地址
    github?: string;
}

/**
 * 定义工具的加载信息接口，继承自ToolBaseInfo，
 * 添加了一个的toolTag字段，作为工具加载的唯一标识符
 */
export interface ToolLoadedInfo extends ToolBaseInfo {
    toolTag?: string;
}
