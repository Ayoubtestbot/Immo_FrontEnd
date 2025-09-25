-- Delete all existing plans
DELETE FROM Plan;

-- Insert the new plans
INSERT INTO Plan (id, name, price, prospectsLimit, usersLimit, features)
VALUES (
    'clx0000000000000000000000', -- Unique CUID for Free Trial
    'Free Trial',
    0.00,
    100,
    1,
    'Essai gratuit: 1 utilisateur, 100 prospects'
);

INSERT INTO Plan (id, name, price, prospectsLimit, usersLimit, features)
VALUES (
    'clx0000000000000000000001', -- Unique CUID for Starter
    'Starter',
    49.00,
    1000,
    3,
    'Gestion de 1000 prospects, 3 utilisateurs, Acces aux fonctionnalites de base, Support par email'
);

INSERT INTO Plan (id, name, price, prospectsLimit, usersLimit, features)
VALUES (
    'clx0000000000000000000002', -- Unique CUID for Pro
    'Pro',
    99.00,
    10000,
    10,
    'Gestion de 10000 prospects, 10 utilisateurs, Rapports avances, Integration CRM, Support prioritaire'
);

g