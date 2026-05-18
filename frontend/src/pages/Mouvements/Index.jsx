import { useState } from 'react';
import { Search, Filter, ArrowUpRight, ArrowDownRight, Download, Calendar } from 'lucide-react';

const mockMouvements = [
  { id: 1, date: '14 Mai 2026 10:30', article: 'Laptop Dell XPS 15', ref: 'ART-001', type: 'entree', quantite: 50, operateur: 'Admin User', motif: 'Achat', doc: 'BL-2026-001' },
  { id: 2, date: '14 Mai 2026 09:15', article: 'Cartouche Encre HP 305', ref: 'ART-002', type: 'sortie', quantite: 12, operateur: 'Admin User', motif: 'Consommation', doc: 'BS-2026-001' },
  { id: 3, date: '13 Mai 2026 16:45', article: 'Écran 27" 4K', ref: 'ART-005', type: 'entree', quantite: 20, operateur: 'Admin User', motif: 'Achat', doc: 'BL-2026-002' },
  { id: 4, date: '12 Mai 2026 11:20', article: 'Souris Sans Fil', ref: 'ART-003', type: 'sortie', quantite: 5, operateur: 'Admin User', motif: 'Vente', doc: 'BS-2026-002' },
];

export default function MouvementsList() {
  const [activeTab, setActiveTab] = useState('Tous');

  const handleExportCSV = () => {
    const dataToExport = mockMouvements.filter(m => {
      if (activeTab === 'Entrées' && m.type !== 'entree') return false;
      if (activeTab === 'Sorties' && m.type !== 'sortie') return false;
      return true;
    });
    
    if (!dataToExport.length) return alert('Aucun mouvement à exporter');
    
    const headers = ['ID', 'Date', 'Article', 'Ref', 'Type', 'Quantite', 'Motif', 'Doc', 'Operateur'];
    const rows = dataToExport.map(m => [
      m.id, 
      `"${m.date}"`, 
      `"${m.article}"`, 
      m.ref, 
      m.type, 
      m.quantite, 
      `"${m.motif}"`, 
      m.doc, 
      `"${m.operateur}"`
    ]);
    
    const csvContent = "data:text/csv;charset=utf-8," 
        + headers.join(",") + "\n" 
        + rows.map(e => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `export_mouvements_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Historique des Mouvements</h1>
          <p className="text-sm text-gray-500 mt-1">Tracez toutes les entrées et sorties de votre stock.</p>
        </div>
        <button onClick={handleExportCSV} className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors shadow-sm">
          <Download className="w-4 h-4" /> Exporter
        </button>
      </div>

      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:max-w-md group">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 group-focus-within:text-primary" />
          <input type="text" placeholder="Rechercher un article, un doc..." className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" />
        </div>
        
        <div className="flex gap-4 w-full md:w-auto">
          <div className="flex bg-gray-50 border border-gray-200 rounded-xl p-1">
             {['Tous', 'Entrées', 'Sorties'].map((tab) => (
               <button key={tab} onClick={() => setActiveTab(tab)} className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${activeTab === tab ? 'bg-white shadow-sm text-gray-900 border border-gray-200/50' : 'text-gray-500 hover:text-gray-700'}`}>
                 {tab}
               </button>
             ))}
          </div>
          <button className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-50 text-gray-700 border border-gray-200 rounded-xl text-sm font-medium hover:bg-gray-100 transition-colors">
            <Filter className="w-4 h-4" /> Filtrer
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="bg-gray-50 text-xs uppercase text-gray-500 font-semibold border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 w-48">Date & Heure</th>
                <th className="px-6 py-4">Article</th>
                <th className="px-6 py-4 text-center">Type</th>
                <th className="px-6 py-4 text-right">Quantité</th>
                <th className="px-6 py-4">Motif & Réf. Doc</th>
                <th className="px-6 py-4">Opérateur</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {mockMouvements.map((m) => {
                if (activeTab === 'Entrées' && m.type !== 'entree') return null;
                if (activeTab === 'Sorties' && m.type !== 'sortie') return null;
                
                return (
                  <tr key={m.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-gray-500">{m.date}</td>
                    <td className="px-6 py-4">
                      <p className="font-bold text-gray-900">{m.article}</p>
                      <p className="text-xs text-gray-500 font-mono">{m.ref}</p>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-flex items-center justify-center w-8 h-8 rounded-lg ${m.type === 'entree' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {m.type === 'entree' ? <ArrowDownRight className="w-5 h-5" /> : <ArrowUpRight className="w-5 h-5" />}
                      </span>
                    </td>
                    <td className={`px-6 py-4 text-right font-bold text-lg ${m.type === 'entree' ? 'text-green-600' : 'text-red-600'}`}>
                      {m.type === 'entree' ? '+' : '-'}{m.quantite}
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-gray-900 font-medium">{m.motif}</p>
                      <p className="text-xs text-gray-500">{m.doc}</p>
                    </td>
                    <td className="px-6 py-4">{m.operateur}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
