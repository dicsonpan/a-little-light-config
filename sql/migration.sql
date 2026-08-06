-- ============================================================
-- 一点光 (A Little Light) — 用户账户 Migration
-- 在 Supabase SQL Editor 中执行此脚本
-- 功能：为 devices 表添加 owner_id，实现多用户隔离
-- ============================================================

-- 1. 为 devices 表添加 owner_id 列（关联 auth.users）
ALTER TABLE devices ADD COLUMN IF NOT EXISTS owner_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- 2. 将已有设备的 owner_id 设为 NULL（未归属），待网站端认领

-- 3. 更新 devices 表 RLS 策略
--    保留 anon 全访问（固件使用 anon key）
--    新增 authenticated 用户只能管理自己的设备
ALTER TABLE devices ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_all_devices" ON devices;
DROP POLICY IF EXISTS "auth_own_devices" ON devices;

-- anon 角色：全访问（固件需要）
CREATE POLICY "anon_all_devices" ON devices FOR ALL TO anon USING (true) WITH CHECK (true);

-- authenticated 角色：只能管理 owner_id = 自己 的设备
CREATE POLICY "auth_own_devices" ON devices FOR ALL TO authenticated
    USING (owner_id = auth.uid())
    WITH CHECK (owner_id = auth.uid());

-- 4. 更新 device_links 表 RLS 策略
--    用户只能管理自己拥有的设备之间的连接
ALTER TABLE device_links ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_all_device_links" ON device_links;
DROP POLICY IF EXISTS "auth_own_device_links" ON device_links;

-- anon 角色：全访问（固件需要）
CREATE POLICY "anon_all_device_links" ON device_links FOR ALL TO anon USING (true) WITH CHECK (true);

-- authenticated 角色：只能管理自己设备之间的连接
CREATE POLICY "auth_own_device_links" ON device_links FOR ALL TO authenticated
    USING (
        EXISTS (SELECT 1 FROM devices WHERE id = device_a_id AND owner_id = auth.uid())
        AND EXISTS (SELECT 1 FROM devices WHERE id = device_b_id AND owner_id = auth.uid())
    )
    WITH CHECK (
        EXISTS (SELECT 1 FROM devices WHERE id = device_a_id AND owner_id = auth.uid())
        AND EXISTS (SELECT 1 FROM devices WHERE id = device_b_id AND owner_id = auth.uid())
    );

-- 5. 更新 pairing_requests 表 RLS（保留 anon 全访问）
DROP POLICY IF EXISTS "anon_all_pairing_requests" ON pairing_requests;
CREATE POLICY "anon_all_pairing_requests" ON pairing_requests FOR ALL TO anon USING (true) WITH CHECK (true);

-- 6. 更新 messages 表 RLS（保留 anon 全访问）
DROP POLICY IF EXISTS "anon_all_messages" ON messages;
CREATE POLICY "anon_all_messages" ON messages FOR ALL TO anon USING (true) WITH CHECK (true);

-- 7. 创建触发器：新用户注册时自动处理（可选，预留扩展）
-- 当前版本不需要额外处理，用户注册后手动在网站创建设备

-- ============================================================
-- 执行完毕后：
-- 1. 已有设备 owner_id 为 NULL，需在网站端认领
-- 2. 新建设备时会自动绑定当前登录用户
-- 3. 固件使用 anon key 仍可正常读写所有数据
-- ============================================================
