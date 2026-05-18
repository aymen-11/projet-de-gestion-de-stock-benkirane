import { useState } from 'react';
import { Save, X, Building, Mail, Phone, MapPin, CheckCircle } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

export default function FournisseurForm({ isEdit = false }) {
  const navigate = useNavigate();
  const [isSaved, setIsSaved] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSaved(true);
    setTimeout(() => {
      navigate('/fournisseurs');
    }, 1500);
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
          <button onClick={handleSubmit} className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors shadow-sm shadow-primary/30 flex items-center gap-2">
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

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden p-8">
        <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider border-b border-gray-100 pb-3 mb-6">Informations principales</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Nom de l'entreprise *</label>
            <div className="relative">
              <Building className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <input type="text" required className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" placeholder="Ex: Global Logistix" defaultValue={isEdit ? "Global Logistix" : ""} />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Email de contact</label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <input type="email" className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" placeholder="contact@entreprise.com" defaultValue={isEdit ? "contact@globallogistix.com" : ""} />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Téléphone</label>
            <div className="relative">
              <Phone className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <input type="text" className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" placeholder="+212 500 000 000" defaultValue={isEdit ? "+212 522 00 11 22" : ""} />
            </div>
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Adresse</label>
            <div className="relative">
              <MapPin className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <input type="text" className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" placeholder="Adresse complète" defaultValue={isEdit ? "123 Zone Industrielle, Sidi Maarouf" : ""} />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Ville</label>
            <input type="text" className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" placeholder="Ville" defaultValue={isEdit ? "Casablanca" : ""} />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Pays</label>
            <input type="text" className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" placeholder="Pays" defaultValue={isEdit ? "Maroc" : "Maroc"} />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Notes ou Remarques</label>
            <textarea rows="3" className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none" placeholder="Conditions de paiement, délais moyens..."></textarea>
          </div>
        </div>
      </form>
    </div>
  );
}
