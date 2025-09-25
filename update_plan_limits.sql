UPDATE Plan
SET name = 'Free Trial', usersLimit = 1, prospectsLimit = 100
WHERE id = 'clx0000000000000000000000';

UPDATE Plan
SET name = 'Starter', usersLimit = 3, prospectsLimit = 1000
WHERE id = 'clx0000000000000000000001';

UPDATE Plan
SET name = 'Pro', usersLimit = 10, prospectsLimit = 10000
WHERE id = 'clx0000000000000000000002';

UPDATE Plan
SET name = 'Entreprise', usersLimit = -1, prospectsLimit = -1
WHERE id = 'clx0000000000000000000003';