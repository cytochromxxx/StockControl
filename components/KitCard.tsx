
import React from 'react';
import { Kit } from '../types';

interface KitCardProps {
  kit: Kit;
  onSelect: (kit: Kit) => void;
  onQuickWithdraw: (kit: Kit) => void;
}

const KitCard: React.FC<KitCardProps> = ({ kit, onSelect, onQuickWithdraw }) => {
  const percent = (kit.currentVolume / kit.startVolume) * 100;
  const isCritical = kit.currentVolume < kit.criticalThreshold;
  
  const getStatusConfig = () => {
    if (percent > 70) return { color: 'bg-[#2ecc71]', shadow: 'glow-green', text: 'text-[#2ecc71]' };
    if (percent > 30) return { color: 'bg-yellow-500', shadow: '', text: 'text-yellow-500' };
    return { color: 'bg-red-500', shadow: 'glow-red', text: 'text-red-500' };
  };

  const config = getStatusConfig();
  const lastEntry = kit.history.length > 0 ? kit.history[0] : null;

  return (
    <div className={`glass relative rounded-3xl overflow-hidden transition-all duration-500 group ${isCritical ? 'critical-shake border-red-500/50' : 'hover:scale-[1.02]'}`}>
      <div className="p-6">
        <div className="flex justify-between items-start mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
               <span className="px-2 py-0.5 bg-white/10 text-white text-[9px] font-black rounded-full uppercase tracking-widest">
                {kit.category}
              </span>
              <span className="text-[10px] text-gray-500 font-mono">#{kit.id}</span>
            </div>
            <h4 className="text-lg font-bold text-white leading-tight group-hover:text-[#2ecc71] transition-colors">{kit.name}</h4>
            <p className="text-[11px] text-gray-500 mt-1 line-clamp-1 italic">{kit.description}</p>
          </div>
          <div className={`w-3 h-3 rounded-full ${config.color} ${config.shadow} ${percent < 30 ? 'animate-ping' : ''}`} />
        </div>

        <div className="space-y-3 mb-8">
          <div className="flex justify-between items-end">
            <span className="text-2xl font-black text-white tracking-tighter">
              {kit.currentVolume.toLocaleString()} 
              <span className="text-[10px] text-gray-500 ml-1 uppercase">µl</span>
            </span>
            <span className={`text-xs font-bold ${config.text}`}>
              {Math.round(percent)}%
            </span>
          </div>
          
          <div className="relative w-full bg-white/5 h-3 rounded-full overflow-hidden p-[2px]">
            <div 
              className={`h-full rounded-full transition-all duration-1000 ease-out ${config.color} ${config.shadow}`} 
              style={{ width: `${percent}%` }}
            />
          </div>
          
          <div className="flex justify-between text-[9px] font-bold text-gray-600 uppercase tracking-widest px-1">
            <span>Threshold: {kit.criticalThreshold}µl</span>
            <span>Capacity: {kit.startVolume}µl</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <button 
            onClick={() => onSelect(kit)}
            className="py-3 text-[11px] font-bold bg-white/5 text-white rounded-2xl hover:bg-white/10 border border-white/5 transition-all"
          >
            Open Details
          </button>
          <button 
            onClick={() => onQuickWithdraw(kit)}
            className={`py-3 text-[11px] font-black rounded-2xl transition-all shadow-lg ${isCritical ? 'bg-red-500 text-white hover:bg-red-600' : 'bg-[#2ecc71] text-black hover:bg-[#27ae60]'}`}
          >
            Withdraw
          </button>
        </div>
      </div>

      {isCritical && (
        <div className="absolute top-0 right-0 left-0 bg-red-500 py-1 flex items-center justify-center animate-pulse">
           <span className="text-[8px] font-black text-white uppercase tracking-[0.3em]">Critical Supply Level</span>
        </div>
      )}
    </div>
  );
};

export default KitCard;
