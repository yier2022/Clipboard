# Clipboard (D1版)

一个基于 Cloudflare D1 (SQLite) 构建的极简、安全、支持 PWA 的跨设备剪贴板与文件中转站。

![License](https://img.shields.io/badge/license-MIT-blue.svg)

## ✨ 特性

*   **纯 D1 架构**：利用 SQLite 的强大查询能力，支持排序、搜索，无需 R2/KV。
*   **PWA 支持**：可安装到桌面或手机主屏幕，离线加载 UI。
*   **附件存储**：文件直接存入数据库 (BLOB)，适合代码片段、图片、文档分享。
*   **安全**：全站密码保护。

## 🚀 部署指南 (Cloudflare Pages)

### 第一步：创建 D1 数据库

1.  登录 [Cloudflare Dashboard](https://dash.cloudflare.com/)。
2.  进入 **Workers & Pages** -> **D1**。
3.  点击 **Create database**。
4.  名称输入 `clipboard-db`，点击创建。
5.  **复制 Database ID** (一串 UUID，例如 `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`)。

### 第二步：修改配置

1.  打开项目中的 `wrangler.toml` 文件。
2.  找到 `database_id = "..."` 这一行，填入你刚才复制的 ID。
3.  提交代码到 GitHub。

### 第三步：连接项目

1.  进入 **Workers & Pages** -> **Pages** -> **Create aplication** -> **Connect to Git**。
2.  选择你的仓库。
3.  **Build Settings**:
    *   **Build command**: `npm run build`
    *   **Build output directory**: `dist`
4.  保存并部署。

### 第四步：绑定数据库与初始化 (最关键一步)

部署初步成功后，应用还无法运行，因为数据库没绑定且没表结构。

1.  **绑定数据库**：
    *   进入 Pages 项目 -> **Settings** -> **Functions**。
    *   找到 **D1 Database Bindings**。
    *   **Variable name**: `DB` (必须是大写 DB)。
    *   **D1 database**: 选择你刚才创建的 `clipboard-db`。
    *   保存。

2.  **设置密码 (必须配置)**：
    *   进入 **Settings** -> **Environment variables**。
    *   添加变量名 `AUTH_PASSWORD`，值为你的访问密码（建议使用强密码）。
    *   **重要**：此项必须设置，否则应用将无法正常工作。项目已移除默认密码以提高安全性。

3.  **初始化表结构 (重要)**：
    *   Cloudflare Pages 目前后台界面不能直接运行 SQL。你需要使用本地命令行，或者使用 D1 的后台控制台。
    *   **方法 A (后台控制台 - 推荐)**:
        1. 回到 Cloudflare Dashboard -> **Workers & Pages** -> **D1** -> 点击 `clipboard-db`。
        2. 点击 **Console** 标签页。
        3. 打开项目里的 `schema.sql` 文件，复制**所有内容**。
        4. 粘贴到控制台输入框，点击 **Execute**。
        5. 看到 "Success" 字样即表示数据库表创建成功。

### 🎉 完成

重新部署一次（Deployments -> Retry deployment）以确保绑定生效。然后访问你的域名即可。

## 注意事项

*   **文件大小限制**：由于 Cloudflare Worker/D1 的限制，单次上传文件建议在 10MB 以内。主要用于代码、文档、截图分享。
*   **D1 免费额度**：5GB 存储，250 亿次读取/月。个人使用几乎用不完。
