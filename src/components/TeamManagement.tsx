import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Users, Plus, Shield, MapPin, Trash2, Key } from 'lucide-react';
import { Brigadist } from '../types';

export const TeamManagement: React.FC = () => {
  const [brigadists, setBrigadists] = useState<Brigadist[]>([
    { id: '1', name: 'Carlos Mendoza', code: 'MX-482', status: 'active' },
    { id: '2', name: 'Patricia Soto', code: 'MX-912', status: 'active' },
  ]);
  const [newName, setNewName] = useState('');

  const addBrigadist = () => {
    if (!newName.trim()) return;
    const newBrigadist: Brigadist = {
      id: Math.random().toString(36).substr(2, 9),
      name: newName,
      code: `MX-${Math.floor(100 + Math.random() * 900)}`,
      status: 'active'
    };
    setBrigadists([...brigadists, newBrigadist]);
    setNewName('');
  };

  const removeBrigadist = (id: string) => {
    setBrigadists(brigadists.filter(b => b.id !== id));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-s1/50 p-6 rounded-[2rem] border border-white/5 gap-6 sm:gap-0">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-3">
            <Users className="text-teal" size={24} />
            Gestión de Equipo
          </h2>
          <p className="text-dim text-xs mt-1">Agrega brigadistas y genera sus claves de acceso personal.</p>
        </div>
        <div className="flex flex-col sm:flex-row w-full sm:w-auto gap-2">
          <input 
            type="text" 
            placeholder="Nombre del brigadista" 
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            className="w-full sm:w-auto bg-bg border border-white/10 rounded-xl px-4 py-2 text-sm focus:border-teal/50 transition-all outline-none"
          />
          <button 
            onClick={addBrigadist}
            className="w-full sm:w-auto bg-teal text-bg px-4 py-2 rounded-xl font-black text-xs uppercase flex items-center justify-center gap-2 hover:scale-105 transition-transform"
          >
            <Plus size={16} /> Agregar
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <AnimatePresence>
          {brigadists.map(b => (
            <motion.div 
              key={b.id}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-s1/30 border border-white/5 p-5 rounded-[1.5rem] flex flex-col justify-between"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex gap-3 items-center">
                  <div className="w-10 h-10 bg-teal/10 rounded-xl flex items-center justify-center text-teal font-black">
                    {b.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-white">{b.name}</h3>
                    <p className="text-[10px] text-faint font-bold uppercase">Clave: <span className="text-teal font-black tracking-widest">{b.code}</span></p>
                  </div>
                </div>
                <button onClick={() => removeBrigadist(b.id)} className="text-faint hover:text-red-500 transition-colors">
                  <Trash2 size={16} />
                </button>
              </div>

              <div className="flex gap-2">
                <div className="flex-1 bg-white/5 rounded-lg p-2 text-center">
                   <p className="text-[10px] font-black text-white">12/30</p>
                   <p className="text-[8px] text-dim uppercase">Avance</p>
                </div>
                <button className="flex-1 bg-white/5 hover:bg-white/10 rounded-lg p-2 text-center transition-colors">
                   <p className="text-[10px] font-black text-teal">RUTA</p>
                   <p className="text-[8px] text-dim uppercase">Asignar</p>
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};
