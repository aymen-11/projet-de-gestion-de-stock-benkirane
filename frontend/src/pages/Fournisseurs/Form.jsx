import { useState, useEffect } from 'react';
import { Save, X, Building, Mail, Phone, MapPin, CheckCircle } from 'lucide-react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import api from '../../lib/axios';

const MOROCCAN_CITIES = [
  "Casablanca", "Rabat", "Marrakech", "Fès", "Tanger", 
  "Agadir", "Meknès", "Oujda", "Kenitra", "Tetouan", 
  "Safi", "Mohammedia", "Khouribga", "Beni Mellal", "El Jadida",
  "Nador", "Taza", "Settat", "Salé", "Laâyoune", "Dakhla"
];

export default function FournisseurForm({ isEdit = false }) {
  const navigate = useNavigate();
  const { id } = useParams();
  const [isSaved, setIsSaved] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Form states
  const [nom, setNom] = useState('');
  const [email, setEmail] = useState('');
  const [telephone, setTelephone] = useState('');
  const [adresse, setAdresse] = useState('');
  const [ville, setVille] = useState('');
  const [pays, setPays] = useState('Maroc');
  const [notes, setNotes] = useState('');

  // Fetch existing fournisseur if editing
  useEffect(() => {
    if (isEdit && id) {
      const fetchFournisseur = async () => {
        try {
          setLoading(true);
          const res = await api.get(`/fournisseurs/${id}`);
          const fournisseur = res.data;
          setNom(fournisseur.nom || '');
          setEmail(fournisseur.email || '');
          setTelephone(fournisseur.telephone || '');
          setAdresse(fournisseur.adresse || '');
          setVille(fournisseur.ville || '');
          setPays(fournisseur.pays || 'Maroc');
          setNotes(fournisseur.notes || '');
        } catch (err) {
          setError("Erreur lors du chargement du fournisseur.");
        } finally {
          setLoading(false);
        }
      };
      fetchFournisseur();
    }
  }, [isEdit, id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);

      const payload = {
        nom,
        email,
        telephone,
        adresse,
        ville,
        pays,
        notes
      };

      if (isEdit) {
        await api.put(`/fournisseurs/${id}`, payload);
      } else {
        await api.post('/fournisseurs', payload);
      }

      setIsSaved(true);
      setTimeout(() => {
        navigate('/fournisseurs');
      }, 1500);
    } catch (err) {
      const msg = err.response?.data?.message || "Erreur lors de la sauvegarde.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
            <Link to="/fournisseurs" className="hover:text-primary transition-colors">Fournisseurs</Link>
            <span>/</span>
            <span className="text-gray-900 font-medium">{isEdit ? 'Modifier' : 'Nouveau'} Fournisseur</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">{isEdit ? 'Modifier le fournisseur' : 'Ajouter un fournisseur'}</h1>
        </div>
        <div className="flex gap-3">
          <Link to="/fournisseurs" className="px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors shadow-sm flex items-center gap-2">
            <X className="w-4 h-4" /> Annuler
          </Link>
          <button 
            type="submit"
            form="fournisseur-form"
            disabled={loading}
            className="px-4 py-2 bg-[#1A766E] text-white rounded-lg text-sm font-medium hover:bg-[#0A5C53] transition-colors shadow-sm flex items-center gap-2 disabled:opacity-50"
          >
            <Save className="w-4 h-4" /> Enregistrer
          </button>
        </div>
      </div>

      {isSaved && (
        <div className="bg-green-50 text-green-800 border border-green-200 p-4 rounded-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-4">
          <CheckCircle className="w-5 h-5 text-green-600" />
          <p className="text-sm font-medium">Le fournisseur a été enregistré avec succès.</p>
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-50 text-red-700 border border-red-200 rounded-xl text-sm font-medium">
          {error}
        </div>
      )}

      <form id="fournisseur-form" onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden p-8">
        <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider border-b border-gray-100 pb-3 mb-6">Informations principales</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Nom de l'entreprise *</label>
            <div className="relative">
              <Building className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <input 
                type="text" 
                required 
                value={nom}
                onChange={(e) => setNom(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1A766E]/20 focus:border-[#1A766E] transition-all text-gray-900" 
                placeholder="Ex: Global Logistix" 
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Email de contact</label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1A766E]/20 focus:border-[#1A766E] transition-all text-gray-900" 
                placeholder="contact@entreprise.com" 
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Téléphone</label>
            <div className="relative">
              <Phone className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <input 
                type="text" 
                value={telephone}
                onChange={(e) => setTelephone(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1A766E]/20 focus:border-[#1A766E] transition-all text-gray-900" 
                placeholder="+212 500 000 000" 
              />
            </div>
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Adresse</label>
            <div className="relative">
              <MapPin className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <input 
                type="text" 
                value={adresse}
                onChange={(e) => setAdresse(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1A766E]/20 focus:border-[#1A766E] transition-all text-gray-900" 
                placeholder="Adresse complète" 
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Ville</label>
            <input 
              type="text" 
              list="moroccan-cities"
              value={ville}
              onChange={(e) => setVille(e.target.value)}
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1A766E]/20 focus:border-[#1A766E] transition-all text-gray-900" 
              placeholder="Sélectionner ou saisir une ville..." 
            />
            <datalist id="moroccan-cities">
              {MOROCCAN_CITIES.map(c => (
                <option key={c} value={c} />
              ))}
            </datalist>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Pays</label>
            <input 
              type="text" 
              value={pays}
              onChange={(e) => setPays(e.target.value)}
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1A766E]/20 focus:border-[#1A766E] transition-all text-gray-900" 
              placeholder="Pays" 
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Notes ou Remarques</label>
            <textarea 
              rows="3" 
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1A766E]/20 focus:border-[#1A766E] transition-all resize-none text-gray-900" 
              placeholder="Conditions de paiement, délais moyens..."
            />
          </div>
        </div>
      </form>
    </div>
  );
}
