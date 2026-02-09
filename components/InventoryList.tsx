
import React, { useState, useMemo } from 'react';
import { Kit, User, HistoryEntry } from '../types';
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, ReferenceLine } from 'recharts';
import { labUsers } from '../api';

interface InventoryListProps {
  kits: Kit[];
  onTransaction: (id: string, amount: number, operator: string, type: 'withdraw' | 'refill') => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onUpdateKit: (id: string, updates: Partial<Kit>) => Promise<void>;
  onDeleteHistoryEntry?: (kitId: string, entryId: string) => Promise<void>;
  onEditHistoryEntry?: (kitId: string, entryId: string, newAmount: number) => Promise<void>;
  currentUser: User;
  showCategoryGaps?: boolean;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="glass p-4 rounded-2xl border dark:border-white/10 border-gray-200 shadow-2xl">
        <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">{label}</p>
        <p className="text-sm font-black text-[#2ecc71] font-mono">
          {payload[0].value.toLocaleString()} <span className="text-[10px] uppercase">µl</span>
        </p>
      </div>
    );
  }
  return null;
};

const QuickTransaction: React.FC<{
  kit: Kit;
  onTransaction: InventoryListProps['onTransaction'];
  onActionSuccess: (id: string) => void;
  currentUser: User;
}> = ({ kit, onTransaction, onActionSuccess, currentUser }) => {
  const [withdrawVal, setWithdrawVal] = useState<string>('');
  const [refillVal, setRefillVal] = useState<string>('');
  const [busy, setBusy] = useState(false);

  const handleAction = async (type: 'withdraw' | 'refill') => {
    const val = type === 'withdraw' ? Number(withdrawVal) : Number(refillVal);
    if (!val || val <= 0) return;
    setBusy(true);
    try {
      await onTransaction(kit.id, val, currentUser.initials, type);
      onActionSuccess(kit.id);
      if (type === 'withdraw') setWithdrawVal('');
      else setRefillVal('');
    } catch (e) {
    } finally {
      setBusy(false);
    }
  };

  const onKeyDown = (e: React.KeyboardEvent, type: 'withdraw' | 'refill') => {
    if (e.key === 'Enter') handleAction(type);
  };

  return (
    <div className="flex items-center gap-3" onClick={(e) => e.stopPropagation()}>
      <div className="flex flex-col gap-0.5">
        <input 
          type="number"
          value={withdrawVal}
          onChange={(e) => setWithdrawVal(e.target.value)}
          onKeyDown={(e) => onKeyDown(e, 'withdraw')}
          placeholder="-"
          title="Entnahme (Enter zum Bestätigen)"
          className="w-16 bg-red-500/5 border border-red-500/20 rounded-lg px-2 py-2 text-[11px] font-mono font-black text-red-500 focus:outline-none focus:border-red-500/50 transition-premium placeholder-red-900/40 text-center dark:text-red-200"
        />
        <span className="text-[8px] font-black text-red-500 dark:text-red-900 uppercase tracking-tighter text-center">Entn.</span>
      </div>

      <div className="w-px h-8 bg-black/5 dark:bg-white/5" />

      <div className="flex flex-col gap-0.5">
        <input 
          type="number"
          value={refillVal}
          onChange={(e) => setRefillVal(e.target.value)}
          onKeyDown={(e) => onKeyDown(e, 'refill')}
          placeholder="+"
          title="Zugabe (Enter zum Bestätigen)"
          className="w-16 bg-[#2ecc71]/5 border border-[#2ecc71]/20 rounded-lg px-2 py-2 text-[11px] font-mono font-black text-[#2ecc71] focus:outline-none focus:border-[#2ecc71]/50 transition-premium placeholder-[#2ecc71]/20 text-center"
        />
        <span className="text-[8px] font-black text-[#2ecc71] dark:text-[#2ecc71]/40 uppercase tracking-tighter text-center">Zugabe</span>
      </div>
    </div>
  );
};

const ExpandedRow: React.FC<{ 
  kit: Kit; 
  onTransaction: InventoryListProps['onTransaction']; 
  onDelete: InventoryListProps['onDelete']; 
  onUpdateKit: InventoryListProps['onUpdateKit'];
  onDeleteHistoryEntry?: InventoryListProps['onDeleteHistoryEntry'];
  onEditHistoryEntry?: InventoryListProps['onEditHistoryEntry'];
  onActionSuccess: (id: string) => void;
  currentUser: User;
}> = ({ kit, onTransaction, onDelete, onUpdateKit, onDeleteHistoryEntry, onEditHistoryEntry, onActionSuccess, currentUser }) => {
  const [withdrawVal, setWithdrawVal] = useState<string>('');
  const [refillVal, setRefillVal] = useState<string>('');
  const [thresholdVal, setThresholdVal] = useState<string>(kit.criticalThreshold.toString());
  const [busy, setBusy] = useState(false);

  const [filterOp, setFilterOp] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStart, setFilterStart] = useState<string>('');
  const [filterEnd, setFilterEnd] = useState<string>('');

  const parseDate = (dateStr: string) => {
    if (dateStr.includes('.')) {
      const [d, m, y] = dateStr.split('.').map(Number);
      return new Date(y, m - 1, d);
    }
    return new Date(dateStr);
  };

  const filteredHistory = useMemo(() => {
    return kit.history.filter(entry => {
      if (filterOp !== 'all' && entry.person !== filterOp) return false;
      if (filterType === 'withdraw' && entry.amount >= 0) return false;
      if (filterType === 'refill' && entry.amount <= 0) return false;
      const entryDate = parseDate(entry.date);
      if (filterStart) {
        const start = new Date(filterStart);
        start.setHours(0, 0, 0, 0);
        if (entryDate < start) return false;
      }
      if (filterEnd) {
        const end = new Date(filterEnd);
        end.setHours(23, 59, 59, 999);
        if (entryDate > end) return false;
      }
      return true;
    });
  }, [kit.history, filterOp, filterType, filterStart, filterEnd]);

  const chartData = useMemo(() => {
    let runningVolume = kit.currentVolume;
    const sortedHistory = [...kit.history].slice(0, 20);
    const plotData = [{ date: 'Jetzt', volume: runningVolume }];
    sortedHistory.forEach((entry) => {
      runningVolume -= entry.amount;
      plotData.unshift({ date: entry.date, volume: runningVolume });
    });
    return plotData;
  }, [kit.history, kit.currentVolume]);

  const handleAction = async (type: 'withdraw' | 'refill') => {
    const val = type === 'withdraw' ? Number(withdrawVal) : Number(refillVal);
    if (!val || val <= 0) return;
    setBusy(true);
    try {
      await onTransaction(kit.id, val, currentUser.initials, type);
      onActionSuccess(kit.id);
      if (type === 'withdraw') setWithdrawVal('');
      else setRefillVal('');
    } catch (e) {
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

  const handleDeleteLogEntry = async (entryId: string) => {
    if (!onDeleteHistoryEntry) return;
    if (window.confirm("Diesen Log-Eintrag wirklich entfernen?")) {
      setBusy(true);
      await onDeleteHistoryEntry(kit.id, entryId);
      setBusy(false);
    }
  };

  const handleEditLogEntry = async (entry: HistoryEntry) => {
    if (!onEditHistoryEntry) return;
    const newAmountStr = window.prompt(`Neuer Wert (µl):`, entry.amount.toString());
    if (newAmountStr === null) return;
    const newAmount = Number(newAmountStr);
    if (isNaN(newAmount)) return;
    setBusy(true);
    await onEditHistoryEntry(kit.id, entry.id, newAmount);
    setBusy(false);
  };

  return (
    <div className="p-10 dark:bg-[#0d0d0e]/60 bg-gray-50 border-y border-black/5 dark:border-white/5 animate-in slide-in-from-top-4 duration-500">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12">
        <div className="lg:col-span-7 space-y-6">
          <div className="flex items-center justify-between">
            <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.4em]">Analyse & Historie</h4>
            <div className="flex gap-4">
               <div className="flex items-center gap-2">
                 <div className="w-2 h-2 rounded-full bg-[#2ecc71]" />
                 <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">Füllstand</span>
               </div>
               <div className="flex items-center gap-2">
                 <div className="w-2 h-2 rounded-full border border-dashed border-red-500" />
                 <span className="text-[9px] font-bold text-red-500 uppercase tracking-widest">Limit</span>
               </div>
            </div>
          </div>
          
          <div className="h-[280px] w-full glass rounded-[2rem] p-6 border dark:border-white/5 border-gray-200">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorVolume" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2ecc71" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#2ecc71" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#88888820" vertical={false} />
                <XAxis dataKey="date" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} tick={{ dy: 10 }} />
                <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(v) => v.toLocaleString()} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="volume" stroke="#2ecc71" strokeWidth={4} fillOpacity={1} fill="url(#colorVolume)" />
                <ReferenceLine y={kit.criticalThreshold} stroke="#ef4444" strokeWidth={2} strokeDasharray="5 5" label={{ position: 'right', value: 'ALARM', fill: '#ef4444', fontSize: 10, fontWeight: 900 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-3 gap-6">
            <div className="glass rounded-2xl p-4 border dark:border-white/5 border-gray-200">
              <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-1">Status</p>
              <p className={`text-xl font-black ${kit.currentVolume < kit.criticalThreshold ? 'text-red-500' : 'text-[#2ecc71] uppercase'}`}>
                {kit.currentVolume < kit.criticalThreshold ? 'KRITISCH' : 'SICHER'}
              </p>
            </div>
            <div className="glass rounded-2xl p-4 border dark:border-white/5 border-gray-200">
              <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-1">Alarm-Limit einstellen</p>
              <div className="flex items-center gap-2">
                <input 
                  type="number"
                  value={thresholdVal}
                  onChange={(e) => setThresholdVal(e.target.value)}
                  className="w-full bg-transparent text-xl font-black text-red-500 font-mono outline-none"
                />
                <button 
                  onClick={handleUpdateThreshold}
                  disabled={busy || thresholdVal === kit.criticalThreshold.toString()}
                  className="px-2 py-1 bg-white/5 dark:text-white text-gray-900 text-[9px] font-black rounded uppercase transition-premium hover:bg-white/10 disabled:opacity-0"
                >
                  OK
                </button>
              </div>
            </div>
            <div className="glass rounded-2xl p-4 border dark:border-white/5 border-gray-200">
              <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-1">Startwert (Referenz)</p>
              <p className="text-xl font-black dark:text-white text-gray-900 font-mono">{kit.startVolume.toLocaleString()} µl</p>
            </div>
          </div>
        </div>

        <div className="lg:col-span-5 flex flex-col space-y-10">
          <div className="space-y-6">
             <div className="flex items-center gap-3">
               <div className="w-8 h-8 rounded-full bg-[#2ecc71]/10 flex items-center justify-center text-[#2ecc71]">
                 <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 4v16m8-8H4"/></svg>
               </div>
               <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.4em]">Buchungsschnittstelle</h4>
             </div>

             <div className="space-y-4">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <label className="block text-[10px] font-black text-red-500 uppercase tracking-widest">Entnahme (µl)</label>
                    <div className="flex gap-2">
                      <input 
                        type="number"
                        value={withdrawVal}
                        onChange={(e) => setWithdrawVal(e.target.value)}
                        placeholder="0"
                        className="w-full bg-white/5 border dark:border-white/10 border-gray-200 rounded-2xl px-4 py-4 dark:text-white text-gray-900 focus:outline-none focus:border-red-500 transition-premium font-mono font-bold"
                      />
                      <button 
                        onClick={() => handleAction('withdraw')}
                        disabled={busy || !withdrawVal}
                        className="w-14 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white rounded-2xl transition-premium disabled:opacity-20 flex items-center justify-center font-black text-2xl"
                      >
                        -
                      </button>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="block text-[10px] font-black text-[#2ecc71] uppercase tracking-widest">Auffüllung (µl)</label>
                    <div className="flex gap-2">
                      <input 
                        type="number"
                        value={refillVal}
                        onChange={(e) => setRefillVal(e.target.value)}
                        placeholder="0"
                        className="w-full bg-white/5 border dark:border-white/10 border-gray-200 rounded-2xl px-4 py-4 dark:text-white text-gray-900 focus:outline-none focus:border-[#2ecc71] transition-premium font-mono font-bold"
                      />
                      <button 
                        onClick={() => handleAction('refill')}
                        disabled={busy || !refillVal}
                        className="w-14 bg-[#2ecc71]/10 text-[#2ecc71] hover:bg-[#2ecc71] hover:text-black rounded-2xl transition-premium disabled:opacity-20 flex items-center justify-center font-black text-2xl"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
             </div>
          </div>

          <div className="flex-1 space-y-4">
             <div className="flex flex-col gap-4">
               <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.4em]">Audit-Log</h4>
               <div className="flex flex-wrap gap-3 bg-white/5 p-3 rounded-2xl border dark:border-white/10 border-gray-200">
                 <div className="flex flex-col gap-1">
                    <span className="text-[8px] font-black text-gray-600 uppercase tracking-widest ml-1">Filter</span>
                    <select 
                      value={filterOp}
                      onChange={(e) => setFilterOp(e.target.value)}
                      className="bg-black/5 dark:bg-black/40 text-[10px] dark:text-white text-gray-900 border dark:border-white/10 border-gray-200 rounded-lg px-2 py-1.5 focus:border-[#2ecc71] outline-none"
                    >
                      <option value="all">Alle Operator</option>
                      {labUsers.map(u => <option key={u.initials} value={u.initials}>{u.initials}</option>)}
                      <option value="System">System</option>
                    </select>
                 </div>
                 <div className="flex items-end pb-1 ml-auto">
                    <button 
                      onClick={() => { setFilterOp('all'); setFilterType('all'); setFilterStart(''); setFilterEnd(''); }}
                      className="text-[9px] font-black text-gray-500 hover:text-accent uppercase tracking-widest transition-colors"
                    >
                      Reset
                    </button>
                 </div>
               </div>
             </div>

             <div className="glass rounded-[2rem] overflow-hidden border dark:border-white/5 border-gray-200 max-h-[300px] overflow-y-auto">
                <table className="w-full text-left text-[11px]">
                  <thead className="sticky top-0 bg-white/10 backdrop-blur-md border-b dark:border-white/5 border-gray-200 z-10">
                    <tr>
                      <th className="px-6 py-4 font-black text-gray-500 uppercase tracking-widest">Datum</th>
                      <th className="px-6 py-4 font-black text-gray-500 uppercase tracking-widest">Op</th>
                      <th className="px-6 py-4 font-black text-gray-500 uppercase tracking-widest text-right">Menge</th>
                      <th className="px-6 py-4"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y dark:divide-white/5 divide-gray-100">
                    {filteredHistory.map((entry) => (
                      <tr key={entry.id} className="group/item hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                        <td className="px-6 py-4 font-mono text-gray-400">{entry.date}</td>
                        <td className="px-6 py-4 dark:text-white text-gray-900 font-bold tracking-widest uppercase">{entry.person}</td>
                        <td className={`px-6 py-4 text-right font-black font-mono ${entry.amount < 0 ? 'text-red-500' : 'text-[#2ecc71]'}`}>
                          {entry.amount > 0 ? '+' : ''}{entry.amount.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 text-right">
                           <div className="flex items-center justify-end gap-2 opacity-0 group-hover/item:opacity-100 transition-opacity">
                              <button 
                                onClick={(e) => { e.stopPropagation(); handleEditLogEntry(entry); }}
                                className="p-1.5 bg-white/10 rounded-lg hover:bg-[#2ecc71]/20 hover:text-[#2ecc71] transition-colors"
                              >
                                 <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/></svg>
                              </button>
                           </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
             </div>
          </div>

          <div className="pt-6 border-t dark:border-white/5 border-gray-200 flex justify-end">
            <button 
              onClick={() => {
                if(window.confirm(`Dauerhaft entfernen?`)) onDelete(kit.id);
              }}
              className="text-[10px] font-black text-gray-500 hover:text-red-500 uppercase tracking-widest transition-colors"
            >
              Material löschen
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const InventoryList: React.FC<InventoryListProps> = ({ kits, onTransaction, onDelete, onUpdateKit, onDeleteHistoryEntry, onEditHistoryEntry, currentUser, showCategoryGaps }) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [flashingId, setFlashingId] = useState<string | null>(null);

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const handleActionSuccess = (id: string) => {
    setFlashingId(id);
    setTimeout(() => setFlashingId(null), 1000);
  };

  const calculateVisualPercent = (current: number, threshold: number) => {
    if (current <= threshold) {
      return (current / threshold) * 33;
    } else {
      const surplus = current - threshold;
      const rangeAbove = threshold * 2;
      const relativeSurplus = (surplus / rangeAbove) * 67;
      return Math.min(100, 33 + relativeSurplus);
    }
  };

  let lastCategory = '';

  return (
    <div className="glass rounded-[2.5rem] overflow-hidden border dark:border-white/5 border-gray-200 shadow-3xl">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-white/5 border-b dark:border-white/5 border-gray-200">
              <th className="px-8 py-6 text-[10px] font-black text-gray-500 uppercase tracking-[0.3em]">Status</th>
              <th className="px-8 py-6 text-[10px] font-black text-gray-500 uppercase tracking-[0.3em]">Bezeichnung & Verknüpfung</th>
              <th className="px-8 py-6 text-[10px] font-black text-gray-500 uppercase tracking-[0.3em]">Kategorie</th>
              <th className="px-8 py-6 text-[10px] font-black text-gray-500 uppercase tracking-[0.3em]">Füllstand (Relativ)</th>
              <th className="px-8 py-6 text-[10px] font-black text-gray-500 uppercase tracking-[0.3em]">Quick Buchung (+/-)</th>
              <th className="px-8 py-6 text-right"></th>
            </tr>
          </thead>
          <tbody className="divide-y dark:divide-white/5 divide-gray-100">
            {kits.map((kit, index) => {
              const visualPercent = calculateVisualPercent(kit.currentVolume, kit.criticalThreshold);
              const isCritical = kit.currentVolume < kit.criticalThreshold;
              const isWarning = !isCritical && kit.currentVolume < kit.criticalThreshold * 1.5;
              const isExpanded = expandedId === kit.id;
              const isFlashing = flashingId === kit.id;
              
              const showGap = showCategoryGaps && kit.category !== lastCategory && index !== 0;
              lastCategory = kit.category;

              const getStatusColor = () => {
                if (isCritical) return 'bg-red-500';
                if (isWarning) return 'bg-yellow-500';
                return 'bg-[#2ecc71]';
              };

              return (
                <React.Fragment key={kit.id}>
                  {showGap && (
                    <tr className="bg-black/[0.02] dark:bg-white/[0.01]">
                       <td colSpan={6} className="px-8 py-3">
                          <div className="h-px w-full dark:bg-white/5 bg-black/5" />
                       </td>
                    </tr>
                  )}
                  <tr 
                    onClick={() => toggleExpand(kit.id)}
                    className={`group cursor-pointer transition-premium relative ${isCritical ? 'bg-red-500/[0.03]' : ''} ${isExpanded ? 'bg-black/[0.03] dark:bg-white/5 shadow-inner' : 'hover:bg-black/[0.02] dark:hover:bg-white/[0.04]'} ${isFlashing ? 'animate-success-flash' : ''}`}
                  >
                    <td className="px-8 py-7">
                      <div className="flex items-center gap-4">
                        <div className={`w-3 h-3 rounded-full ${getStatusColor()} ${isCritical ? 'critical-pulse scale-125' : ''}`} />
                        <span className={`text-[9px] font-black uppercase tracking-tighter ${isCritical ? 'text-red-500' : 'text-gray-500'}`}>
                           {isCritical ? 'ALARM' : 'STOCK'}
                        </span>
                      </div>
                    </td>
                    <td className="px-8 py-7">
                      <div className="flex flex-col gap-1">
                        <div className={`text-lg font-black tracking-tight transition-premium leading-none ${isExpanded || isFlashing ? 'text-[#2ecc71]' : 'dark:text-white text-gray-900'} group-hover:text-[#2ecc71]`}>
                          {kit.name}
                        </div>
                        <div className="flex items-center gap-2">
                           <div className="text-[10px] text-gray-500 font-bold uppercase tracking-widest truncate max-w-[120px]">{kit.description || 'Oligo'}</div>
                           <div className="w-1 h-1 rounded-full bg-black/10 dark:bg-white/10" />
                           <div className="text-[10px] text-[#2ecc71] dark:text-[#2ecc71]/40 font-black uppercase tracking-widest">{kit.linkedProducts || 'No Link'}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-7">
                      <span className="px-3 py-1 bg-black/5 dark:bg-white/5 dark:text-white text-gray-900 text-[9px] font-black rounded-lg uppercase tracking-widest border dark:border-white/10 border-gray-200 group-hover:bg-[#2ecc71] group-hover:text-black transition-premium">
                        {kit.category}
                      </span>
                    </td>
                    <td className="px-8 py-7">
                      <div className="flex flex-col gap-2 w-48">
                        <div className="flex justify-between items-end">
                          <span className={`text-xl font-black font-mono leading-none ${isCritical ? 'text-red-500' : 'dark:text-white text-gray-900'}`}>
                            {kit.currentVolume.toLocaleString()}
                            <span className="text-[10px] text-gray-500 ml-1 font-bold">µl</span>
                          </span>
                          <span className={`text-[9px] font-black uppercase tracking-tighter ${isCritical ? 'text-red-500' : 'text-gray-500'}`}>
                            {isCritical ? 'LEER' : isWarning ? 'WENIG' : 'OK'}
                          </span>
                        </div>
                        <div className="h-2 w-full dark:bg-white/5 bg-black/5 rounded-full overflow-hidden p-[1px]">
                          <div 
                            className={`h-full transition-all duration-1000 cubic-bezier(0.16, 1, 0.3, 1) rounded-full ${getStatusColor()} ${isCritical ? 'animate-pulse' : ''}`} 
                            style={{ width: `${visualPercent}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-7">
                       <QuickTransaction 
                        kit={kit} 
                        onTransaction={onTransaction} 
                        onActionSuccess={handleActionSuccess} 
                        currentUser={currentUser} 
                       />
                    </td>
                    <td className="px-8 py-7 text-right">
                      <div className={`transition-premium p-2 dark:bg-white/5 bg-black/5 rounded-xl group-hover:bg-[#2ecc71]/10 group-hover:text-[#2ecc71] ${isExpanded ? 'rotate-180 bg-[#2ecc71]/20 text-[#2ecc71]' : 'text-gray-400'}`}>
                         <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7"/></svg>
                      </div>
                    </td>
                  </tr>
                  {isExpanded && (
                    <tr>
                      <td colSpan={6} className="p-0 border-none">
                        <ExpandedRow 
                          kit={kit} 
                          onTransaction={onTransaction} 
                          onDelete={onDelete} 
                          onUpdateKit={onUpdateKit}
                          onDeleteHistoryEntry={onDeleteHistoryEntry}
                          onEditHistoryEntry={onEditHistoryEntry}
                          onActionSuccess={handleActionSuccess}
                          currentUser={currentUser}
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
