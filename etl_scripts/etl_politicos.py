import pandas as pd
from sqlalchemy import create_engine, text

# --- CONFIGURACIÓN ---
# ¡CAMBIA TU CONTRASEÑA AQUÍ!
DB_URI = 'postgresql://postgres:12345@localhost:5432/corrupcion_co'

def ejecutar_etl():
    print("--- INICIANDO ETL AVANZADO ---")
    
    engine = create_engine(DB_URI)
    
    # 1. Limpiar la BD (Para no duplicar datos cada vez que corremos el script)
    with engine.connect() as conn:
        print("1. Limpiando base de datos antigua...")
        conn.execute(text("TRUNCATE TABLE voting_records, judicial_records, academic_records, politicians CASCADE;"))
        conn.commit()

    # 2. Extracción
    print("2. Leyendo CSV extendido...")
    df = pd.read_csv('datos_origen.csv')
    df = df.fillna('') # Reemplazar vacíos con strings vacíos

    # 3. Transformación y Carga (Fila por Fila para manejar relaciones)
    print("3. Procesando y Cargando registros...")
    
    with engine.connect() as conn:
        for index, row in df.iterrows():
            # A. Calcular Riesgo
            risk = 10.0
            if "Absente" in row['Votos Recientes']: risk += 20
            if row['Casos_Judiciales']: risk += 50 # Si tiene texto en casos, sube riesgo
            risk = min(risk, 100.0)

            # B. Insertar Político
            print(f"   -> Procesando: {row['Nombre Completo']}")
            result = conn.execute(text("""
                INSERT INTO politicians (full_name, party, current_role, risk_score, image_url)
                VALUES (:name, :party, :role, :risk, :img)
                RETURNING id
            """), {
                'name': row['Nombre Completo'].strip(),
                'party': row['Partido Politico'].strip(),
                'role': row['Rol Actual'].strip(),
                'risk': risk,
                'img': row['Imagen_URL'].strip()
            })
            
            politician_id = result.fetchone()[0]

            # C. Insertar Casos Judiciales (Separados por |)
            if row['Casos_Judiciales']:
                casos = row['Casos_Judiciales'].split('|')
                for caso in casos:
                    conn.execute(text("""
                        INSERT INTO judicial_records (politician_id, case_number, description, status)
                        VALUES (:pid, 'CASO-AUTO', :desc, 'En Investigación')
                    """), {'pid': politician_id, 'desc': caso.strip()})

            # D. Insertar Estudios (Separados por |)
            if row['Titulos_Academicos']:
                titulos = row['Titulos_Academicos'].split('|')
                for titulo in titulos:
                    # Intentamos separar "Carrera - Universidad"
                    parts = titulo.split('-')
                    degree = parts[0].strip()
                    inst = parts[1].strip() if len(parts) > 1 else "Institución No Registrada"
                    
                    conn.execute(text("""
                        INSERT INTO academic_records (politician_id, degree, institution, year)
                        VALUES (:pid, :deg, :inst, 0)
                    """), {'pid': politician_id, 'deg': degree, 'inst': inst})
            
        conn.commit()
    
    print("--- ETL FINALIZADO EXITOSAMENTE ---")

if __name__ == "__main__":
    ejecutar_etl()