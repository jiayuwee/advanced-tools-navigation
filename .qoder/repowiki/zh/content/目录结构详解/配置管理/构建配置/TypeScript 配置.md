# TypeScript 配置

<cite>
**本文档引用的文件**  
- [tsconfig.json](file://tsconfig.json)
- [tsconfig.app.json](file://advanced-tools-navigation/tsconfig.app.json)
- [tsconfig.node.json](file://tsconfig.node.json)
- [env.d.ts](file://env.d.ts)
- [src/types/global.d.ts](file://src/types/global.d.ts)
- [vite.config.ts](file://vite.config.ts)
- [src/main.ts](file://src/main.ts)
- [src/composables/useSimpleTheme.ts](file://src/composables/useSimpleTheme.ts)
- [src/types/database.ts](file://src/types/database.ts)
</cite>

## 目录
1. [项目结构](#项目结构)
2. [核心编译配置解析](#核心编译配置解析)
3. [应用与Node配置分工](#应用与node配置分工)
4. [模块隔离与构建工具兼容性](#模块隔离与构建工具兼容性)
5. [类型声明扩展机制](#类型声明扩展机制)
6. [路径映射与模块解析](#路径映射与模块解析)
7. [类型检查范围控制](#类型检查范围控制)
8. [典型类型错误排查](#典型类型错误排查)
9. [总结](#总结)

## 项目结构

本项目采用典型的Vue 3 + TypeScript + Vite架构，TypeScript配置文件集中于项目根目录。主要配置文件包括：
- `tsconfig.json`：基础配置，被其他配置继承
- `tsconfig.app.json`：前端应用编译专用配置
- `tsconfig.node.json`：Node.js运行时脚本（如vite.config.ts）类型校验专用配置

前端源码位于`src/`目录，包含组件、组合式函数、类型定义等模块。类型声明文件分布在`env.d.ts`和`src/types/`中，用于扩展全局类型。

**Section sources**
- [tsconfig.json](file://tsconfig.json#L1-L28)
- [tsconfig.app.json](file://advanced-tools-navigation/tsconfig.app.json#L1-L15)
- [tsconfig.node.json](file://tsconfig.node.json#L1-L10)

## 核心编译配置解析

`tsconfig.json`作为基础配置文件，定义了项目的核心编译选项：

- **target**: `"ESNext"` —— 目标为最新ECMAScript标准，充分利用现代浏览器特性
- **module**: `"ESNext"` —— 使用ES模块语法，与Vite的原生ESM支持完美契合
- **lib**: `["ESNext", "DOM"]` —— 包含最新JavaScript特性和DOM API支持
- **jsx**: `"preserve"` —— 保留JSX语法，交由Vue编译器处理
- **strict**: `false` —— 基础配置关闭严格模式，由具体子配置启用
- **isolatedModules**: `true` —— 要求每个文件可独立编译，确保与ESBuild等工具兼容
- **baseUrl** 和 **paths**: 配置模块解析基础路径和别名映射

这些配置为项目提供了现代、高效的编译基础，同时保持与构建工具的良好兼容性。

**Section sources**
- [tsconfig.json](file://tsconfig.json#L2-L28)

## 应用与Node配置分工

项目通过继承机制实现配置分工，提升类型校验的精确性。

### 前端应用配置 (tsconfig.app.json)

该配置继承自`@vue/tsconfig/tsconfig.dom.json`，专为浏览器环境优化：

- 启用完整严格模式 (`"strict": true`)
- 启用未使用局部变量检查 (`"noUnusedLocals": true`)
- 启用未使用参数检查 (`"noUnusedParameters": true`)
- 禁止switch语句遗漏break检查 (`"noFallthroughCasesInSwitch": true`)

其`include`字段精确包含`src`目录下的所有`.ts`、`.tsx`和`.vue`文件，确保应用代码得到严格类型检查。

### Node.js运行时配置 (tsconfig.node.json)

该配置专为Vite配置文件等Node脚本设计：

- 设置`"composite": true`，支持项目引用
- `"moduleResolution": "bundler"` —— 使用打包器风格的模块解析，与Vite行为一致
- `"allowSyntheticDefaultImports": true` —— 允许对无默认导出的模块使用默认导入
- 仅包含`vite.config.ts`，避免对应用代码进行重复或不适用的检查

这种分工确保了不同运行环境的代码都能获得最合适的类型校验。

**Section sources**
- [tsconfig.app.json](file://advanced-tools-navigation/tsconfig.app.json#L1-L15)
- [tsconfig.node.json](file://tsconfig.node.json#L1-L10)
- [vite.config.ts](file://vite.config.ts#L1-L101)

## 模块隔离与构建工具兼容性

`"isolatedModules": true`是确保与Vite及其底层ESBuild兼容的关键配置。

### 问题背景

ESBuild等转译器一次只处理一个文件，无法像`tsc`那样进行跨文件的类型分析。某些TypeScript特性（如`export =`和`import =`）在孤立模块中无法安全转译。

### 项目实践

项目在`tsconfig.json`中全局启用`isolatedModules`，强制开发者避免使用不兼容的语法。例如：

- 使用`export default`而非`export =`
- 使用`import x from 'y'`而非`import x = require('y')`

此配置与Vite的快速开发服务器和生产构建流程无缝协作，确保开发与生产环境行为一致。

**Section sources**
- [tsconfig.json](file://tsconfig.json#L12)
- [vite.config.ts](file://vite.config.ts#L1-L101)

## 类型声明扩展机制

项目通过`.d.ts`文件扩展全局类型，提升类型安全性和开发体验。

### 环境类型声明 (env.d.ts)

该文件声明了两个关键类型：

1. `/// <reference types="vite/client" />` —— 引入Vite提供的客户端类型，支持`import.meta.env`等特有API的类型提示
2. `declare module "*.vue"` —— 声明所有`.vue`文件的类型，使TypeScript能正确识别Vue单文件组件的导入

### 全局对象扩展 (global.d.ts)

位于`src/types/global.d.ts`的文件扩展了`window`对象：

```ts
declare global {
  interface Window {
    addAdditionalTools: () => Promise<any[]>;
  }
}
```

此声明告知TypeScript全局存在`addAdditionalTools`函数，避免在`main.ts`中调用时出现类型错误。这与`src/utils/add-tools.ts`中的实现相对应，实现了类型与实现的分离。

**Section sources**
- [env.d.ts](file://env.d.ts#L1-L11)
- [src/types/global.d.ts](file://src/types/global.d.ts#L1-L7)
- [src/main.ts](file://src/main.ts#L1-L58)

## 路径映射与模块解析

项目通过`paths`配置和Vite的`alias`实现一致的模块路径映射。

### TypeScript配置 (tsconfig.json)

```json
"paths": {
  "@/*": ["./src/*"],
  "@config/*": ["./config/*"],
  "@scripts/*": ["./scripts/*"],
  "@docs/*": ["./docs/*"]
}
```

此配置允许使用`import x from '@/components/HelloWorld.vue'`的语法，提升代码可读性和重构便利性。

### Vite配置 (vite.config.ts)

Vite的`resolve.alias`配置与`tsconfig.json`保持完全一致：

```ts
alias: {
  "@": resolve(__dirname, "src"),
  "@config": resolve(__dirname, "config"),
  "@scripts": resolve(__dirname, "scripts"),
  "@docs": resolve(__dirname, "docs"),
}
```

这种一致性确保了TypeScript的类型解析和Vite的运行时模块解析指向同一位置，避免“模块未找到”等错误。

**Section sources**
- [tsconfig.json](file://tsconfig.json#L18-L24)
- [vite.config.ts](file://vite.config.ts#L45-L52)

## 类型检查范围控制

项目通过`include`和`exclude`字段精确控制类型检查的文件范围。

### include 字段

```json
"include": ["env.d.ts", "src/**/*", "src/**/*.vue", "vite.config.*", "supabase/**/*.ts"]
```

- `env.d.ts`：确保环境声明被包含
- `src/**/*` 和 `src/**/*.vue`：覆盖所有源码，包括Vue文件
- `vite.config.*`：匹配`vite.config.ts`等配置文件
- `supabase/**/*.ts`：包含Supabase相关的TypeScript文件

### exclude 字段

```json
"exclude": ["src/**/__tests__/*"]
```

明确排除测试文件，避免对测试代码应用应用级别的严格类型检查。这允许测试代码使用更灵活的类型，如`any`，而不影响主应用的类型安全。

**Section sources**
- [tsconfig.json](file://tsconfig.json#L25-L28)

## 典型类型错误排查

### 模块未找到 (Cannot find module)

**原因**：路径映射不一致或缺少类型声明  
**排查**：
1. 检查`tsconfig.json`的`paths`和`vite.config.ts`的`alias`是否匹配
2. 确认`.d.ts`声明文件是否正确声明了模块类型（如`*.vue`）
3. 运行`npx tsc --noEmit`验证类型错误

### 类型不匹配 (Type mismatch)

**案例**：调用`useSimpleTheme()`返回值结构与预期不符  
**排查**：
1. 检查`src/composables/useSimpleTheme.ts`的返回类型定义
2. 确认调用处的解构赋值与返回对象结构一致
3. 利用IDE的类型提示功能查看实际类型

### 全局变量类型错误

**案例**：`window.addAdditionalTools`提示不存在  
**修复**：
1. 确认`src/types/global.d.ts`已正确声明
2. 检查文件是否被TypeScript包含（通过`include`或被其他文件导入）
3. 确保`export {}`语句存在，使文件成为模块

**Section sources**
- [tsconfig.json](file://tsconfig.json#L25-L28)
- [env.d.ts](file://env.d.ts#L1-L11)
- [src/types/global.d.ts](file://src/types/global.d.ts#L1-L7)
- [src/composables/useSimpleTheme.ts](file://src/composables/useSimpleTheme.ts#L1-L110)

## 总结

本项目的TypeScript配置体系体现了现代前端工程化的最佳实践：

1. **分层配置**：通过`tsconfig.json`、`tsconfig.app.json`、`tsconfig.node.json`实现关注点分离
2. **工具兼容**：`isolatedModules`确保与Vite/ESBuild的无缝集成
3. **类型安全**：严格的`include/exclude`和`paths`配置，配合`.d.ts`文件扩展，提供全面的类型覆盖
4. **开发体验**：路径别名和精确的类型声明显著提升编码效率和重构信心

该配置体系不仅保障了代码质量，也为团队协作和项目长期维护奠定了坚实基础。

**Section sources**
- [tsconfig.json](file://tsconfig.json#L1-L28)
- [tsconfig.app.json](file://advanced-tools-navigation/tsconfig.app.json#L1-L15)
- [tsconfig.node.json](file://tsconfig.node.json#L1-L10)
- [env.d.ts](file://env.d.ts#L1-L11)
- [src/types/global.d.ts](file://src/types/global.d.ts#L1-L7)