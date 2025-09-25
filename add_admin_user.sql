INSERT INTO User (id, email, name, password, role, createdAt, updatedAt)
VALUES (
    'clx0000000000000000000000', -- Replace with a unique CUID or UUID (e.g., from https://www.cuid.me/)
    'admin@example.com',
    'Admin User',
    '$2a$10$somehashedpasswordhere', -- REPLACE THIS WITH A REAL BCRYPT HASH FOR 'password123'
    'ADMIN',
    STRFTIME('%Y-%m-%d %H:%M:%S', 'now'),
    STRFTIME('%Y-%m-%d %H:%M:%S', 'now')
);