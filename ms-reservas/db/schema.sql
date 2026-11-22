-- db/schema.sql · ms-reservas
-- Ejecutar conectado como reservas_user sobre reservas_db.
SET NAMES utf8mb4; -- para que las tildes y la ñ se guarden bien

CREATE TABLE reservas (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  codigo        VARCHAR(20)  NOT NULL UNIQUE,
  huesped       VARCHAR(100) NOT NULL,
  fecha_entrada DATE         NOT NULL,
  fecha_salida  DATE         NOT NULL,
  personas      INT          NOT NULL
);

INSERT INTO reservas (codigo, huesped, fecha_entrada, fecha_salida, personas) VALUES
  ('RES-001', 'Ana García',   '2026-12-20', '2026-12-23', 2),
  ('RES-002', 'Carlos Pérez', '2026-12-24', '2026-12-28', 4),
  ('RES-003', 'Laura Gómez',  '2027-01-05', '2027-01-08', 1);
