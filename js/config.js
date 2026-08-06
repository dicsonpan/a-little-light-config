// ============================================================
// Supabase 配置 — 与固件 config.h 中的值保持一致
// ============================================================

const SUPABASE_URL = 'https://jndyzcoszencvjeswywj.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpuZHl6Y29zemVuY3ZqZXN3eXdqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM3Mzc1ODksImV4cCI6MjA5OTMxMzU4OX0.iGRNe0f7_WUcbxmk3PEqQGWWB9x_M_HT5dRRZYmAdrY';

// 创建 Supabase 客户端
const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

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
