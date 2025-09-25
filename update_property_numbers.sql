UPDATE Property
SET propertyNumber = (SELECT ROW_NUMBER() OVER (ORDER BY createdAt) FROM Property AS p WHERE p.id = Property.id)
WHERE propertyNumber IS NULL;