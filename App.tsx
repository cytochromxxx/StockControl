
import React, { useState, useEffect, useMemo } from 'react';
import { Kit, CategoryDef, SortOption } from './types';
import { kitApi } from './api';
import Dashboard from './components/Dashboard';
import InventoryList from './components/InventoryList';

const App: React.FC = () => {
  const [kits, setKits] = useState<Kit[]>([]);
  const [categories, setCategories] = useState<CategoryDef[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('name');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  
  // Creation form state
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
  }, []);

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
        comment: type === 'withdraw' ? 'Manuelle Entnahme' : 'Manuelle Auffüllung'
      };

      if (type === 'withdraw') {
        updated = await kitApi.withdraw(id, payload);
        showToast(`${amount}µl entnommen von ${operator}.`, "success");
      } else {
        updated = await kitApi.refill(id, payload);
        showToast(`${amount}µl hinzugefügt von ${operator}.`, "success");
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
      showToast(`'${created.name}' wurde hinzugefügt.`, "success");
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

  return (
    <div className="min-h-screen pb-32">
      <nav className="sticky top-0 z-50 glass border-b border-white/5 px-8 py-4 mb-10">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-[#2ecc71] rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(46,204,113,0.4)]">
              <svg className="w-6 h-6 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L12 18l6.79 3 .71-.71L12 2z"/></svg>
            </div>
            <div>
              <h1 className="text-xl font-black text-white tracking-tighter uppercase leading-none">BioStock Pro</h1>
              <p className="text-[10px] text-[#2ecc71] font-bold tracking-[0.2em] uppercase mt-1">Primer & Enzyme Inventory</p>
            </div>
          </div>

          <div className="flex-1 max-w-2xl w-full flex gap-3">
             <div className="relative flex-1">
              <input 
                type="text" 
                placeholder="Suche ID, Name oder Produkt..."
                className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 py-3 text-sm text-white focus:outline-none focus:border-[#2ecc71] transition-all"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <svg className="w-5 h-5 text-gray-500 absolute left-4 top-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
            </div>
            <button 
              onClick={() => setIsAdding(true)}
              className="bg-[#2ecc71] hover:bg-[#27ae60] text-black font-black py-2 px-6 rounded-2xl text-xs uppercase tracking-widest transition-all shadow-lg"
            >
              Neu Hinzufügen
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-8">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-40">
            <div className="w-16 h-16 border-t-4 border-[#2ecc71] rounded-full animate-spin"></div>
            <p className="mt-6 text-gray-500 font-bold uppercase tracking-widest text-xs">Bestand wird geladen...</p>
          </div>
        ) : (
          <>
            <Dashboard 
              kits={kits} 
              categoryDefs={categories} 
              onFilterCategory={setActiveCategory} 
              activeCategory={activeCategory} 
            />
            
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
              <h2 className="text-2xl font-black text-white tracking-tight uppercase">
                {activeCategory ? `Kategorie ${activeCategory}` : 'Bestandsliste'}
                <span className="ml-3 text-gray-600 font-mono text-sm">({filteredKits.length})</span>
              </h2>
              <div className="flex items-center gap-4">
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Sortierung</span>
                <select 
                  className="bg-white/5 border border-white/10 text-xs text-white rounded-xl px-4 py-2 focus:border-[#2ecc71] outline-none"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortOption)}
                >
                  <option value="name">Name (A-Z)</option>
                  <option value="volume">Volumen</option>
                  <option value="status">Status</option>
                </select>
              </div>
            </div>

            <InventoryList 
              kits={filteredKits} 
              onTransaction={handleTransaction}
              onDelete={handleDeleteKit}
              onUpdateKit={handleUpdateKit}
            />
          </>
        )}
      </main>

      {/* Creation Modal */}
      {isAdding && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="glass w-full max-w-xl p-8 rounded-3xl border border-white/10 shadow-2xl space-y-8 animate-in zoom-in-95 duration-200">
            <div>
              <h2 className="text-2xl font-black text-white uppercase tracking-tighter">Neuer Eintrag</h2>
              <p className="text-[10px] text-gray-500 uppercase font-bold tracking-widest mt-1">Primärdaten für Labormaterial</p>
            </div>

            <form onSubmit={handleAddKit} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 space-y-2">
                  <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest">Bezeichnung / Name</label>
                  <input 
                    required
                    type="text"
                    value={newKit.name}
                    onChange={(e) => setNewKit({...newKit, name: e.target.value})}
                    placeholder="z.B. K100 - Primer"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-[#2ecc71] transition-all"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest">Kategorie</label>
                  <select 
                    value={newKit.category}
                    onChange={(e) => setNewKit({...newKit, category: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-[#2ecc71] transition-all"
                  >
                    {categories.map(cat => <option key={cat.key} value={cat.key}>{cat.label}</option>)}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest">Verknüpfung / Notes</label>
                  <input 
                    type="text"
                    value={newKit.linkedProducts}
                    onChange={(e) => setNewKit({...newKit, linkedProducts: e.target.value})}
                    placeholder="VGM, Qiagen, etc."
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-[#2ecc71] transition-all"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest">Max. Kapazität (µl)</label>
                  <input 
                    required
                    type="number"
                    value={newKit.startVolume}
                    onChange={(e) => setNewKit({...newKit, startVolume: Number(e.target.value), currentVolume: Number(e.target.value)})}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-[#2ecc71] transition-all"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest">Kritischer Wert (µl)</label>
                  <input 
                    required
                    type="number"
                    value={newKit.criticalThreshold}
                    onChange={(e) => setNewKit({...newKit, criticalThreshold: Number(e.target.value)})}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-[#2ecc71] transition-all"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button 
                  type="button"
                  onClick={() => setIsAdding(false)}
                  className="flex-1 py-3 bg-white/5 text-gray-400 font-bold rounded-2xl hover:bg-white/10 transition-all uppercase text-xs"
                >
                  Abbrechen
                </button>
                <button 
                  type="submit"
                  className="flex-1 py-3 bg-[#2ecc71] text-black font-black rounded-2xl hover:bg-[#27ae60] transition-all uppercase text-xs shadow-lg"
                >
                  Speichern
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {toast && (
        <div className={`fixed bottom-10 left-1/2 -translate-x-1/2 z-[100] px-8 py-4 rounded-2xl font-bold shadow-2xl flex items-center gap-3 animate-bounce ${
          toast.type === 'success' ? 'bg-[#2ecc71] text-black' : 'bg-red-500 text-white'
        }`}>
          {toast.message}
        </div>
      )}
    </div>
  );
};

export default App;
