/*
  Warnings:

  - The primary key for the `Ingredient` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `Ingredient` table. All the data in the column will be lost.
  - You are about to drop the column `ingredientId` on the `RecipeIngredient` table. All the data in the column will be lost.
  - The primary key for the `Tag` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `Tag` table. All the data in the column will be lost.
  - Added the required column `name` to the `RecipeIngredient` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Ingredient" (
    "name" TEXT NOT NULL PRIMARY KEY
);
INSERT INTO "new_Ingredient" ("name") SELECT "name" FROM "Ingredient";
DROP TABLE "Ingredient";
ALTER TABLE "new_Ingredient" RENAME TO "Ingredient";
CREATE TABLE "new_RecipeIngredient" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "recipeId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "quantity" INTEGER,
    "unit" TEXT,
    "note" TEXT,
    "group" TEXT,
    CONSTRAINT "RecipeIngredient_name_fkey" FOREIGN KEY ("name") REFERENCES "Ingredient" ("name") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "RecipeIngredient_recipeId_fkey" FOREIGN KEY ("recipeId") REFERENCES "Recipe" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_RecipeIngredient" ("group", "id", "note", "quantity", "recipeId", "unit") SELECT "group", "id", "note", "quantity", "recipeId", "unit" FROM "RecipeIngredient";
DROP TABLE "RecipeIngredient";
ALTER TABLE "new_RecipeIngredient" RENAME TO "RecipeIngredient";
CREATE TABLE "new_Tag" (
    "title" TEXT NOT NULL PRIMARY KEY
);
INSERT INTO "new_Tag" ("title") SELECT "title" FROM "Tag";
DROP TABLE "Tag";
ALTER TABLE "new_Tag" RENAME TO "Tag";
CREATE TABLE "new__RecipeToTag" (
    "A" INTEGER NOT NULL,
    "B" TEXT NOT NULL,
    CONSTRAINT "_RecipeToTag_A_fkey" FOREIGN KEY ("A") REFERENCES "Recipe" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_RecipeToTag_B_fkey" FOREIGN KEY ("B") REFERENCES "Tag" ("title") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new__RecipeToTag" ("A", "B") SELECT "A", "B" FROM "_RecipeToTag";
DROP TABLE "_RecipeToTag";
ALTER TABLE "new__RecipeToTag" RENAME TO "_RecipeToTag";
CREATE UNIQUE INDEX "_RecipeToTag_AB_unique" ON "_RecipeToTag"("A", "B");
CREATE INDEX "_RecipeToTag_B_index" ON "_RecipeToTag"("B");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
