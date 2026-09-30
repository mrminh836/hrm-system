-- Hardening Script for MySQL Database User Privileges (Sprint 2 US 19.0)
-- Restricts hrm_user to only necessary DML permissions (SELECT, INSERT, UPDATE, DELETE) on hrm_db

-- 1. Ensure user exists
CREATE USER IF NOT EXISTS 'hrm_user'@'%' IDENTIFIED BY 'hrm_secure_password_2026';

-- 2. Revoke all broad/administrative permissions
REVOKE ALL PRIVILEGES, GRANT OPTION FROM 'hrm_user'@'%';

-- 3. Grant only required application privileges on hrm_db
GRANT SELECT, INSERT, UPDATE, DELETE ON hrm_db.* TO 'hrm_user'@'%';

-- 4. Flush privileges to apply instantly
FLUSH PRIVILEGES;

-- 5. Verification query
SHOW GRANTS FOR 'hrm_user'@'%';
