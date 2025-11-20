import React, { useState, useEffect } from 'react'; // Agregamos useEffect
import './App.css';

function App() {
  const [view, setView] = useState('search');
  const [results, setResults] = useState([]);
  const [selectedPolitician, setSelectedPolitician] = useState(null);
  const [loading, setLoading] = useState(false);

  // ESTADOS PARA LOS FILTROS
  const [searchText, setSearchText] = useState('');
  const [filterParty, setFilterParty] = useState('Todos');
  const [filterRisk, setFilterRisk] = useState('all');

  // Lista de partidos (podría venir de BD, pero la hardcodeamos por simplicidad)
  const parties = ['Todos', 'Partido Liberal', 'Partido Verde', 'Pacto Historico', 'Centro Democratico', 'Cambio Radical', 'Partido de la U', 'Partido Conservador'];

  // Función unificada de búsqueda
  const executeSearch = async () => {
    setLoading(true);
    try {
      // Construimos la URL con todos los filtros
      let url = `http://127.0.0.1:5000/api/politicians/search?q=${searchText}`;
      
      if (filterParty !== 'Todos') {
        url += `&party=${encodeURIComponent(filterParty)}`;
      }
      if (filterRisk !== 'all') {
        url += `&risk=${filterRisk}`;
      }

      const response = await fetch(url);
      const data = await response.json();
      setResults(data);
    } catch (error) {
      console.error(error);
    }
    setLoading(false);
  };

  // Efecto para buscar automáticamente cuando cambian los filtros
  useEffect(() => {
    executeSearch();
  }, [filterParty, filterRisk]); // Se ejecuta si cambia el partido o el riesgo

  // Manejo del Enter en el buscador
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') executeSearch();
  };

  // ... (Funciones auxiliares getRiskClass, getRiskLabel, getRiskColor IGUAL QUE ANTES)
  const getRiskClass = (score) => { if (score < 30) return 'risk-low'; if (score < 60) return 'risk-medium'; return 'risk-high'; };
  const getRiskLabel = (score) => { if (score < 30) return 'BAJO RIESGO'; if (score < 60) return 'RIESGO MEDIO'; return 'ALTO RIESGO'; };
  const getRiskColor = (score) => { if (score < 30) return '#10b981'; if (score < 60) return '#f59e0b'; return '#ef4444'; };
  
  const fetchPoliticianDetail = async (id) => {
    setLoading(true);
    try {
      const response = await fetch(`http://127.0.0.1:5000/api/politicians/${id}`);
      const data = await response.json();
      setSelectedPolitician(data);
      setView('detail');
    } catch (error) { console.error(error); }
    setLoading(false);
  };

  // ... (Componentes AboutView y DetailView IGUAL QUE ANTES, no hace falta cambiarlos)
  const AboutView = () => ( <div className="detail-view"><h2>Sobre el Proyecto</h2><p>Herramienta de control social académico.</p></div> );

  const DetailView = () => {
    if (!selectedPolitician) return null;
    const { profile, academic_history, judicial_records } = selectedPolitician;
    return (
      <div className="detail-view">
        <button className="back-btn" onClick={() => setView('search')}>← Volver</button>
        <div className="detail-header">
          <img src={profile.image_url} alt={profile.full_name} className="detail-avatar" />
          <div>
            <h1 style={{margin:0}}>{profile.full_name}</h1>
            <p style={{margin: '5px 0', color: '#666'}}>{profile.party} | {profile.current_role}</p>
            <span className="risk-badge-large" style={{backgroundColor: getRiskColor(profile.risk_score)}}>RIESGO: {profile.risk_score}/100</span>
          </div>
        </div>
        <h3 className="section-title">⚖️ Historial Judicial</h3>
        {judicial_records && judicial_records.length > 0 ? (
          judicial_records.map((record, idx) => (
            <div key={idx} className="corruption-case"><strong>Caso: {record.case_number}</strong><p>{record.description}</p></div>
          ))
        ) : (<p>No se registran procesos.</p>)}
        <h3 className="section-title">🎓 Formación</h3>
        <ul>{academic_history && academic_history.map((record, idx) => (<li key={idx}>{record.degree} - {record.institution}</li>))}</ul>
      </div>
    );
  };

  return (
    <div className="app-container">
      <header className="header">
        <h1>🇨🇴 Monitor Ciudadano</h1>
        <nav className="navbar">
          <button className={`nav-btn ${view === 'search' ? 'active' : ''}`} onClick={() => setView('search')}>Buscador</button>
          <button className={`nav-btn ${view === 'about' ? 'active' : ''}`} onClick={() => setView('about')}>Acerca de</button>
        </nav>
      </header>

      {view === 'about' && <AboutView />}
      {view === 'detail' && <DetailView />}

      {view === 'search' && (
        <>
          {/* BARRA DE HERRAMIENTAS DE FILTRADO */}
          <div className="filters-container">
            <input 
              type="text" 
              className="search-input-small" 
              placeholder="Buscar por nombre..." 
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              onKeyDown={handleKeyDown}
            />
            
            <select className="filter-select" value={filterParty} onChange={(e) => setFilterParty(e.target.value)}>
              {parties.map(p => <option key={p} value={p}>{p}</option>)}
            </select>

            <select className="filter-select" value={filterRisk} onChange={(e) => setFilterRisk(e.target.value)}>
              <option value="all">Todos los Riesgos</option>
              <option value="high">🔴 Alto Riesgo</option>
              <option value="medium">🟠 Riesgo Medio</option>
              <option value="low">🟢 Bajo Riesgo</option>
            </select>

            <button className="search-btn" onClick={executeSearch}>Buscar</button>
          </div>

          <main className="results-grid">
            {loading && <p>Cargando...</p>}
            {!loading && results.length === 0 && <p>No se encontraron resultados con esos filtros.</p>}
            
            {results.map((politician) => (
              <div key={politician.id} className={`politician-card ${getRiskClass(politician.risk_score)}`} onClick={() => fetchPoliticianDetail(politician.id)}>
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