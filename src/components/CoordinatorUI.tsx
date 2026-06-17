import React from 'react';
import { motion } from 'motion/react';
import { District } from '../types';

export const DistrictCard: React.FC<{ district: District; isSelected: boolean; onClick: () => void }> = ({ district, isSelected, onClick }) => {
  const statusLabels = {
    hot: { label: 'CALIENTE', color: 'bg-green-500/10 text-green-500' },
    active: { label: 'EN CAMPO', color: 'bg-blue-500/10 text-blue-500' },
    lag: { label: 'REZAGADO', color: 'bg-amber-500/10 text-amber-500' },
    crit: { label: '⚠ CRÍTICO', color: 'bg-red-500/10 text-red-500' },
    exc: { label: '✓ EXCELENTE', color: 'bg-teal-500/10 text-teal-500' }
  };

  return (
    <motion.div 
      onClick={onClick}
      className={`p-5 border-b border-white/5 cursor-pointer transition-all hover:bg-white/5 ${isSelected ? 'bg-white/5 border-l-4 border-l-teal' : ''}`}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: district.color }} />
          <h3 className="font-bold text-[13px]">{district.name}</h3>
        </div>
        <span className={`text-[9px] font-black px-2 py-0.5 rounded ${statusLabels[district.status].color}`}>
          {statusLabels[district.status].label}
        </span>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="bg-white/5 rounded-lg p-2">
          <p className="text-[12px] font-black">{district.visits}</p>
          <p className="text-[8px] text-dim font-bold uppercase tracking-tighter">Visitas</p>
        </div>
        <div className="bg-white/5 rounded-lg p-2">
          <p className="text-[12px] font-black">{district.brigades}</p>
          <p className="text-[8px] text-dim font-bold uppercase tracking-tighter">Gente</p>
        </div>
        <div className="bg-white/5 rounded-lg p-2">
          <p className="text-[12px] font-black text-teal">{district.coverage}%</p>
          <p className="text-[8px] text-dim font-bold uppercase tracking-tighter">Meta</p>
        </div>
      </div>

      <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${district.coverage}%` }}
          className="h-full bg-teal"
        />
      </div>
      <p className="mt-3 text-[10px] text-faint font-medium">{district.coordinator} · {district.target} casas meta</p>
    </motion.div>
  );
}
