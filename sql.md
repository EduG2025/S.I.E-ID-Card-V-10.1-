# S.I.E - Estrutura do Banco de Dados (Produção)

## 1. Schema (Estrutura)

```sql
SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- Tabela de Usuários
CREATE TABLE IF NOT EXISTS `users` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `username` varchar(50) DEFAULT NULL,
  `password_hash` varchar(255) DEFAULT NULL,
  `role` enum('ADMIN','PRESIDENT','VICE_PRESIDENT','SINDIC','RESIDENT','CONCIERGE','MERCHANT','COUNCIL') NOT NULL DEFAULT 'RESIDENT',
  `name` varchar(100) NOT NULL,
  `email` varchar(150) DEFAULT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `cpf_cnpj` varchar(20) DEFAULT NULL,
  `unit` varchar(50) DEFAULT NULL,
  `address` text,
  `avatar_url` text,
  `admission_date` date DEFAULT NULL,
  `active` tinyint(1) DEFAULT 1,
  `qr_code_data` varchar(255) DEFAULT NULL,
  `profile_completion` int(11) DEFAULT 0,
  `social_data_json` json DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`),
  UNIQUE KEY `qr_code_data` (`qr_code_data`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Configurações Financeiras do Usuário
CREATE TABLE IF NOT EXISTS `user_financial_settings` (
  `user_id` bigint(20) NOT NULL,
  `monthly_fee` decimal(10,2) DEFAULT 0.00,
  `due_day` int(11) DEFAULT 10,
  `is_donor` tinyint(1) DEFAULT 0,
  `donation_amount` decimal(10,2) DEFAULT 0.00,
  `auto_generate_charge` tinyint(1) DEFAULT 1,
  PRIMARY KEY (`user_id`),
  CONSTRAINT `fk_user_financial` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Lançamentos Financeiros
CREATE TABLE IF NOT EXISTS `financial_records` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `description` varchar(255) NOT NULL,
  `amount` decimal(12,2) NOT NULL,
  `type` enum('INCOME','EXPENSE') NOT NULL,
  `status` enum('PAID','PENDING','OVERDUE') NOT NULL,
  `date` date NOT NULL,
  `due_date` date DEFAULT NULL,
  `category` varchar(50) DEFAULT NULL,
  `user_id` bigint(20) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `fk_financial_user` (`user_id`),
  CONSTRAINT `fk_financial_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Configurações do Sistema
CREATE TABLE IF NOT EXISTS `system_settings` (
  `setting_key` varchar(50) NOT NULL,
  `setting_value` json NOT NULL,
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`setting_key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Alertas e Notificações
CREATE TABLE IF NOT EXISTS `alerts` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `title` varchar(200) DEFAULT NULL,
  `message` text DEFAULT NULL,
  `type` enum('INFO','WARNING','EMERGENCY','SUCCESS') DEFAULT NULL,
  `target_audience` varchar(50) DEFAULT NULL,
  `channels_json` json DEFAULT NULL,
  `sent_by_id` bigint(20) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Documentos Oficiais
CREATE TABLE IF NOT EXISTS `official_documents` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `title` varchar(200) NOT NULL,
  `type` varchar(50) NOT NULL,
  `content` longtext,
  `status` enum('DRAFT','FINAL') DEFAULT 'DRAFT',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET FOREIGN_KEY_CHECKS = 1;
```

## 2. Dados Fictícios (Seeds)

```sql
-- Inserir Admin Padrão (Senha: 123)
-- Nota: Em produção, o backend deve hashear esta senha.
INSERT INTO `users` (`username`, `password_hash`, `role`, `name`, `email`, `active`, `profile_completion`) VALUES
('admin', '$2b$10$Xw..HASH_SENHA_BCRYPT..', 'ADMIN', 'ADMINISTRADOR DO SISTEMA', 'admin@sie.com', 1, 100),
('presidente', '$2b$10$Xw..HASH_SENHA_BCRYPT..', 'PRESIDENT', 'CARLOS MENDES', 'carlos@sie.com', 1, 100),
('morador1', '$2b$10$Xw..HASH_SENHA_BCRYPT..', 'RESIDENT', 'ANA SILVA', 'ana@sie.com', 1, 80);

-- Configurações Financeiras Iniciais
INSERT INTO `user_financial_settings` (`user_id`, `monthly_fee`, `due_day`, `is_donor`) VALUES
(2, 0.00, 10, 1),
(3, 450.00, 10, 0);

-- Configuração do Sistema
INSERT INTO `system_settings` (`setting_key`, `setting_value`) VALUES
('general_info', '{"name": "ASSOCIAÇÃO MODELO", "cnpj": "00.000.000/0001-00", "address": "RUA EXEMPLO, 123", "enableMaps": true, "enableQuestionnaire": true}');

-- Registros Financeiros de Exemplo
INSERT INTO `financial_records` (`description`, `amount`, `type`, `status`, `date`, `category`) VALUES
('Mensalidade - Unid 101', 450.00, 'INCOME', 'PAID', CURDATE(), 'Mensalidade'),
('Manutenção Elevador', 1200.00, 'EXPENSE', 'PAID', CURDATE(), 'Manutenção'),
('Conta de Luz Área Comum', 850.00, 'EXPENSE', 'PENDING', DATE_ADD(CURDATE(), INTERVAL 5 DAY), 'Utilidades');

-- Alertas
INSERT INTO `alerts` (`title`, `message`, `type`, `target_audience`, `channels_json`, `sent_by_id`) VALUES
('Bem-vindo ao Novo Sistema', 'O sistema S.I.E está operando em fase final de testes.', 'SUCCESS', 'ALL', '["APP"]', 1);
```