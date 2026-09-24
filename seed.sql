-- ============================================================
--  Equipment Inspection Deferral - seed data
--
--  ตารางในไฟล์นี้คือข้อมูลตั้งต้นที่ "มีอยู่แล้ว" ในระบบ
--  ตารางสำหรับคำขอเลื่อนกำหนดตรวจสอบ ให้ผู้ทำโจทย์ออกแบบเอง
--
--  ถ้าคุณเลือกสร้าง schema ทั้งหมดผ่าน EF Migrations
--  ให้หยิบเฉพาะส่วน INSERT ด้านล่างไปใช้เป็นข้อมูลตั้งต้น
-- ============================================================

CREATE TABLE IF NOT EXISTS app_user (
    id          integer PRIMARY KEY,
    username    varchar(50)  NOT NULL UNIQUE,
    full_name   varchar(120) NOT NULL,
    role        varchar(30)  NOT NULL
);

COMMENT ON COLUMN app_user.role IS 'requester | supervisor | department_manager';

CREATE TABLE IF NOT EXISTS equipment (
    id             integer PRIMARY KEY,
    tag_no         varchar(30)  NOT NULL UNIQUE,
    name           varchar(120) NOT NULL,
    location       varchar(60)  NOT NULL,
    criticality    char(1)      NOT NULL CHECK (criticality IN ('A', 'B', 'C')),
    next_due_date  date         NOT NULL
);

-- ------------------------------------------------------------
--  Users
-- ------------------------------------------------------------
INSERT INTO app_user (id, username, full_name, role) VALUES
    (1, 'somchai.t',  'Somchai Thongdee',    'requester'),
    (2, 'nattaya.p',  'Nattaya Pornsawan',   'requester'),
    (3, 'wichai.k',   'Wichai Kaewsri',      'supervisor'),
    (4, 'pensri.m',   'Pensri Maneerat',     'supervisor'),
    (5, 'anan.s',     'Anan Siriwat',        'department_manager')
ON CONFLICT (id) DO NOTHING;

-- ------------------------------------------------------------
--  Equipment
--  next_due_date ผูกกับ CURRENT_DATE เพื่อให้ข้อมูลไม่หมดอายุ
--  มีทั้งที่เลยกำหนด ใกล้ครบกำหนด และยังอีกนาน
-- ------------------------------------------------------------
INSERT INTO equipment (id, tag_no, name, location, criticality, next_due_date) VALUES
    ( 1, 'PSV-1001', 'Pressure Safety Valve - Separator Inlet',  'Platform A - Deck 1', 'A', CURRENT_DATE - 12),
    ( 2, 'PSV-1002', 'Pressure Safety Valve - Gas Scrubber',     'Platform A - Deck 1', 'A', CURRENT_DATE - 3),
    ( 3, 'PSV-1003', 'Pressure Safety Valve - Test Separator',   'Platform A - Deck 2', 'A', CURRENT_DATE + 5),
    ( 4, 'PMP-2001', 'Main Export Pump',                          'Platform A - Deck 2', 'A', CURRENT_DATE + 9),
    ( 5, 'PMP-2002', 'Standby Export Pump',                       'Platform A - Deck 2', 'B', CURRENT_DATE + 14),
    ( 6, 'CMP-3001', 'Gas Compressor Train 1',                    'Platform B - Deck 1', 'A', CURRENT_DATE + 21),
    ( 7, 'CMP-3002', 'Gas Compressor Train 2',                    'Platform B - Deck 1', 'A', CURRENT_DATE + 45),
    ( 8, 'GEN-4001', 'Emergency Diesel Generator',                'Platform B - Deck 3', 'A', CURRENT_DATE + 2),
    ( 9, 'GEN-4002', 'Main Turbine Generator',                    'Platform B - Deck 3', 'A', CURRENT_DATE + 60),
    (10, 'FDT-5001', 'Fire Detection Panel - Zone 1',             'Platform A - Deck 1', 'A', CURRENT_DATE + 30),
    (11, 'FDT-5002', 'Fire Detection Panel - Zone 2',             'Platform A - Deck 2', 'B', CURRENT_DATE + 33),
    (12, 'HVC-6001', 'HVAC Unit - Control Room',                  'Platform A - Deck 3', 'C', CURRENT_DATE + 7),
    (13, 'HVC-6002', 'HVAC Unit - Accommodation',                 'Platform B - Deck 4', 'C', CURRENT_DATE + 70),
    (14, 'CRN-7001', 'Pedestal Crane - Port Side',                'Platform A - Deck 4', 'B', CURRENT_DATE - 6),
    (15, 'CRN-7002', 'Pedestal Crane - Starboard',                'Platform A - Deck 4', 'B', CURRENT_DATE + 18),
    (16, 'VSL-8001', 'Production Separator V-101',                'Platform B - Deck 2', 'A', CURRENT_DATE + 11),
    (17, 'VSL-8002', 'Flare Knockout Drum V-201',                 'Platform B - Deck 2', 'B', CURRENT_DATE + 27),
    (18, 'INS-9001', 'Level Transmitter LT-101',                  'Platform A - Deck 1', 'C', CURRENT_DATE + 4),
    (19, 'INS-9002', 'Flow Meter FT-205',                         'Platform B - Deck 1', 'C', CURRENT_DATE + 52),
    (20, 'ESD-1101', 'Emergency Shutdown Valve SDV-01',           'Platform A - Deck 1', 'A', CURRENT_DATE + 1)
ON CONFLICT (id) DO NOTHING;

-- sequence สำหรับกรณีที่ใช้ identity column ภายหลัง
SELECT setval(pg_get_serial_sequence('app_user',  'id'), (SELECT MAX(id) FROM app_user))
WHERE  pg_get_serial_sequence('app_user', 'id') IS NOT NULL;

SELECT setval(pg_get_serial_sequence('equipment', 'id'), (SELECT MAX(id) FROM equipment))
WHERE  pg_get_serial_sequence('equipment', 'id') IS NOT NULL;
