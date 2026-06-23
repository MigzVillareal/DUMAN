-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'MEMBER');

-- CreateEnum
CREATE TYPE "MeetingStatus" AS ENUM ('UPCOMING', 'ONGOING', 'FINISHED');

-- CreateTable
CREATE TABLE "users" (
    "userId" SERIAL NOT NULL,
    "username" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "firstname" TEXT NOT NULL,
    "lastname" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "notificationId" INTEGER,
    "groupId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("userId")
);

-- CreateTable
CREATE TABLE "groups" (
    "groupId" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "groupColor" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userUserId" INTEGER,

    CONSTRAINT "groups_pkey" PRIMARY KEY ("groupId")
);

-- CreateTable
CREATE TABLE "members" (
    "memberId" INTEGER NOT NULL,
    "groupId" INTEGER NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'MEMBER',
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "members_pkey" PRIMARY KEY ("memberId","groupId")
);

-- CreateTable
CREATE TABLE "meetings" (
    "meetingId" SERIAL NOT NULL,
    "meetingNumber" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT NOT NULL,
    "meetingStatus" "MeetingStatus" NOT NULL,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "locationDescription" TEXT NOT NULL,
    "schedule" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "setterId" INTEGER NOT NULL,
    "intendedGroupId" INTEGER NOT NULL,

    CONSTRAINT "meetings_pkey" PRIMARY KEY ("meetingId")
);

-- CreateTable
CREATE TABLE "calendars" (
    "calendarId" SERIAL NOT NULL,
    "groupId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "calendars_pkey" PRIMARY KEY ("calendarId")
);

-- CreateTable
CREATE TABLE "notifications" (
    "notificationId" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "groupId" INTEGER NOT NULL,
    "title" TEXT NOT NULL,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("notificationId")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- AddForeignKey
ALTER TABLE "groups" ADD CONSTRAINT "groups_userUserId_fkey" FOREIGN KEY ("userUserId") REFERENCES "users"("userId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "members" ADD CONSTRAINT "members_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "users"("userId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "members" ADD CONSTRAINT "members_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "groups"("groupId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "meetings" ADD CONSTRAINT "meetings_setterId_fkey" FOREIGN KEY ("setterId") REFERENCES "users"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "meetings" ADD CONSTRAINT "meetings_intendedGroupId_fkey" FOREIGN KEY ("intendedGroupId") REFERENCES "groups"("groupId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "groups"("groupId") ON DELETE CASCADE ON UPDATE CASCADE;
