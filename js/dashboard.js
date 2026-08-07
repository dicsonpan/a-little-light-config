// ============================================================
// 仪表盘逻辑 — 设备管理 + 通信关系管理
// ============================================================

// 缓存当前用户的设备列表（供通信关系页面使用）
let cachedDevices = [];

// ============================================================
// Tab 切换
// ============================================================

function switchMainTab(tab) {
    const tabDevices = document.getElementById('tab-devices');
    const tabConnections = document.getElementById('tab-connections');
    const panelDevices = document.getElementById('panel-devices');
    const panelConnections = document.getElementById('panel-connections');

    if (tab === 'devices') {
        tabDevices.classList.add('active');
        tabConnections.classList.remove('active');
        panelDevices.classList.remove('hidden');
        panelConnections.classList.add('hidden');
    } else {
        tabDevices.classList.remove('active');
        tabConnections.classList.add('active');
        panelDevices.classList.add('hidden');
        panelConnections.classList.remove('hidden');
        loadConnections();
    }
}

// ============================================================
// 设备管理
// ============================================================

/**
 * 加载设备列表
 */
async function loadDevices() {
    const container = document.getElementById('device-list');
    container.innerHTML = '<div class="loading-spinner">加载中...</div>';

    const { data, error } = await fetchDevices();

    if (error) {
        container.innerHTML = `<div class="loading-spinner">加载失败：${escapeHtml(error.message)}</div>`;
        return;
    }

    cachedDevices = data || [];

    if (cachedDevices.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                    <rect x="5" y="2" width="14" height="20" rx="2"/>
                    <line x1="12" y1="18" x2="12" y2="18"/>
                </svg>
                <h3>还没有设备</h3>
                <p>三击设备蓝色按钮获取设备ID，然后点击「添加设备」</p>
            </div>
        `;
        return;
    }

    container.innerHTML = cachedDevices.map(device => `
        <div class="device-card" onclick="openDeviceModal('${device.id}')">
            <div class="device-card-header">
                <div class="device-avatar">${escapeHtml(getAvatarInitial(device.display_name))}</div>
                <div class="device-card-info">
                    <h3>${escapeHtml(device.display_name)}</h3>
                    <span class="device-card-code">${escapeHtml(device.device_code)}</span>
                </div>
            </div>
            <div class="device-card-meta">
                <span class="meta-tag">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="12" cy="12" r="10"/>
                        <path d="M12 6v6l4 2"/>
                    </svg>
                    ${escapeHtml(getRoleLabel(device.role))}
                </span>
                ${device.city_name ? `
                <span class="meta-tag">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/>
                        <circle cx="12" cy="10" r="3"/>
                    </svg>
                    ${escapeHtml(device.city_name)}
                </span>` : ''}
                ${device.timezone ? `
                <span class="meta-tag">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="12" cy="12" r="10"/>
                        <line x1="2" y1="12" x2="22" y2="12"/>
                    </svg>
                    ${escapeHtml(device.timezone)}
                </span>` : ''}
            </div>
        </div>
    `).join('');
}

// ============================================================
// 设备编辑弹窗
// ============================================================

/**
 * 打开设备弹窗（新增或编辑）
 * @param {string|null} deviceId - 设备 ID，null 表示新增
 */
function openDeviceModal(deviceId = null) {
    const modal = document.getElementById('device-modal');
    const title = document.getElementById('device-modal-title');
    const deleteBtn = document.getElementById('device-delete-btn');
    const codeInput = document.getElementById('device-code');

    // 填充角色选项
    const roleSelect = document.getElementById('device-role');
    roleSelect.innerHTML = ROLE_OPTIONS.map(r =>
        `<option value="${r.value}">${r.label}</option>`
    ).join('');

    // 填充时区选项
    const tzSelect = document.getElementById('device-timezone');
    tzSelect.innerHTML = TIMEZONE_OPTIONS.map(tz =>
        `<option value="${tz}">${tz}</option>`
    ).join('');

    if (deviceId) {
        // 编辑模式
        const device = cachedDevices.find(d => d.id === deviceId);
        if (!device) return;

        title.textContent = '编辑设备';
        deleteBtn.classList.remove('hidden');

        document.getElementById('device-id').value = device.id;
        document.getElementById('device-code').value = device.device_code;
        document.getElementById('device-code').disabled = true;
        document.getElementById('device-display-name').value = device.display_name || '';
        document.getElementById('device-role').value = device.role || 'custom';
        document.getElementById('device-timezone').value = device.timezone || 'Asia/Shanghai';
        document.getElementById('device-city').value = device.city_name || '';
        document.getElementById('device-lat').value = device.latitude || '';
        document.getElementById('device-lon').value = device.longitude || '';
    } else {
        // 新增模式
        title.textContent = '添加设备';
        deleteBtn.classList.add('hidden');

        document.getElementById('device-form').reset();
        document.getElementById('device-id').value = '';
        document.getElementById('device-code').disabled = false;
        document.getElementById('device-role').value = 'mom';
        document.getElementById('device-timezone').value = 'Asia/Shanghai';
    }

    modal.classList.remove('hidden');
}

/**
 * 关闭设备弹窗
 */
function closeDeviceModal() {
    document.getElementById('device-modal').classList.add('hidden');
}

/**
 * 保存设备（新增或更新）
 */
async function saveDevice() {
    const deviceId = document.getElementById('device-id').value;
    const code = document.getElementById('device-code').value.trim().toUpperCase();
    const displayName = document.getElementById('device-display-name').value.trim();
    const role = document.getElementById('device-role').value;
    const timezone = document.getElementById('device-timezone').value;
    const city = document.getElementById('device-city').value.trim();
    const lat = parseFloat(document.getElementById('device-lat').value) || 0;
    const lon = parseFloat(document.getElementById('device-lon').value) || 0;

    // 验证必填字段
    if (!code) { showToast('请填写设备ID', 'error'); return; }
    if (!displayName) { showToast('请填写显示名称', 'error'); return; }

    const deviceData = {
        device_code: code,
        display_name: displayName,
        role,
        avatar_style: role,
        timezone,
        city_name: city,
        latitude: lat,
        longitude: lon,
    };

    setButtonLoading('device-save-btn', true);

    if (deviceId) {
        // 更新（不含 device_code，因为不可修改）
        const { data, error } = await updateDevice(deviceId, {
            display_name: displayName,
            role,
            avatar_style: role,
            timezone,
            city_name: city,
            latitude: lat,
            longitude: lon,
        });

        setButtonLoading('device-save-btn', false, '保存');

        if (error) {
            showToast('保存失败：' + error.message, 'error');
            return;
        }
        showToast('设备已更新', 'success');
    } else {
        // 新增
        const { data, error } = await createDevice(deviceData);

        setButtonLoading('device-save-btn', false, '保存');

        if (error) {
            if (error.code === '23505') {
                showToast('该设备ID已存在，请检查设备ID是否正确', 'error');
            } else {
                showToast('创建失败：' + error.message, 'error');
            }
            return;
        }
        showToast('设备已创建', 'success');
    }

    closeDeviceModal();
    await loadDevices();
}

/**
 * 删除设备
 */
async function deleteDevice() {
    const deviceId = document.getElementById('device-id').value;
    if (!deviceId) return;

    if (!confirm('确定删除此设备？相关的通信关系也会一并删除。')) return;

    setButtonLoading('device-save-btn', true);

    const { error } = await deleteDeviceById(deviceId);

    setButtonLoading('device-save-btn', false, '保存');

    if (error) {
        showToast('删除失败：' + error.message, 'error');
        return;
    }

    showToast('设备已删除', 'success');
    closeDeviceModal();
    await loadDevices();
}

// ============================================================
// 通信关系管理
// ============================================================

/**
 * 加载通信关系页面
 */
async function loadConnections() {
    // 填充设备下拉框
    const selectA = document.getElementById('link-device-a');
    const selectB = document.getElementById('link-device-b');

    const optionsHtml = '<option value="">选择设备</option>' +
        cachedDevices.map(d =>
            `<option value="${d.id}">${escapeHtml(d.display_name)} (${escapeHtml(d.device_code)})</option>`
        ).join('');

    selectA.innerHTML = optionsHtml;
    selectB.innerHTML = optionsHtml;

    // 加载已有连接
    const listContainer = document.getElementById('connection-list');
    listContainer.innerHTML = '<div class="loading-spinner">加载中...</div>';

    const { data: links, error } = await fetchDeviceLinks();

    if (error) {
        listContainer.innerHTML = `<div class="loading-spinner">加载失败：${escapeHtml(error.message)}</div>`;
        return;
    }

    if (!links || links.length === 0) {
        listContainer.innerHTML = `
            <div class="empty-state">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                    <circle cx="6" cy="12" r="3"/>
                    <circle cx="18" cy="6" r="3"/>
                    <circle cx="18" cy="18" r="3"/>
                </svg>
                <h3>还没有连接</h3>
                <p>在上方选择两个设备进行连接</p>
            </div>
        `;
        return;
    }

    listContainer.innerHTML = links.map(link => {
        const a = link.device_a;
        const b = link.device_b;
        if (!a || !b) return '';
        return `
            <div class="connection-item">
                <div class="connection-device">
                    <div class="connection-device-avatar">${escapeHtml(getAvatarInitial(a.display_name))}</div>
                    <div>
                        <div class="connection-device-name">${escapeHtml(a.display_name)}</div>
                        <div class="connection-device-code">${escapeHtml(a.device_code)}</div>
                    </div>
                </div>
                <div class="connection-link-icon">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="5" y1="12" x2="19" y2="12"/>
                        <polyline points="12,5 19,12 12,19"/>
                    </svg>
                </div>
                <div class="connection-device">
                    <div class="connection-device-avatar">${escapeHtml(getAvatarInitial(b.display_name))}</div>
                    <div>
                        <div class="connection-device-name">${escapeHtml(b.display_name)}</div>
                        <div class="connection-device-code">${escapeHtml(b.device_code)}</div>
                    </div>
                </div>
                <button class="btn btn-ghost btn-sm" onclick="removeLink('${link.id}')">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="18" y1="6" x2="6" y2="18"/>
                        <line x1="6" y1="6" x2="18" y2="18"/>
                    </svg>
                </button>
            </div>
        `;
    }).join('');
}

/**
 * 创建设备连接
 */
async function createLink() {
    const deviceAId = document.getElementById('link-device-a').value;
    const deviceBId = document.getElementById('link-device-b').value;

    if (!deviceAId || !deviceBId) {
        showToast('请选择两个设备', 'error');
        return;
    }

    if (deviceAId === deviceBId) {
        showToast('不能连接同一个设备', 'error');
        return;
    }

    const { data, error } = await createDeviceLink(deviceAId, deviceBId);

    if (error) {
        if (error.code === '23505') {
            showToast('这两个设备已经连接过了', 'error');
        } else {
            showToast('连接失败：' + error.message, 'error');
        }
        return;
    }

    showToast('连接已创建', 'success');

    // 重置选择框
    document.getElementById('link-device-a').value = '';
    document.getElementById('link-device-b').value = '';

    await loadConnections();
}

/**
 * 删除设备连接
 */
async function removeLink(linkId) {
    const { error } = await deleteDeviceLink(linkId);

    if (error) {
        showToast('删除失败：' + error.message, 'error');
        return;
    }

    showToast('连接已删除', 'success');
    await loadConnections();
}
