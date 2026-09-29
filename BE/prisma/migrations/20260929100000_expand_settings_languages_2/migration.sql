ALTER TABLE `user_settings` MODIFY `language`
ENUM('VI', 'EN', 'JA', 'KO', 'ZH', 'FR', 'DE', 'ES', 'RU', 'TH', 'IT', 'HI')
NOT NULL DEFAULT 'VI';
