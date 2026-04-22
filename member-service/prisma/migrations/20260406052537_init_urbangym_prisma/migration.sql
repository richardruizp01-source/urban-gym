-- CreateEnum
CREATE TYPE "Rol" AS ENUM ('ADMIN', 'SOCIO', 'TRAINER', 'RECEPCION');

-- CreateEnum
CREATE TYPE "Estado" AS ENUM ('ACTIVE', 'INACTIVE', 'PENDING');

-- CreateTable
CREATE TABLE "socios" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "telefono" TEXT,
    "rol" "Rol" NOT NULL DEFAULT 'SOCIO',
    "estado_membresia" "Estado" NOT NULL DEFAULT 'ACTIVE',
    "especialidad" TEXT,
    "salario" DOUBLE PRECISION,
    "fecha_registro" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "socios_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "socios_email_key" ON "socios"("email");
