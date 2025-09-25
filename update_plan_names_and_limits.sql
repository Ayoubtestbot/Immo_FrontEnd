UPDATE Plan
SET name = 'Free Trial', usersLimit = 1, prospectsLimit = 100
WHERE name = 'Agence Free Trial'; -- Assuming the old name was 'Agence Free Trial' or similar

UPDATE Plan
SET name = 'Starter', usersLimit = 3, prospectsLimit = 1000
WHERE name = 'Agence Starter';

UPDATE Plan
SET name = 'Pro', usersLimit = 10, prospectsLimit = 10000
WHERE name = 'Agence Pro';

UPDATE Plan
SET name = 'Entreprise', usersLimit = -1, prospectsLimit = -1
WHERE name = 'Agence Entreprise';