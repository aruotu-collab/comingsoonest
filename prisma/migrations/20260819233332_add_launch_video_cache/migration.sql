-- CreateTable
CREATE TABLE "LaunchVideoCache" (
    "launchId" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "youtubeUrl" TEXT,
    "query" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LaunchVideoCache_pkey" PRIMARY KEY ("launchId")
);

-- CreateIndex
CREATE UNIQUE INDEX "LaunchVideoCache_slug_key" ON "LaunchVideoCache"("slug");
