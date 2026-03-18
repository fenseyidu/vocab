# VocabSmith - Word List Builder 项目文档

## 1. 项目概述

**项目名称**: VocabSmith - Word List Builder (Vocabulary Workbook)

**项目描述**: 一个用于创建、整理和打印精美英汉词汇工作表的 Web 应用。支持 AI 驱动的词汇润色和 PDF 导出功能。

**技术栈**:
- React 19.2.1
- TypeScript 5.8
- Vite 6.2
- Lucide React (图标)

## 2. 核心功能

### 2.1 词汇输入
- 格式: `English # Chinese` (使用 `#` 分隔中英文)
- 示例:
  ```
  Apple # 苹果
  Ambition # 野心
  To give up # 放弃
  ```

### 2.2 列表管理
- 保存词汇列表到 localStorage
- 加载已保存的列表
- 删除列表

### 2.4 打印/PDF 导出
- 浏览器原生打印功能
- 专为 A4 纸张优化的打印布局
- 包含: 序号、英文、音标、中文、默写栏

## 3. 数据结构

### WordPair (词汇对)
```typescript
interface WordPair {
  id: string;
  english: string;
  chinese: string;
  phonetic?: string;
}
```

### WordList (词汇列表)
```typescript
interface WordList {
  id: string;
  title: string;
  createdAt: number;
  words: WordPair[];
}
```

## 4. 项目文件结构

```
Vocabulary Workbook/
├── App.tsx                 # 主应用组件
├── index.tsx               # 入口文件
├── index.html              # HTML 模板
├── types.ts                # TypeScript 类型定义
├── package.json            # 项目依赖
├── vite.config.ts           # Vite 配置
├── tsconfig.json           # TypeScript 配置
├── metadata.json           # 应用元信息
├── README.md               # 项目说明
├── .gitignore              # Git 忽略配置
└── components/
    ├── InputArea.tsx       # 词汇输入组件
    └── PrintLayout.tsx     # 打印布局组件
```

## 5. 视图模式

- **INPUT 模式**: 输入词汇，支持手动处理或 AI 润色
- **PREVIEW 模式**: 预览词汇表，可编辑单词、删除单词、保存、打印
- **LISTS 模式**: 查看和管理已保存的列表

## 6. 列表卡片操作

### 6.1 列表级别操作
- 点击卡片进入查看/打印模式
- 点击编辑按钮进入编辑模式
- 点击删除按钮并确认删除

### 6.2 单词级别操作 (在 PREVIEW 模式)
- 点击单词行可编辑英文和中文
- 点击删除按钮可删除单个单词
- 修改后自动更新列表

## 7. 运行方式

## 6. 运行方式

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

## 7. 注意事项

- 打印布局使用 `print-only` CSS 类控制显示/隐藏
- localStorage 键名: `vocab_lists`
