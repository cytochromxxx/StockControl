
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Kit, CategoryDef, SortOption, Category, User } from './types';
import { kitApi, labUsers } from './api';
import InventoryList from './components/InventoryList';

const App: React.FC = () => {
  const [kits, setKits] = useState<Kit[]>([]);
  const [categories, setCategories] = useState<CategoryDef[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<Category | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('name');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [currentUser, setCurrentUser] = useState<User>(labUsers[0]);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [isAdding, setIsAdding] = useState(false);
  const [newKit, setNewKit] = useState<Omit<Kit, 'id' | 'history'>>({
    name: '',
    category: 'K',
    linkedProducts: '',
    description: '',
    startVolume: 15000,
    currentVolume: 15000,
    criticalThreshold: 2000
  });

  useEffect(() => {
    initApp();
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light') {
      setIsDarkMode(false);
      document.body.classList.add('light');
      document.body.classList.remove('dark');
    }
  }, []);

  const toggleTheme = () => {
    setIsDarkMode(prev => {
      const next = !prev;
      if (next) {
        document.body.classList.add('dark');
        document.body.classList.remove('light');
        localStorage.setItem('theme', 'dark');
      } else {
        document.body.classList.add('light');
        document.body.classList.remove('dark');
        localStorage.setItem('theme', 'light');
      }
      return next;
    });
  };

  const initApp = async () => {
    setLoading(true);
    try {
      const [kitsData, catsData] = await Promise.all([
        kitApi.getKits(),
        kitApi.getCategories()
      ]);
      setKits(kitsData);
      setCategories(catsData);
    } catch (err) {
      showToast("Daten laden fehlgeschlagen.", "error");
    } finally {
      setLoading(false);
    }
  };

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleTransaction = async (id: string, amount: number, operator: string, type: 'withdraw' | 'refill') => {
    try {
      let updated: Kit;
      const payload = {
        amount: Math.abs(amount),
        person: operator,
        date: new Date().toISOString().split('T')[0],
        comment: type === 'withdraw' ? 'Entnahme' : 'Auffüllung'
      };

      if (type === 'withdraw') {
        updated = await kitApi.withdraw(id, payload);
        showToast(`${amount.toLocaleString()}µl entnommen.`, "success");
      } else {
        updated = await kitApi.refill(id, payload);
        showToast(`${amount.toLocaleString()}µl hinzugefügt.`, "success");
      }
      setKits(prev => prev.map(k => k.id === updated.id ? updated : k));
    } catch (err: any) {
      showToast(err.message, "error");
    }
  };

  const handleUpdateKit = async (id: string, updates: Partial<Kit>) => {
    try {
      const updated = await kitApi.updateKit(id, updates);
      setKits(prev => prev.map(k => k.id === updated.id ? updated : k));
      showToast("Eintrag aktualisiert.", "success");
    } catch (err: any) {
      showToast(err.message, "error");
    }
  };

  const handleDeleteKit = async (id: string) => {
    try {
      await kitApi.removeKit(id);
      setKits(prev => prev.filter(k => k.id !== id));
      showToast("Eintrag gelöscht.", "success");
    } catch (err: any) {
      showToast(err.message, "error");
    }
  };

  const handleDeleteHistoryEntry = async (kitId: string, entryId: string) => {
    try {
      const updated = await kitApi.removeHistoryEntry(kitId, entryId);
      setKits(prev => prev.map(k => k.id === updated.id ? updated : k));
      showToast("Log-Eintrag entfernt.", "success");
    } catch (err: any) {
      showToast(err.message, "error");
    }
  };

  const handleEditHistoryEntry = async (kitId: string, entryId: string, newAmount: number) => {
    try {
      const updated = await kitApi.updateHistoryEntry(kitId, entryId, newAmount);
      setKits(prev => prev.map(k => k.id === updated.id ? updated : k));
      showToast("Log-Eintrag korrigiert.", "success");
    } catch (err: any) {
      showToast(err.message, "error");
    }
  };

  const handleAddKit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKit.name.trim()) return;
    try {
      const created = await kitApi.createKit(newKit);
      setKits(prev => [...prev, created]);
      setIsAdding(false);
      setNewKit({
        name: '',
        category: 'K',
        linkedProducts: '',
        description: '',
        startVolume: 15000,
        currentVolume: 15000,
        criticalThreshold: 2000
      });
      showToast(`'${created.name}' hinzugefügt.`, "success");
    } catch (err: any) {
      showToast(err.message, "error");
    }
  };

  const filteredKits = useMemo(() => {
    let result = kits.filter(k => {
      const matchCat = activeCategory ? k.category === activeCategory : true;
      const matchSearch = k.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          k.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          k.linkedProducts.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCat && matchSearch;
    });

    result.sort((a, b) => {
      if (!activeCategory && sortBy === 'name') {
          const catDiff = a.category.localeCompare(b.category);
          if (catDiff !== 0) return catDiff;
      }
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      if (sortBy === 'volume') return b.currentVolume - a.currentVolume;
      if (sortBy === 'status') {
        const critA = a.currentVolume < a.criticalThreshold ? 1 : 0;
        const critB = b.currentVolume < b.criticalThreshold ? 1 : 0;
        return critB - critA;
      }
      return 0;
    });
    return result;
  }, [kits, activeCategory, searchQuery, sortBy]);

  const exportToCSV = () => {
    const headers = ["Name", "Kategorie", "Verknüpfte Produkte", "Füllstand (µl)", "Kritischer Wert (µl)", "Status"];
    const rows = filteredKits.map(kit => {
      const status = kit.currentVolume < kit.criticalThreshold ? "ALARM" : "OK";
      return [
        `"${kit.name}"`,
        `"${kit.category}"`,
        `"${kit.linkedProducts.replace(/"/g, '""')}"`,
        kit.currentVolume,
        kit.criticalThreshold,
        `"${status}"`
      ].join(";");
    });

    const csvContent = "\ufeff" + [headers.join(";"), ...rows].join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `BioStock_Export_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast("Bestandsliste exportiert.", "success");
  };

  const handleImportCSV = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const content = event.target?.result as string;
      const lines = content.split(/\r?\n/).filter(line => line.trim() !== "");
      if (lines.length < 2) return;

      const newKitsBatch: Kit[] = [];
      // Skip header
      for (let i = 1; i < lines.length; i++) {
        const columns = lines[i].split(";").map(col => col.trim().replace(/^"|"$/g, ''));
        if (columns.length < 5) continue;

        const [name, category, linkedProducts, currentVolume, criticalThreshold] = columns;
        try {
          const created = await kitApi.createKit({
            name,
            category: category || 'K',
            linkedProducts: linkedProducts || '',
            description: 'Importiert',
            startVolume: Number(currentVolume) || 10000,
            currentVolume: Number(currentVolume) || 10000,
            criticalThreshold: Number(criticalThreshold) || 1000
          });
          newKitsBatch.push(created);
        } catch (err) {
          console.error("Import error for line", i, err);
        }
      }

      setKits(prev => [...prev, ...newKitsBatch]);
      showToast(`${newKitsBatch.length} Produkte importiert.`, "success");
      if (fileInputRef.current) fileInputRef.current.value = "";
    };
    reader.readAsText(file);
  };

  const criticalKits = useMemo(() => kits.filter(k => k.currentVolume < k.criticalThreshold), [kits]);

  return (
    <div className="min-h-screen pb-40 transition-colors duration-400">
      <nav className="sticky top-0 z-[60] glass border-b px-4 md:px-8 py-4 transition-colors duration-400">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="w-12 h-12 bg-[#2ecc71] rounded-2xl flex items-center justify-center shadow-[0_0_25px_rgba(46,204,113,0.3)] rotate-3">
              <svg className="w-7 h-7 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L12 18l6.79 3 .71-.71L12 2z"/>
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-extrabold tracking-tightest uppercase leading-none italic dark:text-white text-gray-900">BioStock <span className="text-[#2ecc71]">Pro</span></h1>
              <p className="text-[10px] text-gray-500 font-bold tracking-[0.3em] uppercase mt-1">Sartorius Lab Operations</p>
            </div>
          </div>

          <div className="flex-1 max-w-3xl w-full flex items-center gap-4">
            <div className="relative flex-1 group">
              <input 
                type="text" 
                placeholder="Suche: Produktverknüpfung (z.B. VGM), Name..."
                className="w-full bg-white/5 border dark:border-white/10 border-gray-200 rounded-2xl pl-12 pr-4 py-3.5 text-sm dark:text-white text-gray-900 focus:outline-none focus:border-[#2ecc71] focus:bg-white/10 transition-premium placeholder-gray-500"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <svg className="w-5 h-5 text-gray-500 absolute left-4 top-4 group-focus-within:text-[#2ecc71] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
              </svg>
            </div>
            
            <div className="hidden sm:flex items-center gap-3 glass-hover bg-white/5 px-4 py-2.5 rounded-2xl border dark:border-white/10 border-gray-200 transition-premium">
              <div className="flex flex-col items-start">
                 <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest leading-none mb-1">Operator</span>
                 <select 
                    value={currentUser.initials}
                    onChange={(e) => {
                      const user = labUsers.find(u => u.initials === e.target.value);
                      if (user) setCurrentUser(user);
                    }}
                    className="bg-transparent text-xs font-black dark:text-white text-gray-900 outline-none cursor-pointer tracking-wider"
                 >
                    {labUsers.map(u => <option key={u.initials} value={u.initials}>{u.name} ({u.initials})</option>)}
                 </select>
              </div>
              <div className="w-8 h-8 rounded-xl bg-[#2ecc71] flex items-center justify-center text-black font-black text-[10px]">
                {currentUser.initials}
              </div>
            </div>

            <div className="flex gap-2">
              <button 
                onClick={toggleTheme}
                title="Theme wechseln"
                className="p-3.5 bg-white/5 border dark:border-white/10 border-gray-200 rounded-2xl dark:text-gray-400 text-gray-600 hover:text-[#2ecc71] transition-premium"
              >
                {isDarkMode ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 3v1m0 16v1m9-9h-1M3 12H2m15.364-6.364l-.707.707M6.343 17.657l-.707.707m12.728 0l-.707-.707M6.343 6.343l-.707-.707M12 7a5 5 0 100 10 5 5 0 000-10z"/></svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"/></svg>
                )}
              </button>
              
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleImportCSV} 
                className="hidden" 
                accept=".csv"
              />
              <button 
                onClick={() => fileInputRef.current?.click()}
                title="CSV importieren"
                className="p-3.5 bg-white/5 border dark:border-white/10 border-gray-200 rounded-2xl dark:text-gray-400 text-gray-600 hover:text-[#2ecc71] transition-premium"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"/>
                </svg>
              </button>

              <button 
                onClick={exportToCSV}
                title="Liste als CSV exportieren"
                className="p-3.5 bg-white/5 border dark:border-white/10 border-gray-200 rounded-2xl dark:text-gray-400 text-gray-600 hover:text-[#2ecc71] transition-premium"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/>
                </svg>
              </button>

              <button 
                onClick={() => setIsAdding(true)}
                className="bg-[#2ecc71] hover:bg-[#27ae60] text-black font-black py-3.5 px-6 rounded-2xl text-xs uppercase tracking-widest transition-premium shadow-xl shadow-[#2ecc71]/10 whitespace-nowrap"
              >
                +
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="bg-[#0d0d0e]/40 dark:backdrop-blur-md dark:border-b border-white/5 sticky top-[81px] z-50">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-3 overflow-x-auto">
          <div className="flex items-center gap-2 min-w-max">
            <button 
              onClick={() => setActiveCategory(null)}
              className={`px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-premium ${
                activeCategory === null 
                ? 'bg-[#2ecc71] text-black shadow-[0_0_15px_rgba(46,204,113,0.3)]' 
                : 'bg-white/5 dark:text-gray-500 text-gray-700 hover:bg-white/10 hover:text-white'
              }`}
            >
              Komplette Liste
            </button>
            <div className="w-px h-4 bg-white/10 mx-2" />
            {categories.map(cat => (
              <button 
                key={cat.key}
                onClick={() => setActiveCategory(cat.key)}
                className={`px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-premium ${
                  activeCategory === cat.key 
                  ? 'bg-[#2ecc71] text-black shadow-[0_0_15px_rgba(46,204,113,0.3)]' 
                  : 'bg-white/5 dark:text-gray-500 text-gray-700 hover:bg-white/10 hover:text-white'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 md:px-8 mt-10">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-48">
            <div className="relative">
              <div className="w-20 h-20 border-t-4 border-[#2ecc71] rounded-full animate-spin"></div>
              <div className="absolute inset-0 w-20 h-20 border-4 border-white/5 rounded-full"></div>
            </div>
            <p className="mt-10 text-gray-500 font-black uppercase tracking-[0.4em] text-[10px] animate-pulse">Initializing System Data</p>
          </div>
        ) : (
          <div className="space-y-12">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/5 pb-6">
              <div>
                <h2 className="text-4xl font-black dark:text-white text-gray-900 tracking-tighter uppercase mb-1">
                  {activeCategory ? `Kategorie: ${activeCategory}` : 'Inventarübersicht'}
                </h2>
                <p className="text-xs text-gray-500 font-medium uppercase tracking-widest">
                  Aktuell werden <span className="dark:text-white text-gray-900 font-black">{filteredKits.length}</span> Einträge überwacht
                </p>
              </div>
              
              <div className="flex items-center gap-5">
                <div className="flex flex-col items-end gap-1">
                  <span className="text-[9px] font-black text-gray-600 uppercase tracking-widest">Sortierung</span>
                  <select 
                    className="bg-white/5 border dark:border-white/10 border-gray-200 text-xs dark:text-white text-gray-900 rounded-xl px-5 py-2.5 focus:border-[#2ecc71] outline-none transition-premium cursor-pointer hover:bg-white/10"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as SortOption)}
                  >
                    <option value="name">Alphabetisch</option>
                    <option value="volume">Höchstes Volumen</option>
                    <option value="status">Status / Warnungen</option>
                  </select>
                </div>
              </div>
            </div>

            <InventoryList 
              kits={filteredKits} 
              onTransaction={handleTransaction}
              onDelete={handleDeleteKit}
              onUpdateKit={handleUpdateKit}
              onDeleteHistoryEntry={handleDeleteHistoryEntry}
              onEditHistoryEntry={handleEditHistoryEntry}
              currentUser={currentUser}
              showCategoryGaps={!activeCategory && sortBy === 'name'}
            />
          </div>
        )}
      </main>

      {criticalKits.length > 0 && (
        <div className="fixed bottom-8 right-8 z-[100] group">
          <div className="absolute -inset-4 bg-red-600/20 blur-2xl rounded-full animate-pulse opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
          <div className="relative glass border-red-500/50 rounded-[2.5rem] p-4 flex items-center gap-5 shadow-2xl shadow-red-900/20 transition-all duration-500 group-hover:translate-x-[-10px] group-hover:scale-105">
            <div className="w-14 h-14 bg-red-600 rounded-3xl flex items-center justify-center text-white critical-pulse shadow-lg shadow-red-600/30">
               <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
               </svg>
            </div>
            <div className="pr-6">
              <h4 className="text-sm font-black text-red-500 uppercase tracking-widest leading-none mb-1">Nachbestellung!</h4>
              <p className="text-[10px] text-red-400 font-bold uppercase tracking-[0.2em]">
                {criticalKits.length} {criticalKits.length === 1 ? 'Eintrag' : 'Einträge'} kritisch
              </p>
            </div>
            
            <div className="absolute bottom-full right-0 mb-4 opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition-all duration-300 transform translate-y-4 group-hover:translate-y-0 w-[240px]">
              <div className="glass border-red-500/30 p-4 rounded-3xl shadow-3xl space-y-2">
                <p className="text-[9px] font-black text-gray-500 uppercase tracking-[0.3em] mb-2 px-1">Bestandsliste:</p>
                {criticalKits.slice(0, 8).map(k => (
                  <div key={k.id} className="flex justify-between items-center bg-red-500/10 px-3 py-2 rounded-xl border border-red-500/10">
                    <span className="text-[10px] font-black text-white truncate max-w-[120px]">{k.name}</span>
                    <span className="text-[10px] font-mono font-bold text-red-400">{k.currentVolume}µl</span>
                  </div>
                ))}
                {criticalKits.length > 8 && <p className="text-[9px] text-center text-gray-600 font-black uppercase tracking-widest pt-1">+{criticalKits.length - 8} weitere...</p>}
              </div>
            </div>
          </div>
        </div>
      )}

      {isAdding && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-[#0d0d0e]/90 backdrop-blur-md animate-in fade-in duration-300" 
            onClick={() => setIsAdding(false)} 
          />
          <div className="glass w-full max-w-2xl p-10 rounded-[2.5rem] border border-white/10 shadow-2xl space-y-10 animate-in zoom-in-95 slide-in-from-bottom-10 duration-500 relative z-10">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-3xl font-black dark:text-white text-gray-900 uppercase tracking-tighter leading-none mb-2">System-Eintrag</h2>
                <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest">Neues Labormaterial registrieren</p>
              </div>
              <button 
                onClick={() => setIsAdding(false)}
                className="p-3 bg-white/5 rounded-2xl hover:bg-white/10 transition-premium text-gray-500 hover:text-white"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12"/></svg>
              </button>
            </div>

            <form onSubmit={handleAddKit} className="space-y-8">
              <div className="grid grid-cols-2 gap-8">
                <div className="col-span-2 space-y-2">
                  <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest">Bezeichnung</label>
                  <input 
                    required
                    type="text"
                    value={newKit.name}
                    onChange={(e) => setNewKit({...newKit, name: e.target.value})}
                    placeholder="z.B. K102 - Custom Primer"
                    className="w-full bg-white/5 border dark:border-white/10 border-gray-200 rounded-2xl px-5 py-3.5 dark:text-white text-gray-900 focus:outline-none focus:border-[#2ecc71] focus:bg-white/10 transition-premium"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest">Kategorie</label>
                  <select 
                    value={newKit.category}
                    onChange={(e) => setNewKit({...newKit, category: e.target.value})}
                    className="w-full bg-white/5 border dark:border-white/10 border-gray-200 rounded-2xl px-5 py-3.5 dark:text-white text-gray-900 focus:outline-none focus:border-[#2ecc71] focus:bg-white/10 transition-premium appearance-none"
                  >
                    {categories.map(cat => <option key={cat.key} value={cat.key}>{cat.label}</option>)}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest">Verknüpfte Produkte</label>
                  <input 
                    type="text"
                    value={newKit.linkedProducts}
                    onChange={(e) => setNewKit({...newKit, linkedProducts: e.target.value})}
                    placeholder="VGM, Qiagen..."
                    className="w-full bg-white/5 border dark:border-white/10 border-gray-200 rounded-2xl px-5 py-3.5 dark:text-white text-gray-900 focus:outline-none focus:border-[#2ecc71] focus:bg-white/10 transition-premium"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest">Startvolumen (µl)</label>
                  <input 
                    required
                    type="number"
                    value={newKit.startVolume}
                    onChange={(e) => setNewKit({...newKit, startVolume: Number(e.target.value), currentVolume: Number(e.target.value)})}
                    className="w-full bg-white/5 border dark:border-white/10 border-gray-200 rounded-2xl px-5 py-3.5 dark:text-white text-gray-900 focus:outline-none focus:border-[#2ecc71] focus:bg-white/10 transition-premium font-mono"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest">Kritischer Wert (µl)</label>
                  <input 
                    required
                    type="number"
                    value={newKit.criticalThreshold}
                    onChange={(e) => setNewKit({...newKit, criticalThreshold: Number(e.target.value)})}
                    className="w-full bg-white/5 border dark:border-white/10 border-gray-200 rounded-2xl px-5 py-3.5 dark:text-white text-gray-900 focus:outline-none focus:border-[#2ecc71] focus:bg-white/10 transition-premium font-mono"
                  />
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button 
                  type="submit"
                  className="flex-1 py-4 bg-[#2ecc71] text-black font-black rounded-2xl hover:bg-[#27ae60] transition-premium uppercase text-xs tracking-widest shadow-xl shadow-[#2ecc71]/20"
                >
                  Datenbank speichern
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {toast && (
        <div className={`fixed bottom-12 left-1/2 -translate-x-1/2 z-[150] px-8 py-4 rounded-[2rem] font-bold shadow-2xl flex items-center gap-4 animate-in slide-in-from-bottom-10 fade-in duration-500 ${
          toast.type === 'success' ? 'glass border-[#2ecc71]/30 text-[#2ecc71]' : 'bg-red-500 text-white'
        }`}>
          <div className={`w-2 h-2 rounded-full ${toast.type === 'success' ? 'bg-[#2ecc71]' : 'bg-white'} animate-pulse`} />
          <span className="text-sm tracking-tight">{toast.message}</span>
        </div>
      )}
    </div>
  );
};

export default App;
