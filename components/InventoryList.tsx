
import React, { useState, useMemo, useEffect } from 'react';
import { Kit } from '../types';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface InventoryListProps {
  kits: Kit[];
  onTransaction: (id: string, amount: number, operator: string, type: 'withdraw' | 'refill') => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onUpdateKit: (id: string, updates: Partial<Kit>) => Promise<void>;
}

const ExpandedRow: React.FC<{ 
  kit: Kit; 
  onTransaction: InventoryListProps['onTransaction']; 
  onDelete: InventoryListProps['onDelete']; 
  onUpdateKit: InventoryListProps['onUpdateKit'];
  onActionSuccess: (id: string) => void 
}> = ({ kit, onTransaction, onDelete, onUpdateKit, onActionSuccess }) => {
  const [withdrawVal, setWithdrawVal] = useState<string>('');
  const [refillVal, setRefillVal] = useState<string>('');
  const [operator, setOperator] = useState<string>('');
  const [thresholdVal, setThresholdVal] = useState<string>(kit.criticalThreshold.toString());
  const [busy, setBusy] = useState(false);

  const chartData = useMemo(() => {
    let current = kit.currentVolume;
    const data = [{ date: 'Jetzt', volume: current }];
    [...kit.history].slice(0, 10).forEach(entry => {
      current -= entry.amount;
      data.unshift({ date: entry.date, volume: current });
    });
    return data;
  }, [kit]);

  const handleAction = async (type: 'withdraw' | 'refill') => {
    const val = type === 'withdraw' ? Number(withdrawVal) : Number(refillVal);
    if (!val || val <= 0) return;
    if (!operator.trim()) {
      alert("Bitte Operator angeben.");
      return;
    }
    setBusy(true);
    try {
      await onTransaction(kit.id, val, operator, type);
      onActionSuccess(kit.id);
      if (type === 'withdraw') setWithdrawVal('');
      else setRefillVal('');
    } catch (e) {
      // Error handled by parent toast
    } finally {
      setBusy(false);
    }
  };

  const handleUpdateThreshold = async () => {
    const newT = Number(thresholdVal);
    if (isNaN(newT) || newT < 0) return;
    setBusy(true);
    await onUpdateKit(kit.id, { criticalThreshold: newT });
    setBusy(false);
  };

  const handleDelete = async () => {
    if (window.confirm(`Möchten Sie '${kit.name}' wirklich unwiderruflich löschen?`)) {
      setBusy(true);
      await onDelete(kit.id);
      setBusy(false);
    }
  };

  return (
    <div className="p-8 space-y-10 bg-black/40 border-y border-white/5 animate-in slide-in-from-top-4 duration-300">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Chart Section */}
        <div className="space-y-4">
          <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em]">Volumenverlauf</h4>
          <div className="h-[220px] w-full glass rounded-2xl p-4">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff0a" vertical={false} />
                <XAxis dataKey="date" stroke="#4b5563" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="#4b5563" fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1b1f23', border: '1px solid #ffffff10', color: '#fff', borderRadius: '12px' }}
                  itemStyle={{ color: '#2ecc71' }}
                />
                <Line type="monotone" dataKey="volume" stroke="#2ecc71" strokeWidth={3} dot={{ fill: '#2ecc71', r: 3 }} activeDot={{ r: 5 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Inputs Section */}
        <div className="flex flex-col justify-center space-y-6">
          <div className="space-y-2">
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest">Operator / Mitarbeiter</label>
            <input 
              type="text"
              value={operator}
              onChange={(e) => setOperator(e.target.value)}
              placeholder="Name eintragen..."
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-[#2ecc71] transition-all"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-3">
              <label className="block text-[10px] font-black text-red-400 uppercase tracking-widest">Entnahme</label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <input 
                    type="number"
                    value={withdrawVal}
                    onChange={(e) => setWithdrawVal(e.target.value)}
                    placeholder="0"
                    className="w-full bg-white/5 border border-white/10 rounded-xl pl-4 pr-10 py-2.5 text-white focus:outline-none focus:border-red-500 transition-all font-mono"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-bold text-gray-500 pointer-events-none">µl</span>
                </div>
                <button 
                  onClick={() => handleAction('withdraw')}
                  disabled={busy || !withdrawVal}
                  className="px-6 bg-red-500/20 text-red-500 hover:bg-red-500 hover:text-white rounded-xl text-lg font-black transition-all disabled:opacity-30"
                >
                  -
                </button>
              </div>
            </div>

            <div className="space-y-3">
              <label className="block text-[10px] font-black text-[#2ecc71] uppercase tracking-widest">Auffüllung</label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <input 
                    type="number"
                    value={refillVal}
                    onChange={(e) => setRefillVal(e.target.value)}
                    placeholder="0"
                    className="w-full bg-white/5 border border-white/10 rounded-xl pl-4 pr-10 py-2.5 text-white focus:outline-none focus:border-[#2ecc71] transition-all font-mono"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-bold text-gray-500 pointer-events-none">µl</span>
                </div>
                <button 
                  onClick={() => handleAction('refill')}
                  disabled={busy || !refillVal}
                  className="px-6 bg-[#2ecc71]/20 text-[#2ecc71] hover:bg-[#2ecc71] hover:text-black rounded-xl text-lg font-black transition-all disabled:opacity-30"
                >
                  +
                </button>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-white/5 flex items-center justify-between">
            <div className="flex gap-10">
              <div className="space-y-1">
                <p className="text-[10px] text-gray-500 uppercase font-bold tracking-widest">Kritischer Wert (µl)</p>
                <div className="flex gap-2">
                  <input 
                    type="number"
                    value={thresholdVal}
                    onChange={(e) => setThresholdVal(e.target.value)}
                    className="w-20 bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-sm text-white focus:outline-none focus:border-red-500"
                  />
                  <button 
                    onClick={handleUpdateThreshold}
                    disabled={busy || thresholdVal === kit.criticalThreshold.toString()}
                    className="px-3 bg-white/5 text-[9px] font-black rounded-lg hover:bg-white/10 transition-all uppercase disabled:opacity-20"
                  >
                    Set
                  </button>
                </div>
              </div>
              <div>
                <p className="text-[10px] text-gray-500 uppercase font-bold tracking-widest">Max. Volumen</p>
                <p className="text-xl font-black text-white">{kit.startVolume} <span className="text-[10px] text-gray-500 font-normal">µl</span></p>
              </div>
            </div>
            <button 
              onClick={handleDelete}
              disabled={busy}
              className="text-[10px] font-black text-gray-600 hover:text-red-500 uppercase tracking-widest transition-colors flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
              Eintrag löschen
            </button>
          </div>
        </div>
      </div>

      {/* History Section */}
      <div className="space-y-4">
        <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em]">Buchungshistorie (Audit Trail)</h4>
        <div className="glass rounded-2xl overflow-hidden border border-white/5">
          <table className="w-full text-left text-xs">
            <thead className="bg-white/5 border-b border-white/5">
              <tr>
                <th className="px-4 py-2 font-black text-gray-500 uppercase">Datum</th>
                <th className="px-4 py-2 font-black text-gray-500 uppercase">Menge</th>
                <th className="px-4 py-2 font-black text-gray-500 uppercase">Operator</th>
                <th className="px-4 py-2 font-black text-gray-500 uppercase">Aktion</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {kit.history.length === 0 ? (
                <tr><td colSpan={4} className="px-4 py-8 text-center text-gray-600 italic">Keine Buchungen vorhanden</td></tr>
              ) : (
                kit.history.map((entry) => (
                  <tr key={entry.id} className="hover:bg-white/5">
                    <td className="px-4 py-2 font-mono text-gray-400">{entry.date}</td>
                    <td className={`px-4 py-2 font-bold ${entry.amount < 0 ? 'text-red-400' : 'text-[#2ecc71]'}`}>
                      {entry.amount > 0 ? '+' : ''}{entry.amount.toLocaleString()} µl
                    </td>
                    <td className="px-4 py-2 text-white">{entry.person}</td>
                    <td className="px-4 py-2 text-gray-500 italic">{entry.comment}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const InventoryList: React.FC<InventoryListProps> = ({ kits, onTransaction, onDelete, onUpdateKit }) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [flashingId, setFlashingId] = useState<string | null>(null);

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const handleActionSuccess = (id: string) => {
    setFlashingId(id);
    setTimeout(() => setFlashingId(null), 1000);
  };

  return (
    <div className="glass rounded-3xl overflow-hidden border border-white/5 shadow-2xl">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-white/5 border-b border-white/5">
              <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">ID</th>
              <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Bezeichnung</th>
              <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Verknüpfte Produkte</th>
              <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Kategorie</th>
              <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Füllstand (µl)</th>
              <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] text-right"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {kits.map((kit) => {
              const percent = (kit.currentVolume / kit.startVolume) * 100;
              const isCritical = kit.currentVolume < kit.criticalThreshold;
              const isExpanded = expandedId === kit.id;
              const isFlashing = flashingId === kit.id;
              
              const getStatusColor = () => {
                if (percent > 70) return 'bg-[#2ecc71]';
                if (percent > 30) return 'bg-yellow-500';
                return 'bg-red-500';
              };

              return (
                <React.Fragment key={kit.id}>
                  <tr 
                    onClick={() => toggleExpand(kit.id)}
                    className={`group cursor-pointer hover:bg-white/5 transition-all ${isCritical ? 'bg-red-500/5' : ''} ${isExpanded ? 'bg-white/5 shadow-inner' : ''} ${isFlashing ? 'animate-success-flash' : ''}`}
                  >
                    <td className="px-6 py-4 font-mono text-xs text-gray-400">#{kit.id}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className={`font-bold transition-colors ${isExpanded || isFlashing ? 'text-[#2ecc71]' : 'text-white'} group-hover:text-[#2ecc71]`}>{kit.name}</div>
                        {isCritical && (
                          <div className="animate-pulse flex items-center gap-1 text-red-500">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
                          </div>
                        )}
                      </div>
                      <div className="text-[10px] text-gray-500 italic truncate max-w-[200px]">{kit.description}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs text-gray-300 font-medium">{kit.linkedProducts || '—'}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-0.5 bg-white/10 text-white text-[9px] font-black rounded uppercase tracking-widest">
                        {kit.category}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1 w-32">
                        <div className="flex justify-between items-end">
                          <span className={`text-sm font-black ${isCritical ? 'text-red-400' : 'text-white'}`}>{kit.currentVolume.toLocaleString()}</span>
                          <span className="text-[10px] text-gray-500">{Math.round(percent)}%</span>
                        </div>
                        <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                          <div 
                            className={`h-full transition-all duration-1000 ${getStatusColor()}`} 
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className={`transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}>
                         <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"/></svg>
                      </div>
                    </td>
                  </tr>
                  {isExpanded && (
                    <tr>
                      <td colSpan={6} className="p-0">
                        <ExpandedRow 
                          kit={kit} 
                          onTransaction={onTransaction} 
                          onDelete={onDelete} 
                          onUpdateKit={onUpdateKit}
                          onActionSuccess={handleActionSuccess}
                        />
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default InventoryList;
