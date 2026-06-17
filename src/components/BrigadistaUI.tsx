import React from 'react';
import { motion } from 'motion/react';
import { RouteItem } from '../types';

export const PhoneFrame: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="w-[300px] h-[640px] bg-[#000] rounded-[42px] p-2.5 shadow-[0_40px_100px_rgba(0,0,0,0.8),0_0_0_1px_#1a2235,inset_0_0_0_1px_#0d1626] relative">
      {/* Notch */}
      <div className="absolute top-2.5 left-1/2 -translate-x-1/2 w-[90px] h-6 bg-[#000] rounded-b-2xl z-[100]" />
      
      <div className="w-full h-full bg-[#F2F4F8] rounded-[33px] overflow-hidden relative shadow-inner">
        {children}
      </div>
    </div>
  );
}

export const RouteListItem: React.FC<{ item: RouteItem; onClick: () => void }> = ({ item, onClick }) => {
  const statusColors = {
    done: 'bg-[#DCFCE7] text-[#16A34A]',
    current: 'bg-[#00F0C0] text-[#000]',
    pending: 'bg-[#F1F5F9] text-[#64748B]'
  };

  return (
    <motion.div 
      whileHover={{ scale: 1.02 }}
      onClick={onClick}
      className={`bg-white border rounded-2xl p-4 mb-2 flex items-center gap-3 cursor-pointer transition-all ${
        item.status === 'current' ? 'border-[#00F0C0] ring-1 ring-[#00F0C0]' : 'border-[#E2E8F0]'
      } ${item.status === 'done' ? 'opacity-60' : ''}`}
    >
      <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-black shrink-0 ${statusColors[item.status]}`}>
        {item.status === 'done' ? '✓' : item.order}
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="text-[13px] font-bold text-[#0F172A] truncate">{item.address}</h4>
        <p className="text-[10px] text-[#64748B] font-medium">{item.colonia}</p>
      </div>
      {item.status === 'current' && <div className="text-[#00F0C0] animate-pulse">▶</div>}
    </motion.div>
  );
}
