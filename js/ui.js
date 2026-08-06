// ============================================================
// UI 工具函数 — Toast 通知、表单辅助等
// ============================================================

/**
 * 显示 Toast 通知
 * @param {string} message - 消息内容
 * @param {'success'|'error'|'info'} type - 通知类型
 * @param {number} duration - 持续时间（毫秒）
 */
function showToast(message, type = 'info', duration = 3000) {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    container.appendChild(toast);

    setTimeout(() => {
        toast.style.animation = 'toastSlide 0.3s ease reverse';
        setTimeout(() => toast.remove(), 300);
    }, duration);
}

/**
 * 获取角色显示标签
 */
function getRoleLabel(roleValue) {
    const role = ROLE_OPTIONS.find(r => r.value === roleValue);
    return role ? role.label : roleValue;
}

/**
 * 获取角色对应的首字（用于头像占位）
 */
function getAvatarInitial(displayName) {
    if (!displayName) return '?';
    return displayName.charAt(0);
}

/**
 * HTML 转义，防止 XSS
 */
function escapeHtml(text) {
    if (text == null) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

/**
 * 禁用/启用按钮（防止重复提交）
 */
function setButtonLoading(btnId, loading, originalText) {
    const btn = document.getElementById(btnId);
    if (!btn) return;
    if (loading) {
        btn.dataset.originalText = btn.textContent;
        btn.disabled = true;
        btn.textContent = '处理中...';
    } else {
        btn.disabled = false;
        btn.textContent = originalText || btn.dataset.originalText || btn.textContent;
    }
}
