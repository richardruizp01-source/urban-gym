--
-- PostgreSQL database dump
--

\restrict Q8JX3kN9Z81SG748O8hELVKxv1CxtPzRHJyBRNbaUhJ0ibcUL7QuZOsCcfHWdpz

-- Dumped from database version 18.3
-- Dumped by pg_dump version 18.3

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: postgres
--

-- *not* creating schema, since initdb creates it


ALTER SCHEMA public OWNER TO postgres;

--
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: postgres
--

COMMENT ON SCHEMA public IS '';


--
-- Name: Estado; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."Estado" AS ENUM (
    'ACTIVE',
    'INACTIVE',
    'PENDING'
);


ALTER TYPE public."Estado" OWNER TO postgres;

--
-- Name: Rol; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."Rol" AS ENUM (
    'ADMIN',
    'SOCIO',
    'TRAINER',
    'RECEPCION'
);


ALTER TYPE public."Rol" OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: _prisma_migrations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public._prisma_migrations (
    id character varying(36) NOT NULL,
    checksum character varying(64) NOT NULL,
    finished_at timestamp with time zone,
    migration_name character varying(255) NOT NULL,
    logs text,
    rolled_back_at timestamp with time zone,
    started_at timestamp with time zone DEFAULT now() NOT NULL,
    applied_steps_count integer DEFAULT 0 NOT NULL
);


ALTER TABLE public._prisma_migrations OWNER TO postgres;

--
-- Name: sedes; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.sedes (
    id text NOT NULL,
    nombre text NOT NULL,
    direccion text,
    estado text DEFAULT 'ACTIVO'::text NOT NULL
);


ALTER TABLE public.sedes OWNER TO postgres;

--
-- Name: socios; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.socios (
    id text NOT NULL,
    nombre text NOT NULL,
    email text NOT NULL,
    password text NOT NULL,
    telefono text,
    rol public."Rol" DEFAULT 'SOCIO'::public."Rol" NOT NULL,
    estado_membresia public."Estado" DEFAULT 'ACTIVE'::public."Estado" NOT NULL,
    especialidad text,
    salario double precision,
    fecha_registro timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    clases_restantes integer DEFAULT 0 NOT NULL,
    fecha_vencimiento timestamp(3) without time zone,
    tipo_plan text,
    ultimo_pago timestamp(3) without time zone,
    coach_id text,
    sede_id text
);


ALTER TABLE public.socios OWNER TO postgres;

--
-- Data for Name: _prisma_migrations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) FROM stdin;
1c2a459b-a22d-4e4e-8e84-5c772bb28b1b	599bffba7f589693e743e02834572f1686a83e89608a6633a537b416b90c4b84	2026-04-06 00:25:37.927902-05	20260406052537_init_urbangym_prisma	\N	\N	2026-04-06 00:25:37.902556-05	1
0b219757-d39f-4bda-a460-1866299b7272	ebdf224be6c885f9681f726a3aebe117997834219304b1da7440bf0bd3869b51	2026-04-29 02:25:46.001296-05	20260429120000_fix_drift		\N	2026-04-29 02:25:46.001296-05	0
712d54a6-f767-4dd6-a1a7-e9ab73e89b5c	cbcfb9913070350d72805115d0924f78a3811c3999a95a4ab5d3c53dadb93a59	2026-04-29 02:27:53.882721-05	20260429130000_sync_full		\N	2026-04-29 02:27:53.882721-05	0
\.


--
-- Data for Name: sedes; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.sedes (id, nombre, direccion, estado) FROM stdin;
e39f0a7e-af27-47f3-aa71-e5599a264d69	Urbangym Centro	Calle Principal #1	ACTIVO
638c35d5-5d94-494d-8d4c-6a3990d208dd	URBANGYM vip	centro comercial Buena Vista	INACTIVO
48db2d5a-fa4a-42f9-a974-381a661dd502	Urbangym Norte	Avenida 6 #12-40	ACTIVO
17a8fda5-6f62-4ce1-a485-58a6cdf64a58	Urbangym Sur	Carrera 2 #45-10	ACTIVO
\.


--
-- Data for Name: socios; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.socios (id, nombre, email, password, telefono, rol, estado_membresia, especialidad, salario, fecha_registro, clases_restantes, fecha_vencimiento, tipo_plan, ultimo_pago, coach_id, sede_id) FROM stdin;
ac886b2f-b51e-46c7-9bb0-a4e4f6337676	Diana Peñatez	diana@urbangym.com	$2b$10$Z8O6wjIl9zGNHt2sB0RYDOzwLwAzTguWIo70pFIE8bJyBFVaGW2aa	3143655623	SOCIO	ACTIVE	\N	\N	2026-04-18 20:31:59.609	0	2026-05-18 20:31:59.607	BASICO	2026-04-18 20:31:59.607	\N	\N
6e7ca334-76c3-49a6-8080-c43e0d59bba3	Elena Recepción	elena.recepcion@urbangym.com	$2b$10$ejGXVD.PqEtl4wd2l5/ndO26v0c4u2F2G8BwUIWLq8dDnE7o/slm.	3145698965	RECEPCION	INACTIVE	\N	1800000	2026-04-06 05:40:18.723	0	2026-05-15 11:58:18.233	\N	\N	\N	\N
898cbd7d-c715-4c47-ac55-623cdcb531fa	Carlos 'La Roca'	carlos.trainer@urbangym.com	$2b$10$GvPPNNvYy7YsDQdOv8OsEeYpNTiH/R40f6oeJkwT7jdU5d0t1ZGgG	3113307854	TRAINER	INACTIVE	Crossfit y Powerlifting	2800000	2026-04-06 05:39:11.227	0	2026-05-15 11:58:18.233	\N	\N	\N	\N
be05a7b7-f973-48ff-8df0-74795a46ab01	Richard Ruiz	richard@urbangym.com	$2b$10$Tq1iJYQhD1/EZU/i3IYSyOxiOoTg0d/3Qx900O18HNNUkT9xRltO2	3001234567	ADMIN	INACTIVE	\N	5000000	2026-04-06 05:37:13.827	0	2026-05-15 11:58:18.233	\N	\N	\N	\N
005eb58e-3284-4b59-8d88-3e129e73fd02	Daniel Salsa	Daniel@urbangym.com	$2b$10$oylL8cVQS7HFpDsu1FDkCOBKkikK9xfzI9Zez/v9ESzsBtiIQPxaW	3023021414	TRAINER	INACTIVE	\N	\N	2026-04-18 20:28:40.243	0	\N	\N	\N	\N	\N
cc866b6a-bbe6-44a8-818c-249fc65e0377	Sara Blonde	sara@urbangym.com	$2b$10$JpKT7wFNV8582hd5FFqPU.GdWGNsJCoJkEaomXPyNiAkbJgurvyMe	3012569878	TRAINER	INACTIVE	\N	\N	2026-04-16 14:09:45.789	0	\N	\N	\N	\N	\N
6a063b8b-1f2d-4b66-b7db-f4bcee682414	Juan Ruiz	juanruiz@urbangym.com	$2b$10$PSUEV8JDpN1qxaOajy4IFuYY6tRMfjTxXyvqnyU156GLcb5hRZM0G	\N	SOCIO	ACTIVE	\N	\N	2026-04-18 22:17:44.8	0	2026-05-18 22:18:10.028	VIP	\N	\N	\N
27594bcd-993b-4515-bbd8-8d5b7ceeba2e	Jass Lopez	jass@urbangym.com	$2b$10$RiZwF/Hvzmx1C2hL3UM4V.jjYbMyKJSjBSeGdRxvRk3ex/n6iH9SC	3023023012	TRAINER	ACTIVE	\N	\N	2026-04-20 17:20:01.899	0	\N	\N	\N	\N	\N
58b9dd6e-2ac1-4653-a51b-c4f72c2ab9a3	Sonia Rivero	sonia@urbangym.com	$2b$10$X0IwPczgNPsZS42sxYE2TuuH7pXyLLEsqwcjFqJKtAS3zQr1CGr/y	\N	SOCIO	ACTIVE	\N	\N	2026-04-20 19:54:16.439	0	2026-05-20 19:55:02.023	VIP	\N	\N	\N
11aeed41-bdb5-4742-b7b9-bf9dbacfca4b	socio prueba	socio@urbangym.com	$2b$10$xGzUtrcqlIJyxxMjQHlzNOedO2J8ke/pPXrJzPT0c12w1vFRKX.96	\N	SOCIO	ACTIVE	\N	\N	2026-04-18 22:18:58.188	0	2026-05-28 04:26:35.244	VIP	\N	\N	\N
95bb267c-b206-4151-a394-423a68aaf8d3	Moises Burgos	Moises@urbangym.com	$2b$10$BAu/AxNPheINJvA3Aeqr0u75h8fWEovliVIiZZKuxphPf7L/AwDsy	\N	SOCIO	ACTIVE	\N	\N	2026-04-28 07:32:25.221	0	2026-05-28 07:33:45.997	VIP	\N	\N	\N
5487ea1b-b8cb-49e3-9476-652498891318	Danilson Martinez	danilson12@urbangym.com	$2b$10$HX1RE7DsA5DuhJquSuHvQu4BSKFI7feYQE1sjIWNeRzCk1IhI6//.	3002002002	SOCIO	ACTIVE	\N	\N	2026-04-20 21:23:10.49	0	2026-05-20 23:09:56.201	ESTANDAR	\N	\N	\N
f3662cab-b230-4284-accf-538b9d7cf8aa	David Fitt	david@urbangym.com	$2b$10$rXn1f.dgjchBX4ZixEIt5OzOOuR4lP8Fz3.rBfYn.h3pXT8R0BECi	3002589874	TRAINER	ACTIVE	\N	\N	2026-04-29 06:49:55.778	0	\N	\N	\N	\N	e39f0a7e-af27-47f3-aa71-e5599a264d69
d6e45da9-a1c2-4129-a96b-ef94aeed042c	Ismael Perez	isamel@urbangym.com	$2b$10$wvc.46x7iEDCuco.BQCJG.SCfFhcoIGbkw9jQ1YYBfWh0ys/9HDtK	\N	SOCIO	ACTIVE	\N	\N	2026-04-29 06:13:35.48	0	2026-05-29 06:52:42.727	VIP	\N	\N	e39f0a7e-af27-47f3-aa71-e5599a264d69
\.


--
-- Name: _prisma_migrations _prisma_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public._prisma_migrations
    ADD CONSTRAINT _prisma_migrations_pkey PRIMARY KEY (id);


--
-- Name: sedes sedes_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sedes
    ADD CONSTRAINT sedes_pkey PRIMARY KEY (id);


--
-- Name: socios socios_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.socios
    ADD CONSTRAINT socios_pkey PRIMARY KEY (id);


--
-- Name: socios_email_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX socios_email_key ON public.socios USING btree (email);


--
-- Name: socios socios_coach_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.socios
    ADD CONSTRAINT socios_coach_id_fkey FOREIGN KEY (coach_id) REFERENCES public.socios(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: socios socios_sede_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.socios
    ADD CONSTRAINT socios_sede_id_fkey FOREIGN KEY (sede_id) REFERENCES public.sedes(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: SCHEMA public; Type: ACL; Schema: -; Owner: postgres
--

REVOKE USAGE ON SCHEMA public FROM PUBLIC;


--
-- PostgreSQL database dump complete
--

\unrestrict Q8JX3kN9Z81SG748O8hELVKxv1CxtPzRHJyBRNbaUhJ0ibcUL7QuZOsCcfHWdpz

