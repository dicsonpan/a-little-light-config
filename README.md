# 一点光 · 设备配置网站

> 跨时区家庭语音留言设备的配置中心 — 让相隔 8000 公里的家人，始终留一盏灯。

仓库地址：[github.com/dicsonpan/a-little-light-config](https://github.com/dicsonpan/a-little-light-config)

---

## 项目背景

**一点光（A Little Light）** 是一台基于 M5StickS3 的跨时区家庭语音留言设备。

它的诞生源于一个真实的场景：白亭（10 岁）和白梅两个在瑞士读书的孩子，与远在上海的妈妈相隔 8000 公里、6 小时时差。视频通话总要先问一句"你现在方便吗"，而一点光想做的，是让想念随时随地都能说出口、随时被听见——发一段语音，对方那盏灯就会亮起。

整个项目在 **TRAE AI** 的辅助下完成，从固件到云端再到本配置网站。这个仓库就是其中的**配置网站**部分：用户在这里注册登录、添加设备、配置角色与时区、建立设备之间的通信关系，设备则每 10 秒向云端轮询一次，自动同步所有变更。

---

## 网站功能

作为"一点光"设备的配置中心，本网站提供完整的设备生命周期管理：

1. **注册 / 登录**（基于 Supabase Auth，邮箱 + 密码）
2. **添加设备** — 输入设备上显示的 6 位设备 ID 即可绑定
3. **配置设备** — 设置显示名称、角色、时区、城市与坐标（用于天气）
4. **通信关系管理** — 可视化地配置设备之间谁能给谁留言
5. **自动同步** — 所有变更写入 Supabase 后，设备在下次轮询（每 10 秒）时自动获取

### 设备 ID

- 长度为 **6 位字符**，由大写字母和数字组成
- 为保证可读性，排除了容易混淆的字符：`0 / O / 1 / I / L`
- 在设备屏幕上以**两段分组**形式显示，例如 `K7M 3PQ`
- 获取方式：**三击设备的蓝色按钮**，屏幕即会显示设备 ID
- 设备 ID 一旦创建不可修改

### 角色与头像

每个设备需选择一个家庭角色，角色**决定设备上显示的头像**：

| 角色 value | 中文标签 |
|---|---|
| `mom` | 妈妈 |
| `dad` | 爸爸 |
| `older_brother` | 哥哥 |
| `younger_brother` | 弟弟 |
| `sister` | 姐姐 |
| `younger_sister` | 妹妹 |
| `grandma` | 奶奶 |
| `grandpa` | 爷爷 |
| `custom` | 自定义 |

共 8 种家庭角色加 1 个自定义选项，每个角色都有一幅专属的 16×16 像素风头像。头像风格由角色自动决定——数据库中的 `avatar_style` 字段会自动取 `role` 的值，无需独立配置。

> 说明：WiFi 配置与设备配对是两个独立的过程；设备的显示名称来自数据库 `devices.display_name` 字段，在网站上设置后即同步到设备。

---

## 技术栈

| 层 | 技术 | 说明 |
|---|---|---|
| 前端 | Vanilla HTML / CSS / JS | 无框架、无打包步骤，原生开发 |
| 后端 | Supabase | PostgreSQL 数据库 + Auth 认证 + Storage |
| 托管 | Vercel | 纯静态站点，从 GitHub 自动部署 |
| 字体 | Noto Sans SC | 通过 Google Fonts 加载 |
| 设计 | 暖色调 | 背景 `#FFF8F0`、主色 `#FF8C42`、辅色 `#FFD66B` |

构建时通过 `scripts/generate-config.js` 将 Vercel 环境变量注入 `js/config.js`（替换占位符），因此敏感配置不会进入代码仓库。

---

## 文件结构

```
web/
├── index.html                  # 入口页面（登录/注册 + 仪表盘）
├── vercel.json                 # Vercel 静态站点配置（含构建命令）
├── .gitignore
├── README.md                   # 本文件
├── assets/                     # 图标与 Logo 资源
│   ├── apple-touch-icon.png
│   ├── favicon-16.png
│   ├── favicon-32.png
│   ├── favicon.svg
│   └── logo.svg
├── css/
│   └── style.css               # 样式（暖色调设计系统）
├── js/
│   ├── config.js               # Supabase 配置 + 角色选项 + 时区列表
│   ├── ui.js                   # Toast 通知与 UI 工具函数
│   ├── supabase.js             # 数据库 CRUD 封装（设备 + 通信关系）
│   ├── auth.js                 # 登录 / 注册 / 登出
│   ├── dashboard.js            # 仪表盘：设备管理 + 通信关系管理
│   └── app.js                  # 应用入口（认证状态监听 + 初始化）
├── scripts/
│   └── generate-config.js      # Vercel 构建脚本（注入环境变量）
└── sql/
    └── migration.sql           # 数据库 Migration（owner_id + RLS 策略）
```

---

## 与固件的关系

网站与设备固件共享同一份 Supabase 数据，但访问方式不同：

- **网站**管理的数据存储在 Supabase 的 `devices` 与 `device_links` 表，使用 Supabase Auth 进行用户级身份认证。
- **固件**通过 anon key 直接读取同一张表，无需修改固件代码。
- 在网站创建 / 修改设备后，设备在**下次轮询（每 10 秒）**时自动获取最新配置。
- 数据库 RLS 策略保证了双重访问安全：
  - `anon` 角色：全访问（固件使用 anon key 所需）
  - `authenticated` 角色：只能管理 `owner_id` 为自己的设备，且只能在自己的设备之间建立通信关系

---

## 部署指南

### 1. 执行数据库 Migration

在 Supabase Dashboard → SQL Editor 中执行 `sql/migration.sql`。

此脚本会：

- 为 `devices` 表添加 `owner_id` 列（关联 `auth.users`，实现多用户隔离）
- 为 `devices` 表设置 RLS 策略：保留 anon 全访问（固件需要），authenticated 用户只能管理自己的设备
- 为 `device_links` 表设置 RLS 策略：用户只能在自己拥有的设备之间建立连接
- 保留 `pairing_requests` 与 `messages` 表的 anon 全访问

执行后，已有设备的 `owner_id` 为 `NULL`（未归属），可在网站端认领；新建设备时会自动绑定当前登录用户。

### 2. 配置 Supabase Auth

在 Supabase Dashboard → Authentication → Providers：

- 确认 Email 认证已开启
- 如需免邮箱确认（开发阶段），关闭 "Confirm email" 选项

### 3. 部署到 Vercel

#### 方式一：Git 部署（推荐）

1. 将代码推送到 GitHub 仓库 [dicsonpan/a-little-light-config](https://github.com/dicsonpan/a-little-light-config)
2. 登录 [Vercel](https://vercel.com) → New Project
3. Import 对应的 GitHub 仓库
4. Framework Preset 选择 **Other**（纯静态站点）
5. **设置环境变量**（关键步骤）：在 Project → Settings → Environment Variables 中添加：
   - `SUPABASE_URL` — 你的 Supabase 项目 URL
   - `SUPABASE_ANON_KEY` — 你的 Supabase anon key
6. Build Command 与 Output Directory 已在 `vercel.json` 中配置（`node scripts/generate-config.js` / `.`），无需手动填写
7. 点击 Deploy

部署完成后，每次 push 到 `main` 分支会自动触发重新部署，构建时会自动把环境变量注入 `js/config.js`。

#### 方式二：Vercel CLI

```bash
npm i -g vercel
cd web

# 设置环境变量
vercel env add SUPABASE_URL
vercel env add SUPABASE_ANON_KEY

# 部署到生产环境
vercel --prod
```

### 4. 验证

访问 Vercel 分配的 URL，注册账号后即可开始配置设备。三击设备蓝色按钮获取设备 ID，在网站添加设备并完成配置后，设备会在数秒内自动同步。

---

## 本地开发

本地开发时，`js/config.js` 中的 `SUPABASE_URL` 与 `SUPABASE_ANON_KEY` 为占位符，需手动替换为你的 Supabase 项目配置：

```js
const SUPABASE_URL = 'https://你的项目.supabase.co';
const SUPABASE_ANON_KEY = '你的 anon key';
```

也可直接运行构建脚本注入环境变量：

```bash
SUPABASE_URL=https://你的项目.supabase.co SUPABASE_ANON_KEY=你的key node scripts/generate-config.js
```

随后用任意静态服务器启动即可（注意：请勿将填好真实密钥的 `config.js` 提交到仓库）。

---

## 配置说明

- 角色选项与常用时区列表维护在 `js/config.js` 的 `ROLE_OPTIONS` 与 `TIMEZONE_OPTIONS` 中，可按需扩展。
- 更换 Supabase 项目时，更新 Vercel 环境变量 `SUPABASE_URL` / `SUPABASE_ANON_KEY` 即可，无需改动代码。

---

一点光，留给家人的那一盏灯。
