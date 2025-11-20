from flask import Flask, jsonify, request
from flask_cors import CORS
import psycopg2
from psycopg2.extras import RealDictCursor

app = Flask(__name__)
# Habilitamos CORS para permitir peticiones desde nuestra futura app React (localhost:3000)
CORS(app) 

# --- CONFIGURACIÓN DE BASE DE DATOS ---
# Recuerda cambiar 'tu_contraseña' por la real
DB_CONFIG = {
    'dbname': 'corrupcion_co',
    'user': 'postgres',
    'password': '12345',
    'host': 'localhost',
    'port': '5432'
}

def get_db_connection():
    """Función auxiliar para conectar a la BD"""
    try:
        conn = psycopg2.connect(**DB_CONFIG)
        return conn
    except Exception as e:
        print(f"Error conectando a la BD: {e}")
        return None

# --- ENDPOINTS (LAS "VENTANILLAS") ---

# 1. Búsqueda de Políticos
@app.route('/api/politicians/search', methods=['GET'])
def search_politicians():
    # Recibimos parámetros (nombre, partido, riesgo mínimo)
    query_name = request.args.get('q', '')
    party_filter = request.args.get('party', '')
    risk_filter = request.args.get('risk', '') # 'high', 'medium', 'low', 'all'
    
    conn = get_db_connection()
    cursor = conn.cursor(cursor_factory=RealDictCursor)
    
    # Construcción dinámica de la consulta SQL
    sql = "SELECT id, full_name, party, current_role, risk_score, image_url FROM politicians WHERE 1=1"
    params = []

    # Filtro por Nombre
    if query_name:
        sql += " AND full_name ILIKE %s"
        params.append(f'%{query_name}%')
    
    # Filtro por Partido
    if party_filter and party_filter != 'Todos':
        sql += " AND party = %s"
        params.append(party_filter)

    # Filtro por Riesgo
    if risk_filter == 'high':
        sql += " AND risk_score >= 60"
    elif risk_filter == 'medium':
        sql += " AND risk_score >= 30 AND risk_score < 60"
    elif risk_filter == 'low':
        sql += " AND risk_score < 30"

    sql += " ORDER BY risk_score DESC LIMIT 50;" # Ordenamos por los más riesgosos primero

    cursor.execute(sql, tuple(params))
    results = cursor.fetchall()
    
    cursor.close()
    conn.close()
    
    return jsonify(results)

# 2. Detalle de un Político Específico
@app.route('/api/politicians/<int:id>', methods=['GET'])
def get_politician_detail(id):
    conn = get_db_connection()
    cursor = conn.cursor(cursor_factory=RealDictCursor)
    
    # Consultar datos básicos
    cursor.execute("SELECT * FROM politicians WHERE id = %s", (id,))
    politician = cursor.fetchone()
    
    if not politician:
        return jsonify({'error': 'Político no encontrado'}), 404

    # Consultar historial académico (Simulación de joins o consultas extra)
    # En un diseño completo, haríamos JOINs, pero aquí simplificamos.
    cursor.execute("SELECT * FROM academic_records WHERE politician_id = %s", (id,))
    academic = cursor.fetchall()

    # Empaquetamos todo en un solo objeto JSON
    response = {
        'profile': politician,
        'academic_history': academic,
        # Aquí agregaríamos judicial_records y voting_records en el futuro
    }
    
    cursor.close()
    conn.close()
    
    return jsonify(response)

if __name__ == '__main__':
    # debug=True permite que el servidor se reinicie si cambias código
    app.run(debug=True, port=5000)