-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Watch" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "launchId" TEXT NOT NULL,
    "intensity" TEXT NOT NULL DEFAULT 'i_want_this',
    "prefs" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Watch_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WatchRule" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "brandId" TEXT,
    "bucket" TEXT,
    "query" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WatchRule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChangeEvent" (
    "id" TEXT NOT NULL,
    "at" TIMESTAMP(3) NOT NULL,
    "type" TEXT NOT NULL,
    "launchId" TEXT,
    "brandId" TEXT,
    "message" TEXT NOT NULL,
    "bucket" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ChangeEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AlertLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "watchId" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "sentAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "channel" TEXT NOT NULL DEFAULT 'email',
    "status" TEXT NOT NULL DEFAULT 'sent',

    CONSTRAINT "AlertLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Session_token_key" ON "Session"("token");

-- CreateIndex
CREATE INDEX "Watch_launchId_idx" ON "Watch"("launchId");

-- CreateIndex
CREATE UNIQUE INDEX "Watch_userId_launchId_key" ON "Watch"("userId", "launchId");

-- CreateIndex
CREATE INDEX "ChangeEvent_at_idx" ON "ChangeEvent"("at");

-- CreateIndex
CREATE INDEX "ChangeEvent_launchId_idx" ON "ChangeEvent"("launchId");

-- CreateIndex
CREATE INDEX "AlertLog_sentAt_idx" ON "AlertLog"("sentAt");

-- CreateIndex
CREATE UNIQUE INDEX "AlertLog_userId_eventId_key" ON "AlertLog"("userId", "eventId");

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Watch" ADD CONSTRAINT "Watch_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WatchRule" ADD CONSTRAINT "WatchRule_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AlertLog" ADD CONSTRAINT "AlertLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AlertLog" ADD CONSTRAINT "AlertLog_watchId_fkey" FOREIGN KEY ("watchId") REFERENCES "Watch"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AlertLog" ADD CONSTRAINT "AlertLog_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "ChangeEvent"("id") ON DELETE CASCADE ON UPDATE CASCADE;
