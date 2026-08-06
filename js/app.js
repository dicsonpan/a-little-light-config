// ============================================================
// 应用入口 — 认证状态监听 + 初始化
// ============================================================

/**
 * 显示认证页面
 */
function showAuthPage() {
    document.getElementById('auth-page').classList.remove('hidden');
    document.getElementById('app-page').classList.add('hidden');
}

/**
 * 显示主应用页面
 */
function showAppPage(user) {
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
    const { data: { session } } = await supabase.auth.getSession();

    if (session?.user) {
        showAppPage(session.user);
    } else {
        showAuthPage();
    }

    // 监听认证状态变化
    supabase.auth.onAuthStateChange((event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
            showAppPage(session.user);
        } else if (event === 'SIGNED_OUT') {
            setCurrentUserId(null);
            cachedDevices = [];
            showAuthPage();
        }
    });
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', initApp);
