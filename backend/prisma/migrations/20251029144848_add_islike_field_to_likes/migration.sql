-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Like" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "fromUserId" TEXT NOT NULL,
    "toUserId" TEXT NOT NULL,
    "isLike" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_Like" ("createdAt", "fromUserId", "id", "toUserId") SELECT "createdAt", "fromUserId", "id", "toUserId" FROM "Like";
DROP TABLE "Like";
ALTER TABLE "new_Like" RENAME TO "Like";
CREATE INDEX "Like_toUserId_idx" ON "Like"("toUserId");
CREATE INDEX "Like_fromUserId_isLike_idx" ON "Like"("fromUserId", "isLike");
CREATE UNIQUE INDEX "Like_fromUserId_toUserId_key" ON "Like"("fromUserId", "toUserId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
