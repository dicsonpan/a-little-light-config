// ============================================================
// 构建脚本：从 Vercel 环境变量注入 Supabase 配置到 js/config.js
//
// 环境变量：
//   SUPABASE_URL       — Supabase 项目 URL
//   SUPABASE_ANON_KEY  — Supabase anon key
// ============================================================

const fs = require('fs');
const path = require('path');

const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_ANON_KEY;

if (!url || !key) {
    console.warn('[config] SUPABASE_URL 或 SUPABASE_ANON_KEY 未设置，跳过注入');
    process.exit(0);
}

const configPath = path.join(__dirname, '..', 'js', 'config.js');
let content = fs.readFileSync(configPath, 'utf8');

content = content.replace(/__SUPABASE_URL__/g, url);
content = content.replace(/__SUPABASE_ANON_KEY__/g, key);

fs.writeFileSync(configPath, content);
console.log('[config] Supabase 环境变量已注入 js/config.js');
