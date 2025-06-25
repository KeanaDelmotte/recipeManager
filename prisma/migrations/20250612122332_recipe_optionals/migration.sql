-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Recipe" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "servings" INTEGER,
    "imageUrl" TEXT,
    "userId" TEXT NOT NULL,
    "cookTimeInMins" INTEGER,
    "prepTimeInMins" INTEGER,
    CONSTRAINT "Recipe_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Recipe" ("cookTimeInMins", "createdAt", "description", "id", "imageUrl", "prepTimeInMins", "servings", "title", "userId") SELECT "cookTimeInMins", "createdAt", "description", "id", "imageUrl", "prepTimeInMins", "servings", "title", "userId" FROM "Recipe";
DROP TABLE "Recipe";
ALTER TABLE "new_Recipe" RENAME TO "Recipe";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
