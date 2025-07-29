-- CreateTable
CREATE TABLE "CurrStream" (
    "userId" TEXT NOT NULL,
    "streamId" TEXT,

    CONSTRAINT "CurrStream_pkey" PRIMARY KEY ("userId")
);

-- CreateIndex
CREATE UNIQUE INDEX "CurrStream_streamId_key" ON "CurrStream"("streamId");

-- AddForeignKey
ALTER TABLE "CurrStream" ADD CONSTRAINT "CurrStream_streamId_fkey" FOREIGN KEY ("streamId") REFERENCES "Stream"("id") ON DELETE SET NULL ON UPDATE CASCADE;
