-- CreateTable
CREATE TABLE "rutinas" (
    "id" TEXT NOT NULL,
    "contenido" JSONB NOT NULL,
    "objetivo" TEXT NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "leida" BOOLEAN NOT NULL DEFAULT false,
    "alumno_id" TEXT NOT NULL,
    "coach_id" TEXT NOT NULL,

    CONSTRAINT "rutinas_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "rutinas" ADD CONSTRAINT "rutinas_alumno_id_fkey" FOREIGN KEY ("alumno_id") REFERENCES "socios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rutinas" ADD CONSTRAINT "rutinas_coach_id_fkey" FOREIGN KEY ("coach_id") REFERENCES "socios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
