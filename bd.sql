CREATE DATABASE corrupcion_co;

-- Tabla Central: Políticos
CREATE TABLE politicians (
    id SERIAL PRIMARY KEY,
    full_name VARCHAR(255) NOT NULL,
    party VARCHAR(100),
    current_rol VARCHAR(255),
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    -- El "perfil de riesgo" que calculará nuestro ETL
    risk_score FLOAT DEFAULT 0.0
);

-- Tabla de Historial Académico
CREATE TABLE academic_records (
    id SERIAL PRIMARY KEY,
    politician_id INT REFERENCES politicians(id), -- Llave foránea
    degree VARCHAR(255),
    institution VARCHAR(255),
    year INT
);

-- Tabla de Historial Judicial
CREATE TABLE judicial_records (
    id SERIAL PRIMARY KEY,
    politician_id INT REFERENCES politicians(id), -- Llave foránea
    case_number VARCHAR(100),
    description TEXT,
    status VARCHAR(50), -- Ej. 'Activo', 'Cerrado'
    source_url TEXT
);

-- Tabla de Votaciones (del Congreso)
CREATE TABLE voting_records (
    id SERIAL PRIMARY KEY,
    politician_id INT REFERENCES politicians(id), -- Llave foránea
    bill_name TEXT, -- Nombre del proyecto de ley
    vote VARCHAR(50) -- Ej. 'Sí', 'No', 'Ausente'
);

SELECT * FROM politicians;

ALTER TABLE politicians ADD COLUMN image_url TEXT;
