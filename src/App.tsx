import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Users, 
  BarChart3, 
  Vote, 
  Activity,
  Zap,
  Target,
  Search,
  Map as MapIcon,
  ChevronRight,
  TrendingUp,
  MapPin,
  Clock,
  CheckCircle2,
  AlertCircle,
  Smartphone,
  LayoutDashboard,
  Plus,
  Cloud,
  CloudOff,
  CheckCircle,
  Loader2
} from 'lucide-react';
import { District, RouteItem, Stats, PartyConfig, Brigadist, MapMode, SurveyQuestion } from './types';
import { PhoneFrame, RouteListItem } from './components/BrigadistaUI';
import { DistrictCard } from './components/CoordinatorUI';
import { TeamManagement } from './components/TeamManagement';
import { RouteDistribution } from './components/RouteDistribution';
import { MapContainer, TileLayer, Polygon, CircleMarker, Popup as LeafletPopup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

const DISTRICTS: District[] = [
  { id: '1', name: "D1 · Centro Histórico", color: "#00F0C0", status: 'hot', visits: 143, brigades: 9, coverage: 72, target: 200, coordinator: 'Lic. Carmen Flores', coords: [[21.510,-104.910],[21.510,-104.885],[21.495,-104.885],[21.495,-104.910]] },
  { id: '2', name: "D2 · Linda Vista Norte", color: "#8B5CF6", status: 'active', visits: 89, brigades: 6, coverage: 58, target: 150, coordinator: 'Prof. Roberto Jiménez', coords: [[21.530,-104.920],[21.530,-104.895],[21.510,-104.895],[21.510,-104.920]] },
  { id: '3', name: "D3 · Las Brisas Oriente", color: "#3B82F6", status: 'lag', visits: 52, brigades: 4, coverage: 34, target: 150, coordinator: 'C. Mónica Ruiz', coords: [[21.530,-104.895],[21.530,-104.865],[21.510,-104.865],[21.510,-104.895]] },
  { id: '4', name: "D4 · Industrial Poniente", color: "#F59E0B", status: 'crit', visits: 31, brigades: 3, coverage: 21, target: 140, coordinator: 'Mtro. Álvaro Vega', coords: [[21.495,-104.920],[21.495,-104.895],[21.475,-104.895],[21.475,-104.920]] },
  { id: '5', name: "D5 · Miravalles Sur", color: "#10B981", status: 'exc', visits: 178, brigades: 11, coverage: 81, target: 220, coordinator: 'Ing. Patricia Soto', coords: [[21.495,-104.895],[21.495,-104.865],[21.475,-104.865],[21.475,-104.895]] }
];

const ROUTE: RouteItem[] = [
  { id: '1', address: 'Insurgentes 247', colonia: 'Col. Centro', status: 'done', order: 1 },
  { id: '2', address: 'Morelos 89', colonia: 'Col. Centro', status: 'done', order: 2 },
  { id: '3', address: 'Allende 312', colonia: 'Linda Vista', status: 'current', order: 3 },
  { id: '4', address: 'Juárez 445 Int. B', colonia: 'Linda Vista', status: 'pending', order: 4 },
  { id: '5', address: 'Madero 78', colonia: 'Miravalles', status: 'pending', order: 5 },
  { id: '6', address: 'Reforma 190', colonia: 'Miravalles', status: 'pending', order: 6 },
];

const STATS: Stats = {
  visitsToday: 483,
  activeBrigades: 31,
  globalCoverage: 54,
  surveysCaptured: 391,
  topProblems: [
    { label: 'Seguridad', count: 43, color: '#EF4444' },
    { label: 'Agua/Servicios', count: 28, color: '#3B82F6' },
    { label: 'Empleo', count: 18, color: '#F59E0B' },
    { label: 'Salud', count: 11, color: '#10B981' }
  ]
};

export default function App() {
  const [view, setView] = useState<'brigadista' | 'coordinador'>('brigadista');
  const [coordSubView, setCoordSubView] = useState<'dashboard' | 'team' | 'routes' | 'surveys' | 'settings'>('dashboard');
  const [screen, setScreen] = useState(-1); // -1 for login/name selection
  const [selectedDistrict, setSelectedDistrict] = useState(DISTRICTS[0]);
  const [mapMode, setMapMode] = useState<MapMode>('districts');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  
  // Sync status: 'idle', 'pending', 'syncing', 'done'
  const [syncStatus, setSyncStatus] = useState<'idle' | 'pending' | 'syncing' | 'done'>('idle');
  
  const [party, setParty] = useState<PartyConfig>({
    id: '1',
    name: 'Brigada MX',
    primaryColor: '#00F0C0',
    logoUrl: '',
    slogan: 'Digitización Territorial'
  });

  const [surveyQuestions, setSurveyQuestions] = useState<SurveyQuestion[]>(
    QUESTIONS.map((q, i) => ({
      id: String(i + 1),
      question: q.q,
      type: 'choice',
      options: q.opts
    }))
  );

  React.useEffect(() => {
    document.documentElement.style.setProperty('--primary-color', party.primaryColor);
  }, [party.primaryColor]);

  const [brigadists, setBrigadists] = useState<Brigadist[]>([
    { id: '1', name: 'Carlos Mendoza', code: 'MX-482', status: 'active' },
    { id: '2', name: 'Patricia Soto', code: 'MX-912', status: 'active' },
    { id: '3', name: 'Raúl Ortega', code: 'MX-105', status: 'active' },
  ]);

  const [selectedBrigadist, setSelectedBrigadist] = useState<Brigadist | null>(null);

  const handleLogin = (b: Brigadist) => {
    setSelectedBrigadist(b);
    setScreen(0);
  };

  return (
    <div className="min-h-screen bg-bg selection:bg-teal/30">
      {/* Role Tabs */}
      <nav className="fixed top-0 left-0 right-0 z-[100] h-14 bg-bg/80 backdrop-blur-2xl border-b border-white/5 px-6 flex items-center gap-8">
        <div className="flex items-center gap-2 mr-8">
          <div className="w-8 h-8 bg-teal rounded-lg flex items-center justify-center text-bg font-black font-display text-base shadow-[0_0_15px_rgba(0,240,192,0.3)]">B</div>
          <span className="font-display font-black text-sm tracking-tight">Brigada<span className="text-teal">MX</span></span>
        </div>
        
        <div className="flex h-full">
          <TabButton active={view === 'brigadista'} onClick={() => setView('brigadista')} icon={<Smartphone size={14} />} label="App Brigadista" />
          <TabButton active={view === 'coordinador'} onClick={() => setView('coordinador')} icon={<LayoutDashboard size={14} />} label="Coordinador de Distrito" />
        </div>

        <div className="ml-auto flex items-center gap-4">
          <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-green-500/10 border border-green-500/20 rounded-full">
            <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
            <span className="text-[10px] font-black text-green-500 uppercase tracking-widest">En Vivo</span>
          </div>
          <button className="text-[10px] font-black text-teal border border-teal/20 px-3 py-1 rounded-full hover:bg-teal/10 transition-colors uppercase tracking-widest">Descargar PDF</button>
        </div>
      </nav>

      <main className="pt-14 pb-12 w-full h-screen overflow-hidden">
        <AnimatePresence mode="wait">
          {view === 'brigadista' ? (
            <motion.div 
              key="brig"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex h-full"
            >
              <div className="w-[450px] flex-shrink-0 flex flex-col items-center justify-center border-r border-white/5 bg-s1/30 px-10">
                <p className="text-[10px] font-black uppercase text-faint tracking-[0.2em] mb-8 self-start">Vista del Brigadista · Campo</p>
                <PhoneFrame>
                   <AnimatePresence mode="wait">
                    {screen === -1 && (
                      <BrigLoginSelection 
                        brigadists={brigadists} 
                        onSelect={handleLogin} 
                        party={party}
                      />
                    )}
                    {screen === 0 && <BrigScreenSplash onNext={() => setScreen(1)} brigadist={selectedBrigadist} party={party} />}
                    {screen === 1 && <BrigScreenZone onNext={() => setScreen(2)} onBack={() => setScreen(0)} />}
                    {screen === 2 && <BrigScreenRoute onNext={() => setScreen(3)} onBack={() => setScreen(1)} brigadist={selectedBrigadist} />}
                    {screen === 3 && <BrigScreenNav onNext={() => setScreen(4)} onBack={() => setScreen(2)} />}
                    {screen === 4 && <BrigScreenAtDoor onNext={() => setScreen(5)} onBack={() => setScreen(3)} />}
                    {screen >= 5 && screen <= 7 && <BrigScreenSurvey num={screen - 4} onNext={() => setScreen(screen + 1)} />}
                    {screen === 8 && <BrigScreenSurvey num={4} onNext={() => {
                        setSyncStatus('pending');
                        setScreen(9);
                        // Simulate auto-sync after 3 seconds
                        setTimeout(() => {
                          setSyncStatus('syncing');
                          setTimeout(() => {
                            setSyncStatus('done');
                            setTimeout(() => setSyncStatus('idle'), 3000);
                          }, 2000);
                        }, 3000);
                    }} />}
                    {screen === 9 && <BrigScreenDone onNext={() => setScreen(2)} />}
                   </AnimatePresence>

                   {/* Global Sync Indicator Overlay */}
                   <AnimatePresence>
                     {syncStatus !== 'idle' && (
                       <motion.div 
                         initial={{ y: -50, opacity: 0 }}
                         animate={{ y: 0, opacity: 1 }}
                         exit={{ y: -50, opacity: 0 }}
                         className="absolute top-10 left-1/2 -translate-x-1/2 z-[200] w-[80%]"
                       >
                         <div className={`
                           flex items-center gap-2 px-3 py-2 rounded-2xl shadow-lg border backdrop-blur-md
                           ${syncStatus === 'pending' ? 'bg-amber-500/90 border-amber-400 text-white' : 
                             syncStatus === 'syncing' ? 'bg-white/90 border-white text-bg' : 
                             'bg-teal/90 border-teal text-bg'}
                         `}>
                            {syncStatus === 'pending' && (
                              <>
                                <CloudOff size={14} className="animate-pulse" />
                                <span className="text-[10px] font-black uppercase tracking-tight">Pendiente (Offline)</span>
                              </>
                            )}
                            {syncStatus === 'syncing' && (
                              <>
                                <Loader2 size={14} className="animate-spin" />
                                <span className="text-[10px] font-black uppercase tracking-tight">Sincronizando...</span>
                              </>
                            )}
                            {syncStatus === 'done' && (
                              <>
                                <motion.div
                                  initial={{ scale: 0.5 }}
                                  animate={{ scale: [1.5, 1] }}
                                  transition={{ type: "spring" }}
                                >
                                  <CheckCircle size={14} />
                                </motion.div>
                                <span className="text-[10px] font-black uppercase tracking-tight">¡Sincronizado!</span>
                              </>
                            )}
                         </div>
                       </motion.div>
                     )}
                   </AnimatePresence>
                </PhoneFrame>
                
                <div className="mt-8 flex gap-2">
                  {[0,1,2,3,4,5,6,7,8,9].map(i => (
                    <div key={i} className={`w-1.5 h-1.5 rounded-full transition-all ${screen === i ? 'bg-teal w-4' : 'bg-white/10'}`} />
                  ))}
                </div>
              </div>

              <div className="flex-1 p-12 overflow-y-auto bg-bg relative">
                <div className="max-w-xl">
                  <h2 className="text-3xl font-black font-display mb-2">Del papel a datos en tiempo real</h2>
                  <p className="text-dim leading-relaxed mb-12">BrigadaMX convierte cada toque de puerta en inteligencia electoral medible. Sin capacitación técnica, funciona offline.</p>
                  
                  <div className="space-y-10">
                    <FeatureStep n={1} color="text-teal" bg="bg-teal/10" title="Login con código de brigada" desc="Sin registro personal. El coordinador comparte un código temporal. El brigadista abre el navegador y empieza." />
                    <FeatureStep n={2} color="text-purple-400" bg="bg-purple-400/10" title="Ruta asignada automáticamente" desc="La ciudad se divide en micro-zonas. Cada brigadista tiene su ruta optimizada. El sistema le dice a dónde ir paso a paso." />
                    <FeatureStep n={3} color="text-blue-400" bg="bg-blue-400/10" title="Toque → 4 preguntas → 30 segundos" desc="Abre la puerta, el brigadista toca 4 botones. Sin escribir nada. Los datos se envían al bunker en tiempo real." />
                  </div>

                  <div className="grid grid-cols-2 gap-4 mt-16">
                    <div className="bg-s1 border border-white/5 rounded-3xl p-6">
                      <p className="text-4xl font-black text-teal font-display">800</p>
                      <p className="text-[10px] text-dim uppercase tracking-widest font-black">encuestas diarias</p>
                    </div>
                    <div className="bg-s1 border border-white/5 rounded-3xl p-6">
                      <p className="text-4xl font-black text-amber-500 font-display">$0</p>
                      <p className="text-[10px] text-dim uppercase tracking-widest font-black">costo del papel</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div 
              key="coord"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="flex h-full"
            >
              {/* Mobile Header for Coordinator */}
              <div className="md:hidden flex items-center justify-between p-4 bg-s1 border-b border-white/5 sticky top-0 z-[110]">
                 <div className="flex items-center gap-2">
                    <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 bg-white/5 rounded-lg text-teal">
                       <MapIcon size={20} />
                    </button>
                    <span className="font-display font-black text-xs uppercase tracking-widest">{coordSubView}</span>
                 </div>
                 <div className="flex items-center gap-4">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                    <span className="text-[10px] font-black text-faint tracking-widest">LIVE</span>
                 </div>
              </div>

              {/* Coordinator Sidebar Menu */}
              <div className={`${sidebarOpen ? 'w-64' : 'w-0 overflow-hidden md:w-20'} bg-s1 border-r border-white/5 flex flex-col pt-6 transition-all duration-300 relative`}>
                <p className={`px-6 text-[9px] font-black uppercase text-faint tracking-widest mb-4 ${!sidebarOpen && 'md:hidden'}`}>Módulos de Líder</p>
                <CoordMenuButton active={coordSubView === 'dashboard'} onClick={() => {setCoordSubView('dashboard'); window.innerWidth < 768 && setSidebarOpen(false)}} icon={<LayoutDashboard size={18} />} label="Dashboard Central" collapsed={!sidebarOpen} />
                <CoordMenuButton active={coordSubView === 'team'} onClick={() => {setCoordSubView('team'); window.innerWidth < 768 && setSidebarOpen(false)}} icon={<Users size={18} />} label="Gestión de Equipo" collapsed={!sidebarOpen} />
                <CoordMenuButton active={coordSubView === 'routes'} onClick={() => {setCoordSubView('routes'); window.innerWidth < 768 && setSidebarOpen(false)}} icon={<MapIcon size={18} />} label="Optimizador Rutas" collapsed={!sidebarOpen} />
                <CoordMenuButton active={coordSubView === 'surveys'} onClick={() => {setCoordSubView('surveys'); window.innerWidth < 768 && setSidebarOpen(false)}} icon={<BarChart3 size={18} />} label="Config. Encuesta" collapsed={!sidebarOpen} />
                <CoordMenuButton active={coordSubView === 'settings'} onClick={() => {setCoordSubView('settings'); window.innerWidth < 768 && setSidebarOpen(false)}} icon={<Target size={18} />} label="Identidad Visual" collapsed={!sidebarOpen} />
                
                <button 
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  className="absolute -right-3 top-20 w-6 h-6 bg-s2 border border-white/10 rounded-full flex items-center justify-center text-teal shadow-xl"
                >
                  <ChevronRight size={14} className={`transition-transform ${sidebarOpen ? 'rotate-180' : ''}`} />
                </button>
              </div>

              <div className="flex-1 flex flex-col overflow-hidden">
                {coordSubView === 'dashboard' && (
                  <>
                    <div className="grid grid-cols-2 md:grid-cols-5 border-b border-white/5 bg-s1/20 items-center overflow-x-auto no-scrollbar">
                      <KPICell label="Visitas Hoy" val={STATS.visitsToday} sub="↑ 89 última hora" color="text-teal" />
                      <KPICell label="Brigadistas Activos" val={`${brigadists.length}/38`} sub="Tepic Metropolitano" color="text-blue-400" />
                      <KPICell label="Cobertura Global" val={`${STATS.globalCoverage}%`} sub="Promedio Nayarit" color="text-purple-400" />
                      <KPICell label="Inteligencia IA" val={STATS.surveysCaptured} sub="Encuestas válidas" color="text-green-400" />
                      <KPICell label="Problema #1" val="Seguridad" sub="43% de incidencia" color="text-red-400" />
                    </div>

                    <div className="flex-1 flex overflow-hidden relative">
                      <div className="flex-1 relative z-0">
                        <MapContainer center={[21.503,-104.892]} zoom={13} style={{ height: '100%', width: '100%', background: '#0F172A' }}>
                          <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />
                          {mapMode === 'districts' ? (
                            DISTRICTS.map((d) => (
                              <Polygon 
                                key={d.id}
                                positions={d.coords as any}
                                pathOptions={{ color: d.color, fillColor: d.color, fillOpacity: selectedDistrict.id === d.id ? 0.35 : 0.15, weight: selectedDistrict.id === d.id ? 3 : 1 }}
                                eventHandlers={{ click: () => setSelectedDistrict(d) }}
                              >
                                 <LeafletPopup className="bg-bg text-white border-white/10">
                                    <div className="p-2">
                                      <h4 className="font-black text-sm mb-1">{d.name}</h4>
                                      <p className="text-[10px] text-faint">Cobertura: {d.coverage}%</p>
                                    </div>
                                 </LeafletPopup>
                              </Polygon>
                            ))
                          ) : (
                            // Use CircleMarkers to simulate a Heatmap/Density map
                            [...Array(100)].map((_, i) => {
                              const lat = 21.47 + Math.random() * 0.06;
                              const lng = -104.93 + Math.random() * 0.06;
                              const intensity = Math.random();
                              return (
                                <CircleMarker 
                                  key={i}
                                  center={[lat, lng]} 
                                  radius={15 + intensity * 20} 
                                  pathOptions={{ 
                                    color: 'transparent', 
                                    fillColor: intensity > 0.7 ? '#EF4444' : intensity > 0.4 ? '#F59E0B' : '#10B981', 
                                    fillOpacity: 0.3 
                                  }} 
                                />
                              )
                            })
                          )}
                          {/* Simulated Active Brigadistas in Real-time */}
                          <CircleMarker center={[21.503,-104.898]} radius={5} pathOptions={{ color: 'white', fillColor: '#3B82F6', fillOpacity: 1 }} />
                          <CircleMarker center={[21.506,-104.891]} radius={5} pathOptions={{ color: 'white', fillColor: '#3B82F6', fillOpacity: 1 }} />
                          <CircleMarker center={[21.501,-104.902]} radius={5} pathOptions={{ color: 'white', fillColor: '#3B82F6', fillOpacity: 1 }} />
                        </MapContainer>

                        {/* Map Mode Toggle Overlay */}
                        <div className="absolute top-4 left-4 z-[1000] flex bg-s2/80 backdrop-blur-xl border border-white/10 rounded-xl p-1 shadow-2xl">
                          <button 
                            onClick={() => setMapMode('districts')}
                            className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${mapMode === 'districts' ? 'bg-teal text-bg' : 'text-dim hover:text-white'}`}
                          >
                            Zonas
                          </button>
                          <button 
                            onClick={() => setMapMode('heatmap')}
                            className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${mapMode === 'heatmap' ? 'bg-amber-500 text-bg' : 'text-dim hover:text-white'}`}
                          >
                            Mapa de Calor
                          </button>
                        </div>
                      </div>

                      <div className="hidden lg:block w-[360px] bg-bg border-l border-white/5 overflow-y-auto">
                        <div className="p-5 border-b border-white/5 bg-s1/30 flex justify-between items-center">
                          <span className="text-[10px] font-black uppercase text-faint tracking-widest">Estado por Distrito</span>
                          <span className="text-[10px] font-black text-teal">ACTIVOS</span>
                        </div>
                        {DISTRICTS.map(d => (
                          <DistrictCard 
                            key={d.id} 
                            district={d} 
                            isSelected={selectedDistrict.id === d.id} 
                            onClick={() => setSelectedDistrict(d)} 
                          />
                        ))}

                        <div className="p-5">
                          <h3 className="text-[10px] font-black uppercase text-faint tracking-widest mb-4">Muro de Actividad</h3>
                          <div className="space-y-4">
                            <ActivityFeedItem name="Carlos M." action="registró visita en Allende 312" sub="hace 2 min · D1 Centro" initial="CM" color="bg-teal/20 text-teal" />
                            <ActivityFeedItem name="Patricia S." action="completó ruta Miravalles" sub="hace 8 min · D5" initial="PS" color="bg-green-400/20 text-green-400" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {coordSubView === 'team' && (
                  <div className="flex-1 p-4 md:p-10 overflow-y-auto">
                    <TeamManagement />
                  </div>
                )}

                {coordSubView === 'routes' && (
                  <div className="flex-1 p-4 md:p-10 overflow-y-auto">
                    <RouteDistribution />
                  </div>
                )}

                {coordSubView === 'surveys' && (
                  <div className="flex-1 p-4 md:p-10 overflow-y-auto">
                    <div className="max-w-4xl mx-auto space-y-8">
                       <div className="flex justify-between items-center bg-s1/50 p-8 rounded-[2.5rem] border border-white/5">
                          <div>
                             <h2 className="text-2xl font-black mb-1">Configuración de Encuesta</h2>
                             <p className="text-dim text-xs">Define las preguntas que los brigadistas aplicarán en campo.</p>
                          </div>
                          <button className="bg-teal text-bg px-5 py-2.5 rounded-xl font-black text-xs uppercase flex items-center gap-2">
                             <Plus size={16} /> Agregar Pregunta
                          </button>
                       </div>

                       <div className="space-y-4">
                          {surveyQuestions.map((q, idx) => (
                            <div key={q.id} className="bg-s1/30 border border-white/5 p-6 rounded-3xl group hover:border-teal/30 transition-all">
                               <div className="flex justify-between items-start mb-4">
                                  <div className="flex gap-4 items-center">
                                     <div className="w-8 h-8 bg-white/5 rounded-lg flex items-center justify-center text-[10px] font-black text-faint tracking-widest">{idx + 1}</div>
                                     <h3 className="font-bold text-white">{q.question}</h3>
                                  </div>
                                  <div className="flex gap-2">
                                     <button className="p-2 bg-white/5 rounded-lg text-dim hover:text-white transition-colors"><Zap size={14} /></button>
                                     <button className="p-2 bg-white/5 rounded-lg text-dim hover:text-red-500 transition-colors"><AlertCircle size={14} /></button>
                                  </div>
                               </div>
                               <div className="flex flex-wrap gap-2 pl-12">
                                  {q.options?.map((opt, i) => (
                                    <span key={i} className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-[10px] font-bold text-dim group-hover:text-teal group-hover:border-teal/20 transition-all">{opt}</span>
                                  ))}
                               </div>
                            </div>
                          ))}
                       </div>
                    </div>
                  </div>
                )}

                {coordSubView === 'settings' && (
                  <div className="flex-1 p-10 overflow-y-auto">
                    <div className="max-w-2xl bg-s1/50 border border-white/5 rounded-[2.5rem] p-10">
                      <h2 className="text-2xl font-black mb-8">Personalización de Identidad</h2>
                      <div className="space-y-8">
                        <div>
                          <label className="text-[10px] font-black uppercase text-faint tracking-widest block mb-2">Nombre del Partido / Movimiento</label>
                          <input 
                            type="text" 
                            value={party.name} 
                            onChange={(e) => setParty({...party, name: e.target.value})}
                            className="w-full bg-bg border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-teal/50 outline-none transition-all"
                          />
                        </div>
                         <div>
                          <label className="text-[10px] font-black uppercase text-faint tracking-widest block mb-2">Slogan de Campaña</label>
                          <input 
                            type="text" 
                            value={party.slogan} 
                            onChange={(e) => setParty({...party, slogan: e.target.value})}
                            className="w-full bg-bg border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-teal/50 outline-none transition-all"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-black uppercase text-faint tracking-widest block mb-2">Color Principal (Identidad)</label>
                          <div className="flex gap-3">
                            <input 
                              type="color" 
                              value={party.primaryColor} 
                              onChange={(e) => setParty({...party, primaryColor: e.target.value})}
                              className="w-12 h-12 bg-transparent border-0 outline-none cursor-pointer p-0"
                            />
                            <input 
                              type="text" 
                              value={party.primaryColor} 
                              onChange={(e) => setParty({...party, primaryColor: e.target.value})}
                              className="flex-1 bg-bg border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-teal/50 outline-none transition-all"
                            />
                          </div>
                        </div>
                        <button className="bg-teal text-bg font-black px-8 py-4 rounded-2xl hover:scale-[1.02] transition-transform">GUARDAR CONFIGURACIÓN</button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

// Sub-components
function TabButton({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string }) {
  return (
    <button 
      onClick={onClick}
      className={`px-6 h-full flex items-center gap-2 text-[11px] font-black uppercase tracking-widest transition-all relative border-b-2 ${active ? 'text-teal border-teal' : 'text-faint border-transparent hover:text-dim'}`}
    >
      {icon} {label}
      {active && <motion.div layoutId="tab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-teal" />}
    </button>
  );
}

function FeatureStep({ n, color, bg, title, desc }: { n: number; color: string; bg: string; title: string, desc: string }) {
  return (
    <div className="flex gap-6 items-start">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black ${bg} ${color}`}>{n}</div>
      <div>
        <h4 className="font-bold text-lg mb-1">{title}</h4>
        <p className="text-dim text-sm leading-relaxed">{desc}</p>
      </div>
    </div>
  );
}

function KPICell({ label, val, sub, color }: { label: string; val: any; sub: string; color: string }) {
  return (
    <div className="p-3 md:p-5 border-r border-white/5 last:border-r-0 min-w-[120px]">
      <p className="text-[8px] md:text-[9px] font-black uppercase text-faint tracking-widest mb-1">{label}</p>
      <p className={`text-xl md:text-2xl font-black font-display leading-tight ${color}`}>{val}</p>
      <p className="text-[9px] md:text-[10px] text-faint font-medium mt-1 truncate">{sub}</p>
    </div>
  );
}

function ActivityFeedItem({ name, action, sub, initial, color }: { name: string; action: string; sub: string, initial: string, color: string }) {
  return (
    <div className="flex gap-3">
      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-black ${color}`}>{initial}</div>
      <div className="flex-1 min-w-0">
        <p className="text-[12px] leading-tight text-white"><span className="font-bold">{name}</span> {action}</p>
        <p className="text-[10px] text-faint mt-0.5">{sub}</p>
      </div>
    </div>
  );
}

/* ── PHONE SCREENS ── */

function CoordMenuButton({ active, onClick, icon, label, collapsed }: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string; collapsed?: boolean }) {
  return (
    <button 
      onClick={onClick}
      className={`w-full px-6 py-4 flex items-center gap-4 text-xs font-bold transition-all border-l-4 ${active ? 'bg-teal/5 text-teal border-teal' : 'text-dim border-transparent hover:bg-white/5 hover:text-white'} ${collapsed ? 'justify-center' : ''}`}
    >
      {icon} {!collapsed && label}
    </button>
  );
}

function BrigLoginSelection({ brigadists, onSelect, party }: { brigadists: Brigadist[], onSelect: (b: Brigadist) => void, party: PartyConfig }) {
  return (
    <motion.div 
      initial={{ opacity: 0 }} animate={{ opacity: 1 }}
      className="h-full bg-white flex flex-col p-8"
    >
      <div className="flex items-center gap-3 mb-10">
        <div className="w-10 h-10 bg-[#060A14] rounded-xl flex items-center justify-center text-white font-black">B</div>
        <div>
           <h2 className="text-lg font-black text-[#0F172A] leading-tight">{party.name}</h2>
           <p className="text-[10px] text-[#64748B] font-bold uppercase tracking-widest">{party.slogan}</p>
        </div>
      </div>

      <h1 className="text-2xl font-black text-[#0F172A] mb-2">Bienvenido</h1>
      <p className="text-sm text-[#64748B] mb-8">Selecciona tu nombre para iniciar tu turno de hoy.</p>

      <div className="flex-1 overflow-y-auto space-y-3 pr-2">
        {brigadists.map(b => (
          <button 
            key={b.id}
            onClick={() => onSelect(b)}
            className="w-full text-left p-5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-3xl hover:border-teal hover:bg-teal/5 transition-all flex items-center justify-between group"
          >
            <div>
              <p className="text-[14px] font-black text-[#0F172A]">{b.name}</p>
              <p className="text-[10px] text-[#64748B] font-bold uppercase">Brigadista · Tepic</p>
            </div>
            <ChevronRight size={18} className="text-[#CBD5E1] group-hover:text-teal transition-colors" />
          </button>
        ))}
      </div>

      <div className="mt-8 pt-6 border-t border-[#E2E8F0] text-center">
         <p className="text-[10px] text-[#CBD5E1] font-bold uppercase tracking-widest">¿No apareces en la lista?</p>
         <p className="text-[11px] text-[#64748B] font-medium mt-1">Contacta a tu coordinador de distrito.</p>
      </div>
    </motion.div>
  );
}

function BrigScreenSplash({ onNext, brigadist, party }: { onNext: () => void, brigadist: Brigadist | null, party: PartyConfig }) {
  const [code, setCode] = useState('');
  const [error, setError] = useState(false);

  const handleNext = () => {
    if (code === brigadist?.code) {
      onNext();
    } else {
      setError(true);
      setTimeout(() => setError(false), 500);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="h-full flex flex-col p-8 items-center text-center bg-gradient-to-br from-[#060A14] to-[#0D1F3C]"
    >
      <div className="w-20 h-20 bg-teal rounded-3xl flex items-center justify-center text-3xl mb-6 shadow-[0_15px_35px_rgba(0,240,192,0.3)]">🗺️</div>
      <h1 className="text-2xl font-black text-white font-display mb-1">{party.name}</h1>
      <p className="text-[9px] text-white/30 uppercase font-black tracking-widest mb-10">{party.slogan}</p>
      
      <div className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-left mb-6">
        <p className="text-[9px] text-white/40 font-bold uppercase mb-1">Brigadista Seleccionado</p>
        <p className="text-[13px] font-bold text-white">{brigadist?.name || 'Invitado'}</p>
      </div>

      <div className="w-full space-y-4 mb-8">
        <div className="text-left">
          <label className="text-[10px] font-black text-white/30 uppercase tracking-widest block mb-2 ml-1">Clave de Acceso</label>
          <input 
            type="password" 
            placeholder="Ingrese clave (Ej. MX-482)" 
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            className={`w-full h-14 bg-white/10 border ${error ? 'border-red-500' : 'border-white/20'} rounded-2xl px-6 text-sm text-white placeholder:text-white/20 focus:outline-none transition-all tracking-[0.3em] font-black text-center`} 
          />
        </div>
      </div>

      <button 
        onClick={handleNext} 
        disabled={!code}
        className="w-full h-16 bg-teal text-bg font-black rounded-2xl hover:scale-[1.02] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
      >
        Iniciar Turno <ChevronRight size={18} />
      </button>
      
      {error && <motion.p animate={{ x: [-5, 5, -5, 5, 0] }} className="text-red-400 text-[10px] font-black uppercase mt-4">Clave incorrecta</motion.p>}
    </motion.div>
  );
}

function BrigScreenZone({ onNext, onBack }: { onNext: () => void; onBack: () => void }) {
  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
      className="h-full bg-[#F2F4F8] flex flex-col"
    >
      <div className="bg-[#060A14] pt-8 pb-4 px-4 flex items-center gap-3">
        <button onClick={onBack} className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center text-white">‹</button>
        <span className="flex-1 text-[13px] font-black text-white">Mi Zona Asignada</span>
        <span className="text-[9px] font-black bg-teal/20 text-teal px-2 py-0.5 rounded">Activo</span>
      </div>

      <div className="h-44 bg-[#1a2540] relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
           <svg width="100%" height="100%">
             <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
               <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="0.5"/>
             </pattern>
             <rect width="100%" height="100%" fill="url(#grid)" />
           </svg>
        </div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-20 border border-teal bg-teal/10 rounded-xl backdrop-blur-sm" />
        <motion.div 
          animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 2 }}
          className="absolute top-[45%] left-[48%] w-3 h-3 bg-blue-500 border-2 border-white rounded-full shadow-[0_0_10px_rgba(59,130,246,0.5)]" 
        />
        <div className="absolute bottom-2 left-4 text-[11px] font-black text-teal">D1 · Centro</div>
      </div>

      <div className="p-4 flex-1">
        <div className="flex gap-3 mb-6">
          <div className="w-12 h-12 bg-teal/10 border border-teal/20 rounded-2xl flex items-center justify-center text-xl shrink-0">🏛️</div>
          <div>
            <h3 className="text-[15px] font-black text-[#0F172A]">Distrito 1 · Centro Histórico</h3>
            <p className="text-[10px] text-[#64748B] font-bold">Encargado: Lic. Carmen Flores</p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 mb-6">
          <StatMini label="Meta Casas" val="200" />
          <StatMini label="Visitadas" val="143" color="text-teal" />
          <StatMini label="Pendientes" val="57" />
        </div>

        <div className="bg-white border border-[#E2E8F0] rounded-2xl p-4 flex items-center gap-4">
           <div className="relative w-14 h-14 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90">
                <circle cx="28" cy="28" r="24" fill="none" stroke="#F1F5F9" strokeWidth="6" />
                <circle cx="28" cy="28" r="24" fill="none" stroke="#00F0C0" strokeWidth="6" strokeDasharray="150" strokeDashoffset="42" />
              </svg>
              <span className="absolute text-[11px] font-black text-[#0F172A]">72%</span>
           </div>
           <div>
             <p className="text-[13px] font-bold text-[#0F172A]">Cobertura del Distrito</p>
             <p className="text-[10px] text-[#64748B] font-bold">🔥 3 días en racha</p>
           </div>
        </div>
      </div>

      <button onClick={onNext} className="mx-4 mb-8 h-14 bg-[#060A14] text-white font-black rounded-2xl shadow-xl">Ver mi ruta de hoy →</button>
    </motion.div>
  );
}

function BrigScreenRoute({ onNext, onBack, brigadist }: { onNext: () => void; onBack: () => void; brigadist: Brigadist | null }) {
  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
      className="h-full bg-[#F2F4F8] flex flex-col"
    >
      <div className="bg-gradient-to-br from-[#060A14] to-[#002A20] pt-10 pb-6 px-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <p className="text-[10px] text-white/40 uppercase font-black tracking-widest mb-1">Martes 17 Jun — Tarde</p>
            <h2 className="text-lg font-black text-white">{brigadist?.name || 'Brigadista'}</h2>
          </div>
          <div className="px-3 py-1 bg-amber-500/10 border border-amber-500/30 rounded-lg text-amber-500 text-[10px] font-black uppercase">🔥 3 Días</div>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
             <div className="h-full bg-teal w-1/4" />
          </div>
          <span className="text-[11px] font-black text-teal">25%</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pt-4">
        <SectionLabel label="Recién completadas" />
        {ROUTE.filter(r => r.status === 'done').map(r => <RouteListItem key={r.id} item={r} onClick={() => {}} />)}
        
        <SectionLabel label="Siguiente parada" />
        {ROUTE.filter(r => r.status === 'current').map(r => <RouteListItem key={r.id} item={r} onClick={onNext} />)}
        
        <SectionLabel label="En reserva" />
        {ROUTE.filter(r => r.status === 'pending').map(r => <RouteListItem key={r.id} item={r} onClick={() => {}} />)}
      </div>

      <button onClick={onNext} className="mx-4 mb-8 h-14 bg-[#060A14] text-white font-black rounded-2xl flex items-center justify-center gap-2">
        ▶ Ir a la siguiente casa
      </button>
    </motion.div>
  );
}

function BrigScreenNav({ onNext, onBack }: { onNext: () => void, onBack: () => void }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9 }}
      className="h-full bg-[#F2F4F8] flex flex-col"
    >
       <div className="bg-[#060A14] pt-8 pb-4 px-4 flex items-center gap-3">
        <button onClick={onBack} className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center text-white">‹</button>
        <span className="flex-1 text-[13px] font-black text-white">Navigando · Casa #3</span>
        <span className="text-[9px] font-black bg-blue-500 text-white px-2 py-0.5 rounded tracking-widest">3/12</span>
      </div>

      <div className="h-48 bg-[#0F172A] relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#1e293b] to-[#0f172a]" />
        {/* Animated route line */}
        <div className="absolute top-[60%] left-[20%] w-[150px] h-[3px] bg-blue-500/20 rounded-full" />
        <motion.div 
          initial={{ width: 0 }} animate={{ width: 120 }} transition={{ duration: 2, repeat: Infinity }}
          className="absolute top-[60%] left-[20%] h-[3px] bg-teal rounded-full shadow-[0_0_10px_#00f0c0]"
        />
        
        <MapPin className="absolute top-[45%] right-[20%] text-teal" size={32} />
        <div className="absolute top-[58%] left-[20%] w-3 h-3 bg-white rounded-full shadow-lg" />
        
        <div className="absolute top-4 left-1/2 -translate-x-1/2 px-4 py-1.5 bg-teal text-bg text-[10px] font-black rounded-full shadow-xl">↑ 180m · Av. Allende</div>
      </div>

      <div className="p-5 flex-1 flex flex-col justify-between">
        <div className="bg-white border border-[#E2E8F0] p-5 rounded-3xl shadow-sm">
          <p className="text-[10px] text-[#64748B] font-black uppercase tracking-widest mb-1">Destino</p>
          <h2 className="text-xl font-black text-[#0F172A]">Allende 312</h2>
          <p className="text-xs text-[#94A3B8] font-medium">Col. Linda Vista, Tepic, Nay.</p>
          
          <div className="mt-4 flex items-center gap-2">
            <div className="w-1.5 h-1.5 bg-teal rounded-full animate-ping" />
            <span className="text-[11px] font-bold text-[#64748B]">~2 min caminando · 180m</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 pb-4">
          <button onClick={() => {}} className="h-14 bg-[#F1F5F9] text-[#64748B] font-black text-[13px] rounded-2xl border border-[#E2E8F0]">Saltar</button>
          <button onClick={() => {}} className="h-14 bg-[#F1F5F9] text-[#64748B] font-black text-[11px] rounded-2xl border border-[#E2E8F0]">Sin GPS</button>
          <button onClick={onNext} className="h-16 col-span-2 bg-gradient-to-br from-[#059669] to-[#00D4AA] text-white font-black rounded-2xl shadow-[0_10px_25px_rgba(0,212,170,0.3)] border border-white/20">
            ✓ LLEGUÉ — REGISTRAR
          </button>
        </div>
      </div>
    </motion.div>
  );
}

function BrigScreenAtDoor({ onNext }: { onNext: () => void, onBack: () => void }) {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 1.1 }} animate={{ opacity: 1, scale: 1 }}
      className="h-full bg-white flex flex-col"
    >
      <div className="bg-[#060A14] pt-12 pb-6 px-6">
        <p className="text-[10px] text-white/30 uppercase font-black tracking-widest mb-1">CASA #3 DE 12</p>
        <h2 className="text-2xl font-black text-white">Av. Allende 312</h2>
      </div>

      <div className="p-6 flex-1 flex flex-col gap-6">
        <p className="text-[10px] font-black text-[#94A3B8] uppercase tracking-[0.2em] text-center">¿Qué pasó al tocar?</p>
        
        <button onClick={onNext} className="group h-24 bg-[#F0FDF9] border-2 border-[#00F0C0] rounded-3xl p-5 flex items-center gap-4 text-left transition-all active:scale-95">
          <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-3xl shadow-sm">🚪</div>
          <div>
            <p className="text-[15px] font-black text-[#0F172A]">Abrieron puerta</p>
            <p className="text-[10px] text-[#059669] font-bold">4 preguntas · 30 seg</p>
          </div>
        </button>

        <div className="relative text-center">
          <div className="absolute top-1/2 left-0 right-0 h-px bg-[#E2E8F0]" />
          <span className="relative z-10 bg-white px-4 text-[9px] font-black text-[#CBD5E1] uppercase tracking-widest">o registrar incidencia</span>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <IncidenceBtn label="No contestan" icon="🔕" />
          <IncidenceBtn label="No quiere hablar" icon="🚫" />
          <IncidenceBtn label="Nadie en casa" icon="🏠" />
          <IncidenceBtn label="Volver luego" icon="📅" />
        </div>
      </div>
    </motion.div>
  );
}

const QUESTIONS = [
  { q: "¿Ha escuchado hablar del candidato de Levántate?", opts: ["Sí, lo conozco bien", "Algo he escuchado", "No lo conozco"] },
  { q: "¿Cuál problema le preocupa más en su colonia?", opts: ["Seguridad (Rojo)", "Agua/Servicios", "Empleo", "Salud"] },
  { q: "¿Cómo evalúa la gestión del gobierno actual?", opts: ["Bien", "Regular", "Mal"] },
  { q: "¿Piensa salir a votar en las próximas elecciones?", opts: ["Sí, definitivamente", "Quizás, depende", "No pienso votar"] },
];

function BrigScreenSurvey({ num, onNext }: { num: number; onNext: () => void }) {
  const current = QUESTIONS[num - 1];
  return (
    <motion.div 
      key={num}
      initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }}
      className="h-full bg-white flex flex-col"
    >
      <div className="bg-gradient-to-br from-[#060A14] to-[#0D2438] pt-12 pb-8 px-6">
        <div className="h-1 bg-white/10 rounded-full mb-6 overflow-hidden">
          <motion.div initial={{ width: 0 }} animate={{ width: `${num * 25}%` }} className="h-full bg-teal" />
        </div>
        <p className="text-[10px] text-white/40 uppercase font-black tracking-widest mb-2">PREGUNTA {num} DE 4</p>
        <h2 className="text-xl font-bold text-white leading-tight">{current.q}</h2>
      </div>

      <div className="p-4 flex flex-col gap-3 py-6">
        {current.opts.map((opt, i) => (
          <button key={i} onClick={onNext} className="text-left p-5 bg-[#FAFBFD] border-2 border-[#E8EDF5] rounded-3xl hover:border-teal hover:bg-teal/5 transition-all transition-colors active:scale-95 flex items-center gap-4">
             <div className="w-4 h-4 rounded-full border-2 border-[#E8EDF5] flex-shrink-0" />
             <span className="text-[14px] font-bold text-[#0F172A]">{opt}</span>
          </button>
        ))}
      </div>
      <p className="text-center text-[9px] text-[#CBD5E1] font-black uppercase tracking-widest mt-auto mb-8">Toca una opción para continuar</p>
    </motion.div>
  );
}

function BrigScreenDone({ onNext }: { onNext: () => void }) {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
      className="h-full bg-[#060A14] flex flex-col items-center justify-center p-8 text-center"
    >
      <motion.div 
        animate={{ rotate: 360 }} transition={{ duration: 0.5 }}
        className="w-24 h-24 bg-teal rounded-full flex items-center justify-center text-5xl mb-6 shadow-[0_0_50px_rgba(0,240,192,0.4)]"
      >
        ✓
      </motion.div>
      <h2 className="text-3xl font-black text-white font-display mb-2">¡Sincronizado!</h2>
      <p className="text-teal font-black text-[11px] uppercase tracking-widest mb-10">Levantamiento exitoso</p>
      
      <div className="w-full bg-white/5 border border-white/10 rounded-[2rem] p-6 text-left space-y-4 mb-10">
        <div className="flex justify-between items-center">
            <span className="text-[10px] font-black text-white/30 uppercase">Visita #48</span>
            <span className="text-[9px] font-black text-white px-2 py-0.5 bg-white/5 rounded">HOY</span>
        </div>
        <p className="text-[13px] text-white/60 leading-relaxed italic">"Los datos ya están en el bunker. Carlos, eres el #3 más activo del distrito ahora mismo."</p>
      </div>

      <button onClick={onNext} className="w-full h-16 bg-teal text-bg font-black rounded-2xl text-lg shadow-2xl">
        Seguir con Casa #4 →
      </button>
    </motion.div>
  );
}
// Fix for Leaflet marker icons in React
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;
function SectionLabel({ label }: { label: string }) {
  return <p className="text-[9px] font-black uppercase text-[#94A3B8] tracking-[0.2em] mb-3 mt-6 ml-2">{label}</p>;
}

function StatMini({ label, val, color = "text-[#0F172A]" }: { label: string; val: string; color?: string }) {
  return (
    <div className="bg-white border border-[#E2E8F0] rounded-2xl p-3 text-center">
      <p className={`text-xl font-black ${color}`}>{val}</p>
      <p className="text-[8px] text-[#94A3B8] font-bold uppercase tracking-tighter">{label}</p>
    </div>
  );
}

function IncidenceBtn({ label, icon }: { label: string; icon: string }) {
  return (
    <button className="h-16 bg-[#F8FAFC] border border-[#E2E8F0] rounded-2xl p-2 flex flex-col items-center justify-center gap-1 active:scale-95 transition-transform">
      <span className="text-lg">{icon}</span>
      <span className="text-[9px] font-black text-[#64748B] uppercase tracking-tighter">{label}</span>
    </button>
  );
}

