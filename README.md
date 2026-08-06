# 一点光 · 设备配置网站

基于 Vercel + Supabase 的设备配置管理平台。

## 功能

- 用户注册/登录（Supabase Auth）
- 多设备管理：配置每个设备的角色名称、时区、城市、坐标、头像风格
- 通信关系管理：可视化配置设备之间的连接关系
- 数据隔离：每个用户只能管理自己的设备

## 部署步骤

### 1. 执行数据库 Migration

在 Supabase Dashboard → SQL Editor 中执行 `sql/migration.sql`。

此脚本会：
- 为 `devices` 表添加 `owner_id` 列（关联用户账户）
- 设置 RLS 策略：用户只能管理自己的设备
- 保留固件 anon key 的全访问权限

### 2. 配置 Supabase Auth

在 Supabase Dashboard → Authentication → Providers：
- 确认 Email 认证已开启
- 如需免邮箱确认（开发阶段），关闭 "Confirm email" 选项

### 3. 部署到 Vercel

#### 方式一：Git 部署（推荐）

1. 将代码推送到 GitHub 仓库
2. 登录 [Vercel](https://vercel.com) → New Project
3. Import 对应的 GitHub 仓库
4. Framework Preset 选择 **Other**（纯静态站点）
5. 无需 Build command，Output Directory 保持默认
6. 点击 Deploy

部署完成后，每次 push 到 main 分支会自动触发重新部署。

#### 方式二：Vercel CLI

```bash
npm i -g vercel
cd web
vercel --prod
```

### 4. 验证

访问 Vercel 分配的 URL，注册账号后即可开始配置设备。

## 文件结构

```
web/
├── index.html          # 入口页面
├── vercel.json         # Vercel 静态站点配置
├── css/
│   └── style.css       # 样式（暖色调设计）
├── js/
│   ├── config.js       # Supabase 配置 + 角色选项
│   ├── ui.js           # Toast 通知等 UI 工具
│   ├── supabase.js     # 数据库 CRUD 封装
│   ├── auth.js         # 登录/注册/登出
│   ├── dashboard.js    # 设备管理 + 通信关系
│   └── app.js          # 应用入口
├── sql/
│   └── migration.sql   # 数据库 Migration
└── README.md           # 本文件
```

## 配置说明

如需更换 Supabase 项目，修改 `js/config.js` 中的 `SUPABASE_URL` 和 `SUPABASE_ANON_KEY`。

角色选项和时区列表也在 `js/config.js` 中维护，可按需扩展。

## 与固件的关系

- 网站管理的数据存储在 Supabase 的 `devices` 和 `device_links` 表
- 固件通过 anon key 直接读取同一张表，无需修改固件代码
- 在网站创建/修改设备后，设备下次启动或轮询时会自动获取最新配置
