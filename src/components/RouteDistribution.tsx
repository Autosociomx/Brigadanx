import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Map, MapPin, Navigation, Share2, Layers, CheckCircle2, Plus } from 'lucide-react';

export const RouteDistribution: React.FC = () => {
  const [colony, setColony] = useState('Villa Zacatepec');
  const [numStreets, setNumStreets] = useState(30);
  const [numBrigadists, setNumBrigadists] = useState(20);

  const streetsPerBrigadist = Math.max(1, Math.ceil(numStreets / numBrigadists));
  const totalSectors = numBrigadists;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pb-20">
      <div className="lg:col-span-4 bg-s1/50 p-6 md:p-8 rounded-[2rem] md:rounded-[2.5rem] border border-white/5 h-fit">
        <h3 className="text-xl font-bold font-display mb-6 flex items-center gap-2">
          <Navigation className="text-teal" size={20} />
          Optimizador de Rutas
        </h3>
        
        <div className="space-y-6">
          <div>
            <label className="text-[10px] font-black uppercase text-faint tracking-widest block mb-2">Colonia / Zona</label>
            <input 
              type="text" 
              value={colony}
              onChange={(e) => setColony(e.target.value)}
              className="w-full bg-bg border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-teal/50 outline-none transition-all"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-black uppercase text-faint tracking-widest block mb-2">Calles</label>
              <input 
                type="number" 
                value={numStreets}
                onChange={(e) => setNumStreets(Number(e.target.value))}
                className="w-full bg-bg border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-teal/50 outline-none transition-all"
              />
            </div>
            <div>
              <label className="text-[10px] font-black uppercase text-faint tracking-widest block mb-2">Brigadistas</label>
              <input 
                type="number" 
                value={numBrigadists}
                onChange={(e) => setNumBrigadists(Number(e.target.value))}
                className="w-full bg-bg border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-teal/50 outline-none transition-all"
              />
            </div>
          </div>

          <div className="bg-teal/5 border border-teal/20 rounded-2xl p-4">
             <div className="flex justify-between items-center mb-2">
                <span className="text-[11px] font-bold text-dim">Distribución Sugerida</span>
                <span className="bg-teal text-bg text-[9px] font-black px-2 py-0.5 rounded">MODO AUTO</span>
             </div>
             <p className="text-sm font-medium text-white">
               Se asignarán <span className="text-teal font-black">{streetsPerBrigadist}</span> calles/manzanas por brigadista para cubrir <span className="text-white font-bold">{colony}</span> en un solo turno.
             </p>
          </div>

          <button className="w-full bg-teal text-bg font-black py-4 rounded-2xl flex items-center justify-center gap-2 hover:scale-[1.02] transition-transform shadow-lg shadow-teal/20">
            <Layers size={18} /> GENERAR RUTAS ÚNICAS
          </button>
        </div>
      </div>

      <div className="lg:col-span-8 space-y-6">
        <div className="bg-s1/30 border border-white/5 rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-8 h-full min-h-[400px]">
          <div className="flex justify-between items-center mb-8">
            <h4 className="text-[10px] font-black uppercase tracking-widest text-faint">Vista Previa de Despliegue</h4>
            <div className="flex gap-2">
               <button className="p-2 bg-white/5 border border-white/10 rounded-lg text-dim hover:text-white"><Share2 size={16} /></button>
               <button className="p-2 bg-white/5 border border-white/10 rounded-lg text-dim hover:text-white"><Map size={16} /></button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white/5 border border-white/5 rounded-2xl p-4 relative group hover:border-teal/30 transition-all cursor-pointer">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] font-black bg-white/10 px-2 py-0.5 rounded">Ruta {i+1}</span>
                  {i === 0 && <CheckCircle2 size={14} className="text-teal" />}
                </div>
                <h5 className="font-bold text-xs mb-1">Sector {String.fromCharCode(65+i)}</h5>
                <p className="text-[10px] text-dim">{streetsPerBrigadist} calles · 2 aceras</p>
                <div className="mt-4 flex -space-x-2">
                   <div className="w-6 h-6 rounded-full bg-blue-500 border-2 border-[#161b2a] flex items-center justify-center text-[8px] font-black">CM</div>
                </div>
              </div>
            ))}
            <div className="bg-white/5 border border-dashed border-white/10 rounded-2xl p-4 flex flex-col items-center justify-center text-faint hover:text-teal hover:border-teal/30 transition-all cursor-pointer">
              <Plus size={24} className="mb-2" />
              <span className="text-[10px] font-black uppercase">Nuevo Sector</span>
            </div>
          </div>

          <div className="mt-12 p-6 bg-s2/50 border border-white/10 rounded-3xl">
             <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-amber-500/10 rounded-2xl flex items-center justify-center text-amber-500 flex-shrink-0">
                  <MapPin size={20} />
                </div>
                <div>
                   <h5 className="font-bold text-sm">Instrucciones de Despliegue</h5>
                   <p className="text-xs text-dim mt-1 leading-relaxed">
                     Los brigadistas recibirán un link dinámico. Solo deben seleccionar su nombre y su ruta estará precargada con GPS. Se recomienda iniciar en la acera derecha de cada calle asignada.
                   </p>
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};
