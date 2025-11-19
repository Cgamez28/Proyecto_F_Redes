import pandas as pd
from sqlalchemy import create_engine

# --- CONFIGURACIÓN ---
# Cadena de conexión: postgresql://usuario:password@localhost:puerto/nombre_bd
DB_URI = 'postgresql://postgres:12345@localhost:5432/corrupcion_co'

def ejecutar_etl():
    print("--- INICIANDO PROCESO ETL ---")

    # ---------------------------------------------------------
    # 1. EXTRACCIÓN (Extract) 
    # ---------------------------------------------------------
    print("1. Extrayendo datos de la fuente simulada...")
    try:
        # Leemos el archivo CSV como si fuera una descarga del gobierno
        df_crudo = pd.read_csv('datos_origen.csv')
        print(f"   -> Se encontraron {len(df_crudo)} registros.")
    except FileNotFoundError:
        print("Error: No se encontró el archivo datos_origen.csv")
        return

    # ---------------------------------------------------------
    # 2. TRANSFORMACIÓN (Transform) 
    # ---------------------------------------------------------
    print("2. Transformando y limpiando datos...")
    
    # a. Estandarización de Nombres (Quitar espacios, convertir a Título)
    # Esto soluciona la "información presentada en formatos de difícil acceso" [cite: 33]
    df_crudo['Nombre Completo'] = df_crudo['Nombre Completo'].str.strip().str.title()
    
    # b. Estandarización de Partidos
    df_crudo['Partido Politico'] = df_crudo['Partido Politico'].str.strip().str.title()
    
    # c. Lógica de Negocio: Calcular un "Score de Riesgo" inicial
    # Tu artículo menciona generar un "perfil de riesgo interactivo"[cite: 16].
    # Aquí hacemos un cálculo simple: si tiene muchas ausencias ("Absente"), sube el riesgo.
    def calcular_riesgo(votos):
        if "Absente" in str(votos):
            return 50.0 # Riesgo medio por ausentismo
        return 10.0 # Riesgo bajo base

    df_crudo['risk_score'] = df_crudo['Votos Recientes'].apply(calcular_riesgo)

    # d. Renombrar columnas para que coincidan con nuestra Base de Datos SQL
    df_limpio = df_crudo.rename(columns={
        'Nombre Completo': 'full_name',
        'Partido Politico': 'party',
        'Rol Actual': 'current_rol'
    })

    # Seleccionamos solo las columnas que existen en nuestra tabla 'politicians'
    columnas_finales = ['full_name', 'party', 'current_rol', 'risk_score']
    df_final = df_limpio[columnas_finales]
    
    print("   -> Datos transformados exitosamente.")

    # ---------------------------------------------------------
    # 3. CARGA (Load) 
    # ---------------------------------------------------------
    print("3. Cargando datos en PostgreSQL...")
    
    try:
        # Crear el motor de conexión
        engine = create_engine(DB_URI)
        
        # Insertar datos en la tabla 'politicians'. 
        # 'if_exists="append"' agrega los datos sin borrar la tabla.
        df_final.to_sql('politicians', engine, if_exists='append', index=False)
        
        print("   -> ¡Carga completada! Los datos están ahora centralizados.")
        
    except Exception as e:
        print(f"Error conectando a la Base de Datos: {e}")

if __name__ == "__main__":
    ejecutar_etl()