
import React from 'react';
import { Kit, Category, CategoryDef, DashboardStats } from '../types';

interface DashboardProps {
  kits: Kit[];
  categoryDefs: CategoryDef[];
  onFilterCategory: (category: Category | null) => void;
  activeCategory: Category | null;
}

const Dashboard: React.FC<DashboardProps> = ({ kits, categoryDefs, onFilterCategory, activeCategory }) => {
  const stats: DashboardStats[] = categoryDefs.map(cat => {
    const catKits = kits.filter(k => k.category === cat.key);
    const totalCurrent = catKits.reduce((acc, k) => acc + k.currentVolume, 0);
    const totalStart = catKits.reduce((acc, k) => acc + k.startVolume, 0);
    const avgPercent = totalStart > 0 ? (totalCurrent / totalStart) * 100 : 0;
    
    let status: 'green' | 'yellow' | 'red' = 'green';
    if (avgPercent < 30) status = 'red';
    else if (avgPercent < 70) status = 'yellow';

    return {
      category: cat.key,
      label: cat.label,
      totalVolume: totalCurrent,
      avgCapacity: avgPercent,
      status,
      count: catKits.length
    };
  });

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3 mb-8 overflow-x-auto pb-2">
      {stats.map(stat => (
        <button
          key={stat.category}
          onClick={() => onFilterCategory(activeCategory === stat.category ? null : stat.category)}
          className={`group relative p-4 rounded-2xl transition-all duration-300 text-left border overflow-hidden min-w-[120px] flex-shrink-0 ${
            activeCategory === stat.category 
              ? 'border-[#2ecc71] bg-[#2ecc71]/10' 
              : 'border-white/5 bg-white/5 hover:border-white/20'
          }`}
        >
          <div className="flex justify-between items-start mb-3">
            <span className="text-[10px] font-extrabold uppercase tracking-tighter text-gray-400 group-hover:text-white transition-colors">
              {stat.label}
            </span>
            <div className={`w-1.5 h-1.5 rounded-full ${stat.status === 'red' ? 'bg-red-500 animate-pulse' : stat.status === 'yellow' ? 'bg-yellow-500' : 'bg-[#2ecc71]'}`} />
          </div>
          
          <div className="mb-2">
            <h3 className="text-xl font-bold text-white tracking-tight">{stat.totalVolume > 1000 ? `${(stat.totalVolume/1000).toFixed(1)}k` : stat.totalVolume}</h3>
            <p className="text-[10px] text-gray-500">{stat.count} items</p>
          </div>

          <div className="w-full bg-white/5 h-1 rounded-full overflow-hidden mt-1">
            <div 
              className={`h-full transition-all duration-1000 ease-out ${stat.status === 'red' ? 'bg-red-500' : stat.status === 'yellow' ? 'bg-yellow-500' : 'bg-[#2ecc71]'}`} 
              style={{ width: `${stat.avgCapacity}%` }}
            />
          </div>
        </button>
      ))}
    </div>
  );
};

export default Dashboard;
