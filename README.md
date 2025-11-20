# Proyecto Final - Redes de Datos

## 📋 Descripción del Proyecto

Este proyecto es una aplicación web de tres capas diseñada para centralizar y analizar información sobre políticos colombianos, con el objetivo de generar perfiles de riesgo interactivos y mejorar la transparencia en la información pública. El sistema aborda el problema de la dispersión de información presentada en formatos de difícil acceso mediante un proceso ETL (Extract, Transform, Load) que normaliza y centraliza los datos.

## 🎯 Objetivo

El objetivo principal es proporcionar una plataforma que permita:
- Centralizar información dispersa sobre políticos colombianos
- Calcular perfiles de riesgo basados en comportamiento y ausentismo
- Facilitar el acceso a información pública de manera estructurada
- Promover la transparencia gubernamental mediante tecnología

## 🏗️ Arquitectura del Sistema

El proyecto está organizado en tres componentes principales:

```
Proyecto_F_Redes/
├── frontend_app/      # Aplicación React (interfaz de usuario)
├── backend_api/       # API REST con Flask (servidor backend)
├── etl_scripts/       # Scripts de procesamiento de datos
└── requirements.txt   # Dependencias de Python
```

### 1. Frontend (React Application)
- **Ubicación**: `frontend_app/`
- **Tecnología**: React 19.2.0
- **Propósito**: Interfaz de usuario para visualizar información de políticos
- **Estado**: Proyecto base de Create React App (en desarrollo)

### 2. Backend API (Flask)
- **Ubicación**: `backend_api/`
- **Tecnología**: Flask (Python)
- **Propósito**: Servidor API REST para acceder a datos de políticos
- **Endpoints**:
  - `GET /` - Verificar estado del servidor
  - `GET /api/politicians/<id>` - Obtener información de un político específico (en desarrollo)

### 3. ETL Scripts (Procesamiento de Datos)
- **Ubicación**: `etl_scripts/`
- **Tecnología**: Python con Pandas y SQLAlchemy
- **Propósito**: Extraer, transformar y cargar datos en PostgreSQL
- **Funcionalidades**:
  - Extracción de datos desde archivos CSV
  - Limpieza y estandarización de nombres y partidos políticos
  - Cálculo de "score de riesgo" basado en ausentismo
  - Carga de datos en base de datos PostgreSQL

## 🛠️ Tecnologías Utilizadas

### Backend
- **Flask**: Framework web ligero para Python
- **psycopg2-binary**: Adaptador de PostgreSQL para Python
- **Pandas**: Análisis y manipulación de datos
- **SQLAlchemy**: ORM para Python

### Frontend
- **React**: Biblioteca de JavaScript para interfaces de usuario
- **React Scripts**: Configuración y scripts de Create React App

### Base de Datos
- **PostgreSQL**: Sistema de gestión de base de datos relacional

## 📦 Prerequisitos

Antes de comenzar, asegúrate de tener instalado:

- **Python 3.7+**
- **Node.js 14+** y **npm**
- **PostgreSQL 12+**
- **Git**

## 🚀 Instalación

### 1. Clonar el Repositorio

```bash
git clone https://github.com/Cgamez28/Proyecto_F_Redes.git
cd Proyecto_F_Redes
```

### 2. Configurar el Backend y ETL

```bash
# Crear entorno virtual de Python
python -m venv venv

# Activar entorno virtual
# En Linux/Mac:
source venv/bin/activate
# En Windows:
venv\Scripts\activate

# Instalar dependencias de Python
pip install -r requirements.txt
```

### 3. Configurar PostgreSQL

```bash
# Crear la base de datos
createdb corrupcion_co

# Configurar las credenciales en etl_scripts/etl_politicos.py
# DB_URI = 'postgresql://usuario:contraseña@localhost:5432/corrupcion_co'
```

### 4. Configurar el Frontend

```bash
cd frontend_app
npm install
```

## 💻 Uso

### Ejecutar el Proceso ETL

El proceso ETL carga los datos desde `etl_scripts/datos_origen.csv` a PostgreSQL:

```bash
cd etl_scripts
python etl_politicos.py
```

El script realiza:
1. **Extracción**: Lee datos del archivo CSV
2. **Transformación**: 
   - Estandariza nombres y partidos políticos (formato título, sin espacios extra)
   - Calcula score de riesgo basado en ausentismo
   - Renombra columnas para coincidir con el esquema de BD
3. **Carga**: Inserta datos en la tabla `politicians` de PostgreSQL

### Ejecutar el Backend API

```bash
cd backend_api
flask run
# o
python app.py
```

El servidor estará disponible en `http://localhost:5000`

### Ejecutar el Frontend

```bash
cd frontend_app
npm start
```

La aplicación estará disponible en `http://localhost:3000`

## 📊 Estructura de Datos

### Archivo CSV de Origen (`datos_origen.csv`)

```csv
Nombre Completo,Partido Politico,Rol Actual,Votos Recientes
JUAN PEREZ,Partido Liberal,Senador,Si;No;Si
Maria Rodriguez,centro democratico,Representante,No;No;Absente
```

### Tabla PostgreSQL (`politicians`)

| Columna      | Tipo    | Descripción                              |
|--------------|---------|------------------------------------------|
| full_name    | VARCHAR | Nombre completo del político             |
| party        | VARCHAR | Partido político                         |
| current_rol  | VARCHAR | Rol actual (Senador, Representante, etc) |
| risk_score   | FLOAT   | Score de riesgo calculado                |

### Cálculo del Risk Score

- **Riesgo bajo (10.0)**: Político sin ausentismo registrado
- **Riesgo medio (50.0)**: Político con registro de "Absente" en votaciones

## 🔄 Flujo de Datos

```
CSV (datos_origen.csv) 
    ↓
ETL Script (limpieza y transformación)
    ↓
PostgreSQL Database (centralización)
    ↓
Flask API (acceso a datos)
    ↓
React Frontend (visualización)
```

## 🌟 Características Futuras

- [ ] Integración completa entre frontend y backend
- [ ] Dashboard interactivo con visualizaciones
- [ ] Búsqueda y filtrado de políticos
- [ ] Perfiles detallados con historial completo
- [ ] Integración con fuentes de datos gubernamentales oficiales
- [ ] Sistema de alertas para cambios significativos
- [ ] API pública con documentación Swagger
- [ ] Autenticación y autorización de usuarios
- [ ] Exportación de reportes en PDF

## 🤝 Contribuciones

Este proyecto está en desarrollo activo. Las contribuciones son bienvenidas:

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📝 Licencia

Este proyecto es de código abierto y está disponible bajo una licencia apropiada para proyectos educativos.

## 👥 Autores

- Proyecto desarrollado como parte de un curso de Redes de Datos

## 📞 Contacto

Para preguntas o sugerencias sobre el proyecto, por favor abre un issue en GitHub.

---

**Nota**: Este es un proyecto educativo diseñado para demostrar la implementación de una arquitectura de tres capas con procesamiento ETL y almacenamiento en base de datos relacional.