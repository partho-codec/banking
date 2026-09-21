-- =============================================
--  Banking System — Full Database Migration
--  Run this in phpMyAdmin SQL tab
-- =============================================

-- Step 1: Create & use the database
CREATE DATABASE IF NOT EXISTS banking_system;
USE banking_system;

-- Step 2: Users table (with balance column)
CREATE TABLE IF NOT EXISTS users (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  name       VARCHAR(100)    NOT NULL,
  email      VARCHAR(150)    NOT NULL UNIQUE,
  password   VARCHAR(255)    NOT NULL,
  balance    DECIMAL(15,2)   NOT NULL DEFAULT 0.00,
  created_at TIMESTAMP       DEFAULT CURRENT_TIMESTAMP
);

-- Step 3: Transactions table
CREATE TABLE IF NOT EXISTS transactions (
  id           INT AUTO_INCREMENT PRIMARY KEY,
  from_user    INT            DEFAULT NULL,
  to_user      INT            DEFAULT NULL,
  type         ENUM('DEPOSIT','WITHDRAW','TRANSFER') NOT NULL,
  amount       DECIMAL(15,2)  NOT NULL,
  balance_after DECIMAL(15,2) NOT NULL,
  status       ENUM('SUCCESS','FAILED') NOT NULL DEFAULT 'SUCCESS',
  created_at   TIMESTAMP      DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (from_user) REFERENCES users(id) ON DELETE SET NULL,
  FOREIGN KEY (to_user)   REFERENCES users(id) ON DELETE SET NULL
);