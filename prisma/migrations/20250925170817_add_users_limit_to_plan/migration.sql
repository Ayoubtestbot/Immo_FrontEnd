-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Plan" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "price" REAL NOT NULL,
    "prospectsLimit" INTEGER NOT NULL,
    "usersLimit" INTEGER NOT NULL DEFAULT 5,
    "features" TEXT NOT NULL
);
INSERT INTO "new_Plan" ("features", "id", "name", "price", "prospectsLimit") SELECT "features", "id", "name", "price", "prospectsLimit" FROM "Plan";
DROP TABLE "Plan";
ALTER TABLE "new_Plan" RENAME TO "Plan";
CREATE UNIQUE INDEX "Plan_name_key" ON "Plan"("name");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
