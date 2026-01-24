-- CreateTable
CREATE TABLE "Usage" (
    "key" TEXT NOT NULL,
    "Points" INTEGER NOT NULL,
    "expire" TIMESTAMP(3),

    CONSTRAINT "Usage_pkey" PRIMARY KEY ("key")
);
