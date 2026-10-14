-- VaxCare MySQL schema. Safe to run repeatedly; existing rows are not deleted.
CREATE DATABASE IF NOT EXISTS vaxcare_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE vaxcare_db;

CREATE TABLE IF NOT EXISTS users (
  id BIGINT NOT NULL AUTO_INCREMENT,
  name VARCHAR(255),
  email VARCHAR(255),
  password VARCHAR(255),
  role VARCHAR(255),
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS booking (
  id BIGINT NOT NULL AUTO_INCREMENT,
  user_id BIGINT,
  center VARCHAR(255),
  vaccine VARCHAR(255),
  booking_date VARCHAR(255),
  booking_time VARCHAR(255),
  status VARCHAR(255),
  PRIMARY KEY (id),
  KEY idx_booking_user_id (user_id),
  CONSTRAINT fk_booking_user
    FOREIGN KEY (user_id) REFERENCES users (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS slot (
  id BIGINT NOT NULL AUTO_INCREMENT,
  center VARCHAR(255),
  vaccine VARCHAR(255),
  `date` VARCHAR(255),
  `time` VARCHAR(255),
  start_time VARCHAR(255),
  end_time VARCHAR(255),
  capacity INT NOT NULL,
  booked INT NOT NULL,
  PRIMARY KEY (id),
  KEY idx_slot_center_date (center, `date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS email_otp (
  id BIGINT NOT NULL AUTO_INCREMENT,
  email VARCHAR(255) NOT NULL,
  otp_hash VARCHAR(255) NOT NULL,
  expires_at DATETIME(6) NOT NULL,
  last_sent_at DATETIME(6) NOT NULL,
  attempts INT NOT NULL,
  verified BIT(1) NOT NULL,
  purpose VARCHAR(32),
  PRIMARY KEY (id),
  UNIQUE KEY uk_email_otp_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS login_history (
  id BIGINT NOT NULL AUTO_INCREMENT,
  user_id BIGINT,
  email VARCHAR(255),
  role VARCHAR(255),
  login_time DATETIME(6),
  PRIMARY KEY (id),
  KEY idx_login_history_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS vaccine (
  id BIGINT NOT NULL AUTO_INCREMENT,
  vaccine_name VARCHAR(255) NOT NULL,
  manufacturer VARCHAR(255),
  dose VARCHAR(255),
  description VARCHAR(255),
  available BIT(1) NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uk_vaccine_vaccine_name (vaccine_name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS vaccination_center (
  id BIGINT NOT NULL AUTO_INCREMENT,
  center_name VARCHAR(255) NOT NULL,
  location VARCHAR(255),
  contact VARCHAR(255),
  available BIT(1) NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uk_vaccination_center_center_name (center_name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS vaccination_record (
  id BIGINT NOT NULL AUTO_INCREMENT,
  booking_id BIGINT UNIQUE,
  user_id BIGINT,
  vaccine VARCHAR(255),
  vaccination_date VARCHAR(255),
  dose VARCHAR(255),
  status VARCHAR(255),
  PRIMARY KEY (id),
  KEY idx_vaccination_record_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
