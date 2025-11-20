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
    query = request.args.get('q', '') # Obtiene el parámetro ?q=nombre
    
    if not query:
        return jsonify({'error': 'Debes enviar un término de búsqueda'}), 400

    conn = get_db_connection()
    if not conn:
        return jsonify({'error': 'Error de conexión a BD'}), 500
    
    cursor = conn.cursor(cursor_factory=RealDictCursor)
    
    # Usamos ILIKE para búsqueda insensible a mayúsculas/minúsculas (ej: "juan" encuentra "JUAN")
    sql = """
        SELECT id, full_name, party, current_role, risk_score 
        FROM politicians 
        WHERE full_name ILIKE %s 
        LIMIT 10;
    """
    cursor.execute(sql, (f'%{query}%',))
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