-- One-time repair for the default administrator account created before
-- production started running the admin bootstrap script.
UPDATE `users`
SET
  `passwordHash` = '$2b$10$ETzKVAn7gFoIYTeGhbAr2ukigzf6e01M8CD2AYNWECiTcSxya1r5y',
  `role` = 'ADMIN',
  `status` = 'ACTIVE',
  `isVerified` = true
WHERE `email` = 'adminplanora@gmail.com';
