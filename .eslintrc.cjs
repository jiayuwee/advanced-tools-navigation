module.exports = {
  root: true,
  env: {
    node: true,
    browser: true,
    es2021: true,
  },
  extends: [
    "plugin:vue/vue3-recommended",
    "plugin:@typescript-eslint/recommended",
    "@vue/eslint-config-typescript",
    "@vue/eslint-config-prettier",
  ],
  parser: "vue-eslint-parser",
  parserOptions: {
    parser: "@typescript-eslint/parser",
    ecmaVersion: 2021,
    sourceType: "module",
    extraFileExtensions: [".vue"],
  },
  rules: {
    // TypeScript 规则
    "no-unused-vars": "off", // 关闭基础规则
    "@typescript-eslint/no-unused-vars": "error", // 启用 TypeScript 版本
    "@typescript-eslint/no-explicit-any": "warn", // any 类型警告
    "@typescript-eslint/ban-ts-comment": "warn", // ts-ignore 警告
    "@typescript-eslint/no-this-alias": "warn", // this 别名警告
    "@typescript-eslint/no-var-requires": "warn", // require 语句警告

    // Vue 规则
    "vue/require-default-prop": "warn", // 需要默认 prop 值
    "vue/multi-word-component-names": "off", // 允许单词组件名
    "vue/no-unused-vars": "error", // Vue 模板中的未使用变量

    // 通用规则
    "no-console": "off", // 允许 console
    "no-debugger": "warn", // debugger 警告
    "prefer-const": "error", // 优先使用 const
    "no-var": "error", // 禁用 var
  },
  overrides: [
    {
      files: ["*.vue"],
      rules: {
        // Vue 文件特定规则
        "@typescript-eslint/no-unused-vars": "off", // Vue 文件中关闭，由 vue/no-unused-vars 处理
      },
    },
  ],
};
