// ============================================================
// Supabase 配置
// 占位符由 Vercel 构建脚本 scripts/generate-config.js 从环境变量注入
// 本地开发时请手动替换 __SUPABASE_URL__ 和 __SUPABASE_ANON_KEY__
// 环境变量名：SUPABASE_URL / SUPABASE_ANON_KEY
// ============================================================

const SUPABASE_URL = '__SUPABASE_URL__';
const SUPABASE_ANON_KEY = '__SUPABASE_ANON_KEY__';

// 创建 Supabase 客户端
// 注意：CDN 的 UMD 包会在 window.supabase 上挂载 createClient，
// 这里用 sbClient 避免与 UMD 全局变量重名冲突。
const sbClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// 设备角色选项（与固件 config.h 对应）
const ROLE_OPTIONS = [
    { value: 'mom',              label: '妈妈',     avatar: 'mom' },
    { value: 'older_brother',    label: '哥哥',     avatar: 'older_brother' },
    { value: 'younger_brother',  label: '弟弟',     avatar: 'younger_brother' },
    { value: 'dad',              label: '爸爸',     avatar: 'dad' },
    { value: 'sister',           label: '姐姐',     avatar: 'sister' },
    { value: 'grandma',          label: '奶奶',     avatar: 'grandma' },
    { value: 'grandpa',          label: '爷爷',     avatar: 'grandpa' },
    { value: 'custom',           label: '自定义',   avatar: 'default' },
];

// 常用时区
const TIMEZONE_OPTIONS = [
    'Asia/Shanghai',
    'Europe/Zurich',
    'Asia/Tokyo',
    'Asia/Seoul',
    'Asia/Singapore',
    'America/Los_Angeles',
    'America/New_York',
    'Europe/London',
    'Europe/Paris',
    'Australia/Sydney',
];
