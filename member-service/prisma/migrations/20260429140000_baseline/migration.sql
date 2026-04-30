-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "public"."Estado" AS ENUM ('ACTIVE', 'INACTIVE', 'PENDING');

-- CreateEnum
CREATE TYPE "public"."Rol" AS ENUM ('ADMIN', 'SOCIO', 'TRAINER', 'RECEPCION');

-- CreateTable
CREATE TABLE "public"."sedes" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "direccion" TEXT,
    "estado" TEXT NOT NULL DEFAULT 'ACTIVO',
    CONSTRAINT "sedes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."socios" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "telefono" TEXT,
    "rol" "public"."Rol" NOT NULL DEFAULT 'SOCIO',
    "estado_membresia" "public"."Estado" NOT NULL DEFAULT 'ACTIVE',
    "especialidad" TEXT,
    "salario" DOUBLE PRECISION,
    "fecha_registro" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "clases_restantes" INTEGER NOT NULL DEFAULT 0,
    "fecha_vencimiento" TIMESTAMP(3),
    "tipo_plan" TEXT,
    "ultimo_pago" TIMESTAMP(3),
    "ficha_tecnica" JSONB,
    "coach_id" TEXT,
    "sede_id" TEXT,
    CONSTRAINT "socios_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "socios_email_key" ON "public"."socios"("email" ASC);

-- AddForeignKey
ALTER TABLE "public"."socios" ADD CONSTRAINT "socios_coach_id_fkey" FOREIGN KEY ("coach_id") REFERENCES "public"."socios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."socios" ADD CONSTRAINT "socios_sede_id_fkey" FOREIGN KEY ("sede_id") REFERENCES "public"."sedes"("id") ON DELETE SET NULL ON UPDATE CASCADE;
