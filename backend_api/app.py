from flask import Flask
app = Flask(__name__)

@app.route("/")
def home():
    return "Servidor del Backend (API) está funcionando!"

# Este será nuestro futuro endpoint
@app.route("/api/politicians/<int:politician_id>")
def get_politician(politician_id):
    # En el futuro, aquí buscaremos en la BD
    return {"message": f"Datos del político {politician_id}"}