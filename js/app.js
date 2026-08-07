// ============================================================
// 应用入口 — 着陆页 + 认证状态监听 + 初始化
// ============================================================

/**
 * 从着陆页进入应用（登录/注册或直接进入仪表盘）
 */
function enterApp() {
    document.getElementById('landing-page').classList.add('hidden');
    // 检查是否已登录
    const { data: { session } } = sbClient.auth.getSession();
    if (session?.user) {
        showAppPage(session.user);
    } else {
        showAuthPage();
    }
}

/**
 * 显示着陆页
 */
function showLandingPage() {
    document.getElementById('landing-page').classList.remove('hidden');
    document.getElementById('auth-page').classList.add('hidden');
    document.getElementById('app-page').classList.add('hidden');
}

/**
 * 显示认证页面
 */
function showAuthPage() {
    document.getElementById('landing-page').classList.add('hidden');
    document.getElementById('auth-page').classList.remove('hidden');
    document.getElementById('app-page').classList.add('hidden');
}

/**
 * 显示主应用页面
 */
function showAppPage(user) {
    document.getElementById('landing-page').classList.add('hidden');
    document.getElementById('auth-page').classList.add('hidden');
    document.getElementById('app-page').classList.remove('hidden');

    // 缓存用户 ID（供 supabase.js 使用）
    setCurrentUserId(user.id);

    // 显示用户邮箱
    document.getElementById('user-email').textContent = user.email;

    // 加载数据
    loadDevices();
}

/**
 * 初始化应用
 */
async function initApp() {
    // 检查当前会话
    const { data: { session } } = await sbClient.auth.getSession();

    if (session?.user) {
        showAppPage(session.user);
    } else {
        // 未登录时显示着陆页
        showLandingPage();
    }

    // 监听认证状态变化
    sbClient.auth.onAuthStateChange((event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
            showAppPage(session.user);
        } else if (event === 'SIGNED_OUT') {
            setCurrentUserId(null);
            cachedDevices = [];
            showLandingPage();
        }
    });
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', initApp);
