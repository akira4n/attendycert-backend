/*
  Warnings:

  - A unique constraint covering the columns `[eventId,certificate_number]` on the table `Participant` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterEnum
ALTER TYPE "ParticipantStatus" ADD VALUE 'PROCESSING';

-- CreateIndex
CREATE UNIQUE INDEX "Participant_eventId_certificate_number_key" ON "Participant"("eventId", "certificate_number");
