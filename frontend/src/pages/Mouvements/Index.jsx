import { useState, useEffect } from 'react';
import { Search, Filter, ArrowUpRight, ArrowDownRight, Download, Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import api from '../../lib/axios';
import ExportDropdown from '../../components/ExportDropdown';

export default function MouvementsList() {
  const [activeTab, setActiveTab] = useState('Tous');
  const [search, setSearch]       = useState('');
  const [dateDebut, setDateDebut] = useState('');
  const [dateFin, setDateFin]     = useState('');
  const [mouvements, setMouvements] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState(null);
  const [meta, setMeta]           = useState({ current_page: 1, last_page: 1, total: 0 });
  const [page, setPage]           = useState(1);

  const fetchMouvements = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (activeTab === 'Entrées') params.append('type', 'entree');
      if (activeTab === 'Sorties') params.append('type', 'sortie');
      if (dateDebut) params.append('date_debut', dateDebut);
      if (dateFin)   params.append('date_fin', dateFin);
      params.append('per_page', '15');
      params.append('page', page);

      const res = await api.get(`/mouvements?${params.toString()}`);
      let data = res.data;
      
      // Handle both paginated and non-paginated responses
      if (data.data) {
        setMouvements(data.data);
        setMeta({ current_page: data.current_page, last_page: data.last_page, total: data.total });
      } else {
        setMouvements(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      setError("Erreur lors du chargement des mouvements.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setPage(1);
  }, [activeTab, dateDebut, dateFin]);

  useEffect(() => {
    fetchMouvements();
  }, [activeTab, dateDebut, dateFin, page]);

  // Search filters locally on current page (API doesn't support search on mouvements)
  const filtered = mouvements.filter(m => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      m.article?.designation?.toLowerCase().includes(q) ||
      m.article?.code?.toLowerCase().includes(q) ||
      m.reference_document?.toLowerCase().includes(q) ||
      m.motif?.toLowerCase().includes(q)
    );
  });

  const handleExportExcel = () => {
    if (!filtered.length) return alert('Aucun mouvement à exporter');
    const data = filtered.map(m => ({
      'Date': new Date(m.date_mouvement).toLocaleDateString('fr-FR'),
      'Article': m.article?.designation || '—',
      'Code': m.article?.code || '',
      'Type': m.type === 'entree' ? 'Entrée' : 'Sortie',
      'Quantité': m.quantite,
      'Stock Avant': m.stock_avant,
      'Stock Après': m.stock_apres,
      'Motif': m.motif || '',
      'Réf. Doc': m.reference_document || '',
      'Opérateur': m.user?.name || ''
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wscols = [
      {wch: 15}, {wch: 30}, {wch: 15}, {wch: 10}, {wch: 10}, {wch: 12}, {wch: 12}, {wch: 20}, {wch: 15}, {wch: 20}
    ];
    ws['!cols'] = wscols;

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Mouvements");
    XLSX.writeFile(wb, `mouvements_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const handleExportPDF = () => {
    if (!filtered.length) return alert('Aucun mouvement à exporter');
    const doc = new jsPDF('landscape');
    doc.text("Historique des Mouvements", 14, 15);
    doc.autoTable({
      startY: 20,
      head: [['Date', 'Article', 'Type', 'Quantité', 'Stock (Av → Ap)', 'Motif', 'Opérateur']],
      body: filtered.map(m => [
        new Date(m.date_mouvement).toLocaleDateString('fr-FR'),
        m.article?.designation || '—',
        m.type === 'entree' ? 'Entrée' : 'Sortie',
        m.quantite,
        `${m.stock_avant} → ${m.stock_apres}`,
        m.motif || '',
        m.user?.name || ''
      ]),
      theme: 'grid',
      headStyles: { fillColor: [26, 118, 110] },
    });
    doc.save(`mouvements_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Historique des Mouvements</h1>
          <p className="text-sm text-gray-500 mt-1">Tracez toutes les entrées et sorties de votre stock.</p>
        </div>
        <ExportDropdown onExportExcel={handleExportExcel} onExportPDF={handleExportPDF} />
      </div>

      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4 items-center justify-between">
        {/* Search */}
        <div className="relative w-full md:max-w-xs group">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 group-focus-within:text-[#1A766E]" />
          <input
            type="text"
            placeholder="Rechercher un article, un doc..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1A766E]/20 focus:border-[#1A766E] transition-all"
          />
        </div>

        {/* Date filters */}
        <div className="flex items-center gap-2 w-full md:w-auto">
          <Calendar className="w-4 h-4 text-gray-400 shrink-0" />
          <input type="date" value={dateDebut} onChange={e => setDateDebut(e.target.value)}
            className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1A766E]/20 focus:border-[#1A766E]" />
          <span className="text-gray-400 text-xs">→</span>
          <input type="date" value={dateFin} onChange={e => setDateFin(e.target.value)}
            className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1A766E]/20 focus:border-[#1A766E]" />
        </div>

        {/* Type filter tabs */}
        <div className="flex bg-gray-50 border border-gray-200 rounded-xl p-1">
          {['Tous', 'Entrées', 'Sorties'].map((tab) => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${activeTab === tab ? 'bg-white shadow-sm text-gray-900 border border-gray-200/50' : 'text-gray-500 hover:text-gray-700'}`}>
              {tab}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-gray-500">Chargement des mouvements...</div>
        ) : error ? (
          <div className="p-12 text-center text-red-500">{error}</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-600">
              <thead className="bg-gray-50 text-xs uppercase text-gray-500 font-semibold border-b border-gray-100">
                <tr>
                  <th className="px-5 py-4">Date</th>
                  <th className="px-5 py-4">Article</th>
                  <th className="px-5 py-4 text-center">Type</th>
                  <th className="px-5 py-4 text-right">Quantité</th>
                  <th className="px-5 py-4 text-center">Stock Avant → Après</th>
                  <th className="px-5 py-4">Motif</th>
                  <th className="px-5 py-4">Opérateur</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((m) => (
                  <tr key={m.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-5 py-4 whitespace-nowrap">
                      <p className="font-medium text-gray-900 text-xs">{new Date(m.date_mouvement).toLocaleDateString('fr-FR')}</p>
                      <p className="text-[10px] text-gray-400 font-mono">{m.reference_document || '—'}</p>
                    </td>
                    <td className="px-5 py-4">
                      <p className="font-semibold text-gray-900">{m.article?.designation || '—'}</p>
                      <p className="text-xs text-gray-400 font-mono">{m.article?.code}</p>
                    </td>
                    <td className="px-5 py-4 text-center">
                      {m.type === 'entree' ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-green-50 text-green-700">
                          <ArrowDownRight className="w-3 h-3" /> Entrée
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-50 text-red-700">
                          <ArrowUpRight className="w-3 h-3" /> Sortie
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <span className={`text-lg font-black ${m.type === 'entree' ? 'text-green-600' : 'text-red-500'}`}>
                        {m.type === 'entree' ? '+' : '-'}{m.quantite}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-center">
                      <span className="text-xs font-mono text-gray-500">
                        {m.stock_avant} → <span className="font-bold text-gray-900">{m.stock_apres}</span>
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-xs bg-gray-100 px-2 py-1 rounded-lg text-gray-600 font-medium">{m.motif}</span>
                    </td>
                    <td className="px-5 py-4 text-gray-500 text-xs">{m.user?.name || '—'}</td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr><td colSpan="7" className="px-6 py-10 text-center text-gray-400">Aucun mouvement trouvé.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {meta.last_page > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500">
            Page <span className="font-semibold">{meta.current_page}</span> sur <span className="font-semibold">{meta.last_page}</span>
            <span className="ml-2 text-gray-400">({meta.total} mouvements)</span>
          </p>
          <div className="flex gap-2">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={meta.current_page === 1}
              className="flex items-center gap-1 px-3 py-1.5 bg-white border border-gray-200 text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-sm">
              <ChevronLeft className="w-4 h-4" /> Précédent
            </button>
            <button onClick={() => setPage(p => Math.min(meta.last_page, p + 1))} disabled={meta.current_page === meta.last_page}
              className="flex items-center gap-1 px-3 py-1.5 bg-white border border-gray-200 text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-sm">
              Suivant <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
