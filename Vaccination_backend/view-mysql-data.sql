USE vaxcare_db;

-- Row counts for every application table.
SELECT 'users' AS table_name, COUNT(*) AS row_count FROM users
UNION ALL SELECT 'booking', COUNT(*) FROM booking
UNION ALL SELECT 'slot', COUNT(*) FROM slot
UNION ALL SELECT 'email_otp', COUNT(*) FROM email_otp
UNION ALL SELECT 'login_history', COUNT(*) FROM login_history
UNION ALL SELECT 'vaccine', COUNT(*) FROM vaccine
UNION ALL SELECT 'vaccination_center', COUNT(*) FROM vaccination_center
UNION ALL SELECT 'vaccination_record', COUNT(*) FROM vaccination_record;

-- User details, excluding password hashes.
SELECT id, name, role FROM users ORDER BY id;

SELECT id, center, `date`, `time`, capacity, booked
FROM slot
ORDER BY `date`, center, `time`;

SELECT id, user_id, role, login_time
FROM login_history
ORDER BY login_time DESC;

-- OTP hashes are deliberately excluded from this result.
SELECT id, purpose, expires_at, attempts, verified
FROM email_otp
ORDER BY id;

SELECT id, user_id, center, vaccine, booking_date, booking_time, status
FROM booking
ORDER BY id;

SELECT id, vaccine_name, manufacturer, dose, description, available
FROM vaccine
ORDER BY vaccine_name;

SELECT id, center_name, location, contact, available
FROM vaccination_center
ORDER BY center_name;

SELECT id, user_id, vaccine, vaccination_date, dose, status
FROM vaccination_record
ORDER BY id;
