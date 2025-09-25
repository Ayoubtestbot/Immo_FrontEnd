INSERT INTO User (id, email, name, password, role, createdAt, updatedAt)
VALUES (
    'clx0000000000000000000001', -- Unique CUID
    'newadmin@example.com',
    'New Admin User',
    '$2a$10$YgBCbgTB0TNsGLnYaOXUEOXA/3zwK5vGjLb65vF1Y7Ufcq86fxM8y', -- Bcrypt hash for 'password123'
    'ADMIN',
    STRFTIME('%Y-%m-%d %H:%M:%S', 'now'),
    STRFTIME('%Y-%m-%d %H:%M:%S', 'now')
);