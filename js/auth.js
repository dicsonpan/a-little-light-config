// ============================================================
// 认证逻辑 — 登录 / 注册 / 登出
// ============================================================

/**
 * 切换登录/注册 Tab
 */
function switchAuthTab(tab) {
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const tabLogin = document.getElementById('tab-login');
    const tabRegister = document.getElementById('tab-register');
    const errorEl = document.getElementById('auth-error');

    errorEl.classList.add('hidden');

    if (tab === 'login') {
        loginForm.classList.remove('hidden');
        registerForm.classList.add('hidden');
        tabLogin.classList.add('active');
        tabRegister.classList.remove('active');
    } else {
        loginForm.classList.add('hidden');
        registerForm.classList.remove('hidden');
        tabLogin.classList.remove('active');
        tabRegister.classList.add('active');
    }
}

/**
 * 显示认证错误
 */
function showAuthError(message) {
    const errorEl = document.getElementById('auth-error');
    errorEl.textContent = message;
    errorEl.classList.remove('hidden');
}

/**
 * 处理登录
 */
async function handleLogin() {
    const email = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-password').value;

    if (!email || !password) {
        showAuthError('请填写邮箱和密码');
        return;
    }

    setButtonLoading('login-btn', true);

    const { data, error } = await sbClient.auth.signInWithPassword({
        email,
        password,
    });

    setButtonLoading('login-btn', false, '登录');

    if (error) {
        showAuthError(error.message);
        return;
    }

    // 登录成功，auth state listener 会处理页面切换
    showToast('登录成功', 'success');
}

/**
 * 处理注册
 */
async function handleRegister() {
    const email = document.getElementById('register-email').value.trim();
    const password = document.getElementById('register-password').value;
    const confirm = document.getElementById('register-confirm').value;

    if (!email || !password) {
        showAuthError('请填写邮箱和密码');
        return;
    }

    if (password.length < 6) {
        showAuthError('密码至少 6 位');
        return;
    }

    if (password !== confirm) {
        showAuthError('两次密码不一致');
        return;
    }

    setButtonLoading('register-btn', true);

    const { data, error } = await sbClient.auth.signUp({
        email,
        password,
    });

    setButtonLoading('register-btn', false, '注册');

    if (error) {
        showAuthError(error.message);
        return;
    }

    // 检查是否需要邮箱确认
    if (data.user && !data.session) {
        showAuthError('注册成功！请检查邮箱确认链接，确认后即可登录。');
        switchAuthTab('login');
        document.getElementById('login-email').value = email;
    } else if (data.session) {
        // 直接登录成功（未开启邮箱确认）
        showToast('注册成功', 'success');
    }
}

/**
 * 处理登出
 */
async function handleLogout() {
    await sbClient.auth.signOut();
    showToast('已退出登录', 'info');
}
