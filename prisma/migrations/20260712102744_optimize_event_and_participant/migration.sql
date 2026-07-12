-- AlterTable
ALTER TABLE "Event" ADD COLUMN     "max_quota" INTEGER;

-- CreateIndex
CREATE INDEX "Participant_eventId_idx" ON "Participant"("eventId");
