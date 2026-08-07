// ============================================================
// Supabase 数据操作封装 — 设备 CRUD + 通信关系管理
// ============================================================

/**
 * 缓存当前登录用户 ID（由 app.js 在认证状态变化时设置）
 */
let _currentUserId = null;

/**
 * 设置当前用户 ID（供 app.js 调用）
 */
function setCurrentUserId(userId) {
    _currentUserId = userId;
}

/**
 * 获取当前登录用户 ID
 */
function getCurrentUserId() {
    return _currentUserId;
}

// ============================================================
// 设备管理
// ============================================================

/**
 * 获取当前用户的所有设备
 * @returns {Promise<{data: Array, error: Object|null}>}
 */
async function fetchDevices() {
    const { data, error } = await sbClient
        .from('devices')
        .select('*')
        .order('created_at', { ascending: true });
    return { data, error };
}

/**
 * 创建新设备
 * @param {Object} deviceData - 设备信息
 * @param {string} deviceData.device_code - 设备ID（三击设备蓝色按钮获取）
 * @param {string} deviceData.display_name - 显示名称
 * @param {string} deviceData.role - 角色
 * @param {string} deviceData.timezone - 时区
 * @param {string} deviceData.city_name - 城市名
 * @param {number} deviceData.latitude - 纬度
 * @param {number} deviceData.longitude - 经度
 * @param {string} deviceData.avatar_style - 头像风格（自动取 role 值，由角色决定头像）
 */
async function createDevice(deviceData) {
    const userId = getCurrentUserId();
    if (!userId) return { data: null, error: { message: '未登录' } };

    const { data, error } = await sbClient
        .from('devices')
        .insert([{ ...deviceData, owner_id: userId }])
        .select()
        .single();
    return { data, error };
}

/**
 * 更新设备
 * @param {string} deviceId - 设备 UUID
 * @param {Object} updates - 要更新的字段
 */
async function updateDevice(deviceId, updates) {
    const { data, error } = await sbClient
        .from('devices')
        .update(updates)
        .eq('id', deviceId)
        .select()
        .single();
    return { data, error };
}

/**
 * 删除设备（关联的 device_links 会级联删除）
 * @param {string} deviceId - 设备 UUID
 */
async function deleteDeviceById(deviceId) {
    const { error } = await sbClient
        .from('devices')
        .delete()
        .eq('id', deviceId);
    return { error };
}

// ============================================================
// 通信关系管理
// ============================================================

/**
 * 获取当前用户所有设备之间的连接
 * 需要查询 device_links 表，然后用设备信息补充显示
 */
async function fetchDeviceLinks() {
    // 先获取用户所有设备 ID
    const { data: devices, error: devError } = await fetchDevices();
    if (devError) return { data: null, error: devError };
    if (!devices || devices.length === 0) return { data: [], error: null };

    const deviceIds = devices.map(d => d.id);

    // 查询涉及这些设备的所有连接
    const { data: links, error } = await sbClient
        .from('device_links')
        .select('*')
        .or(`device_a_id.in.(${deviceIds.join(',')}),device_b_id.in.(${deviceIds.join(',')})`)
        .order('created_at', { ascending: true });

    if (error) return { data: null, error };

    // 用设备信息丰富连接数据
    const deviceMap = {};
    devices.forEach(d => { deviceMap[d.id] = d; });

    const enrichedLinks = (links || []).map(link => ({
        ...link,
        device_a: deviceMap[link.device_a_id] || null,
        device_b: deviceMap[link.device_b_id] || null,
    }));

    return { data: enrichedLinks, error: null };
}

/**
 * 创建设备连接
 * @param {string} deviceAId - 设备 A UUID
 * @param {string} deviceBId - 设备 B UUID
 */
async function createDeviceLink(deviceAId, deviceBId) {
    // 确保顺序一致（小的 UUID 在前），避免重复
    const [a, b] = [deviceAId, deviceBId].sort();

    const { data, error } = await sbClient
        .from('device_links')
        .insert([{ device_a_id: a, device_b_id: b }])
        .select()
        .single();
    return { data, error };
}

/**
 * 删除设备连接
 * @param {string} linkId - 连接记录 UUID
 */
async function deleteDeviceLink(linkId) {
    const { error } = await sbClient
        .from('device_links')
        .delete()
        .eq('id', linkId);
    return { error };
}
