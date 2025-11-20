import React, { useState } from 'react';
import './App.css';

function App() {
  // Estados de la aplicación
  const [view, setView] = useState('search'); // 'search', 'detail', 'about'
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [selectedPolitician, setSelectedPolitician] = useState(null);
  const [loading, setLoading] = useState(false);

  // --- FUNCIONES AUXILIARES ---
  const getRiskClass = (score) => {
    if (score < 30) return 'risk-low';
    if (score < 60) return 'risk-medium';
    return 'risk-high';
  };

  const getRiskLabel = (score) => {
    if (score < 30) return 'BAJO RIESGO';
    if (score < 60) return 'RIESGO MEDIO';
    return 'ALTO RIESGO';
  };

  const getRiskColor = (score) => {
    if (score < 30) return '#10b981'; // Verde
    if (score < 60) return '#f59e0b'; // Naranja
    return '#ef4444'; // Rojo
  };

  // --- CONEXIÓN CON API ---
  const searchPoliticians = async (e) => {
    const searchTerm = e.target.value;
    setQuery(searchTerm);
    if (searchTerm.length > 2) {
      setLoading(true);
      try {
        const response = await fetch(`http://127.0.0.1:5000/api/politicians/search?q=${searchTerm}`);
        const data = await response.json();
        setResults(data);
      } catch (error) { console.error(error); }
      setLoading(false);
    } else { setResults([]); }
  };

  const fetchPoliticianDetail = async (id) => {
    setLoading(true);
    try {
      const response = await fetch(`http://127.0.0.1:5000/api/politicians/${id}`);
      const data = await response.json();
      setSelectedPolitician(data); // Guardamos toda la info (judicial, academica)
      setView('detail'); // Cambiamos a la vista de detalle
    } catch (error) { console.error(error); }
    setLoading(false);
  };

  // --- VISTAS (COMPONENTES INTERNOS) ---

  // 1. VISTA DE ACERCA DE
  const AboutView = () => (
    <div className="detail-view">
      <h2 style={{color: '#1e3a8a'}}>Sobre este Proyecto</h2>
      <p>
        Esta aplicación es un prototipo académico desarrollado como parte de la investigación 
        <strong> "Aplicación ciudadana contra la corrupción en Colombia"</strong>.
      </p>
      <p>
        <strong>Objetivo:</strong> Centralizar bases de datos públicas (SECOP, Rama Judicial, Congreso) 
        para crear perfiles de riesgo accesibles a la ciudadanía.
      </p>
      <ul>
        <li><strong>Autor:</strong> Cristian Andrés Gámez Núñez</li>
        <li><strong>Universidad:</strong> Distrital Francisco José de Caldas</li>
        <li><strong>Facultad:</strong> Ingeniería</li>
      </ul>
    </div>
  );

  // 2. VISTA DE DETALLE DEL POLÍTICO
  const DetailView = () => {
    if (!selectedPolitician) return null;
    const { profile, academic_history, judicial_records } = selectedPolitician;

    return (
      <div className="detail-view">
        <button className="back-btn" onClick={() => setView('search')}>← Volver a la búsqueda</button>
        
        {/* Encabezado del Perfil */}
        <div className="detail-header">
          <img src={profile.image_url} alt={profile.full_name} className="detail-avatar" />
          <div>
            <h1 style={{margin:0}}>{profile.full_name}</h1>
            <p style={{margin: '5px 0', color: '#666'}}>{profile.party} | {profile.current_role}</p>
            <span 
              className="risk-badge-large" 
              style={{backgroundColor: getRiskColor(profile.risk_score)}}
            >
              NIVEL DE RIESGO: {profile.risk_score}/100
            </span>
          </div>
        </div>

        {/* Sección: ¿Por qué este riesgo? (Judicial) */}
        <h3 className="section-title">⚖️ Historial Judicial y Disciplinario</h3>
        {judicial_records && judicial_records.length > 0 ? (
          judicial_records.map((record, idx) => (
            <div key={idx} className="corruption-case">
              <strong>Caso: {record.case_number}</strong>
              <p>{record.description}</p>
              <small>Estado: {record.status}</small>
            </div>
          ))
        ) : (
          <p>No se registran procesos activos en las fuentes consultadas.</p>
        )}

        {/* Sección: Académico */}
        <h3 className="section-title">🎓 Formación Académica</h3>
        <ul>
          {academic_history && academic_history.map((record, idx) => (
            <li key={idx}>{record.degree} - {record.institution} ({record.year})</li>
          ))}
        </ul>
      </div>
    );
  };

  // --- RENDER PRINCIPAL ---
  return (
    <div className="app-container">
      <header className="header">
        <h1>🇨🇴 Monitor Ciudadano</h1>
        
        {/* Barra de Navegación */}
        <nav className="navbar">
          <button 
            className={`nav-btn ${view === 'search' ? 'active' : ''}`} 
            onClick={() => setView('search')}
          >
            Buscador
          </button>
          <button 
            className={`nav-btn ${view === 'about' ? 'active' : ''}`} 
            onClick={() => setView('about')}
          >
            Acerca del Proyecto
          </button>
        </nav>
      </header>

      {/* Renderizado Condicional de Vistas */}
      
      {view === 'about' && <AboutView />}

      {view === 'detail' && <DetailView />}

      {view === 'search' && (
        <>
          <div className="search-box">
            <input
              type="text"
              className="search-input"
              placeholder="🔍 Buscar funcionario (ej. Ana, Juan)..."
              value={query}
              onChange={searchPoliticians}
            />
          </div>

          <main className="results-grid">
            {!loading && results.length === 0 && query.length > 2 && <p>No hay resultados.</p>}
            
            {results.map((politician) => (
              <div 
                key={politician.id} 
                className={`politician-card ${getRiskClass(politician.risk_score)}`}
                onClick={() => fetchPoliticianDetail(politician.id)} // ¡Click para ver detalle!
                title="Click para ver detalles"
              >
                <div style={{textAlign: 'center'}}>
                  <img src={politician.image_url} alt="Avatar" className="card-avatar"/>
                </div>
                <div className="card-header">
                  <h2>{politician.full_name}</h2>
                  <div className="party-name">{politician.party}</div>
                  <span className="role-badge">{politician.current_role}</span>
                </div>
                <div className="risk-indicator">
                  <span className="risk-label">RIESGO</span>
                  <span className="risk-value">{getRiskLabel(politician.risk_score)}</span>
                </div>
              </div>
            ))}
          </main>
        </>
      )}
    </div>
  );
}

export default App;