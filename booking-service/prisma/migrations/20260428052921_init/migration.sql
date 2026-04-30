-- CreateEnum
CREATE TYPE "booking_status" AS ENUM ('CONFIRMED', 'CANCELLED', 'ATTENDED');

-- CreateTable
CREATE TABLE "bookings" (
    "id" UUID NOT NULL,
    "socio_id" UUID NOT NULL,
    "clase_instancia_id" UUID NOT NULL,
    "estado" "booking_status" DEFAULT 'CONFIRMED',
    "fecha_creacion" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "bookings_pkey" PRIMARY KEY ("id","fecha_creacion")
);

-- CreateTable
CREATE TABLE "clases" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "nombre" VARCHAR(100) NOT NULL,
    "descripcion" TEXT,

    CONSTRAINT "clases_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "clases_instancia" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "clase_id" UUID NOT NULL,
    "nombre_clase" VARCHAR(100) NOT NULL,
    "trainer_id" UUID NOT NULL,
    "trainer_nombre" VARCHAR(100) NOT NULL,
    "sede_nombre" VARCHAR(100) NOT NULL,
    "descripcion" VARCHAR(300),
    "sede_id" UUID NOT NULL,
    "fecha_inicio" TIMESTAMPTZ(6) NOT NULL,
    "fecha_fin" TIMESTAMPTZ(6) NOT NULL,
    "capacidad_total" INTEGER NOT NULL,
    "cupos_disponibles" INTEGER NOT NULL,
    "version" INTEGER DEFAULT 0,

    CONSTRAINT "clases_instancia_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "outbox_events" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "aggregate_type" VARCHAR(50) NOT NULL,
    "aggregate_id" UUID NOT NULL,
    "event_type" VARCHAR(50) NOT NULL,
    "payload" JSONB NOT NULL,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "processed" BOOLEAN DEFAULT false,

    CONSTRAINT "outbox_events_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "idx_bookings_socio" ON "bookings"("socio_id");

-- CreateIndex
CREATE INDEX "idx_clases_fecha" ON "clases_instancia"("fecha_inicio", "sede_id");

-- AddForeignKey
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_clase_instancia_id_fkey" FOREIGN KEY ("clase_instancia_id") REFERENCES "clases_instancia"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;