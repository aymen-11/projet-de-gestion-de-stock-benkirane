import { useState } from 'react';
import { Save, User, Building, Bell, Shield, Key, Check, Loader } from 'lucide-react';
import useAuthStore from '../../store/authStore';
import api from '../../lib/axios';

const GREEN = '#1A766E';

function Toast({ message, type = 'success' }) {
  return (
    <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3 rounded-2xl shadow-2xl text-white text-sm font-semibold
      ${type === 'success' ? 'bg-[#1A766E]' : 'bg-red-500'}`}>
      {type === 'success' ? <Check className="w-4 h-4"/> : null}
      {message}
    </div>
  );
}

export default function Parametres() {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState('profil');
  const [toast, setToast] = useState(null);
  const [saving, setSaving] = useState(false);

  // Profile form state
  const [name, setName]   = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');

  // Password form state
  const [currentPw, setCurrentPw]   = useState('');
  const [newPw, setNewPw]           = useState('');
  const [confirmPw, setConfirmPw]   = useState('');

  // Notifications state
  const [notifs, setNotifs] = useState({
    stock_critique: true,
    nouvelles_commandes: true,
    mouvements: false,
    rapports: true,
  });

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const saveProfile = async () => {
    if (!name.trim() || !email.trim()) {
      showToast('Veuillez remplir tous les champs', 'error'); return;
    }
    setSaving(true);
    try {
      await api.put('/user/profile', { name, email });
      showToast('Profil mis à jour avec succès');
    } catch (e) {
      showToast('Erreur lors de la mise à jour', 'error');
    } finally {
      setSaving(false);
    }
  };

  const savePassword = async () => {
    if (!currentPw || !newPw || !confirmPw) {
      showToast('Veuillez remplir tous les champs', 'error'); return;
    }
    if (newPw !== confirmPw) {
      showToast('Les mots de passe ne correspondent pas', 'error'); return;
    }
    if (newPw.length < 8) {
      showToast('Le mot de passe doit contenir au moins 8 caractères', 'error'); return;
    }
    setSaving(true);
    try {
      await api.put('/user/password', {
        current_password: currentPw,
        password: newPw,
        password_confirmation: confirmPw,
      });
      showToast('Mot de passe mis à jour avec succès');
      setCurrentPw(''); setNewPw(''); setConfirmPw('');
    } catch (e) {
      showToast(e.response?.data?.message || 'Mot de passe actuel incorrect', 'error');
    } finally {
      setSaving(false);
    }
  };

  const saveNotifs = () => {
    showToast('Préférences de notifications sauvegardées');
  };

  const TABS = [
    { id: 'profil',        label: 'Mon Profil',      icon: User   },
    { id: 'notifications', label: 'Notifications',   icon: Bell   },
    { id: 'securite',      label: 'Sécurité',        icon: Shield },
    { id: 'entreprise',    label: 'Entreprise',      icon: Building },
  ];

  const inputCls = "w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:border-[#1A766E] transition-all";

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {toast && <Toast message={toast.msg} type={toast.type}/>}

      <div>
        <h1 className="text-2xl font-bold text-gray-900">Mon Profil & Paramètres</h1>
        <p className="text-sm text-gray-500 mt-1">Gérez votre profil et les préférences de l'application.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Sidebar */}
        <div className="w-full md:w-56 shrink-0 space-y-1">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                activeTab === id
                  ? 'bg-[#E8F5F3] text-[#1A766E] shadow-sm'
                  : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'
              }`}
            >
              <Icon className="w-4 h-4"/>
              {label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 bg-white rounded-3xl shadow-sm border border-gray-100 p-8">

          {/* ── Profil ── */}
          {activeTab === 'profil' && (
            <div className="space-y-6">
              <h2 className="text-lg font-bold text-gray-900 border-b border-gray-100 pb-4">Informations personnelles</h2>

              {/* Avatar */}
              <div className="flex items-center gap-5 mb-2">
                <div className="w-16 h-16 rounded-full flex items-center justify-center text-white font-black text-2xl shadow-md"
                  style={{ background: 'linear-gradient(135deg,#0A3D39,#1A766E)' }}>
                  {name?.charAt(0)?.toUpperCase() || 'U'}
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-900">{name || 'Utilisateur'}</p>
                  <p className="text-xs text-gray-400 capitalize">{user?.role || 'admin'}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Nom complet</label>
                  <input type="text" value={name} onChange={e => setName(e.target.value)} className={inputCls}/>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Adresse Email</label>
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)} className={inputCls}/>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Rôle</label>
                  <input type="text" value={user?.role || 'admin'} disabled
                    className="w-full px-4 py-2.5 bg-gray-100 border border-gray-200 rounded-xl text-sm text-gray-500 cursor-not-allowed capitalize"/>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-100 flex justify-end">
                <button onClick={saveProfile} disabled={saving}
                  className="px-6 py-2.5 bg-[#1A766E] text-white rounded-xl text-sm font-bold hover:bg-[#0A5C53] transition-colors shadow-sm flex items-center gap-2 disabled:opacity-60">
                  {saving ? <Loader className="w-4 h-4 animate-spin"/> : <Save className="w-4 h-4"/>}
                  Enregistrer
                </button>
              </div>
            </div>
          )}

          {/* ── Notifications ── */}
          {activeTab === 'notifications' && (
            <div className="space-y-6">
              <h2 className="text-lg font-bold text-gray-900 border-b border-gray-100 pb-4">Préférences de notifications</h2>

              <div className="space-y-4">
                {[
                  { key: 'stock_critique',       label: 'Stock critique',        desc: 'Alertes quand un article atteint le seuil minimum' },
                  { key: 'nouvelles_commandes',   label: 'Nouvelles commandes',   desc: 'Notification à chaque nouvelle commande créée' },
                  { key: 'mouvements',            label: 'Mouvements de stock',   desc: 'Entrées et sorties de stock en temps réel' },
                  { key: 'rapports',              label: 'Rapports hebdomadaires',desc: 'Résumé automatique chaque lundi matin' },
                ].map(({ key, label, desc }) => (
                  <div key={key} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100">
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{label}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{desc}</p>
                    </div>
                    <button
                      onClick={() => setNotifs(n => ({ ...n, [key]: !n[key] }))}
                      className={`w-12 h-6 rounded-full relative transition-colors duration-200 ${notifs[key] ? 'bg-[#1A766E]' : 'bg-gray-200'}`}
                    >
                      <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${notifs[key] ? 'left-6' : 'left-0.5'}`}/>
                    </button>
                  </div>
                ))}
              </div>

              <div className="pt-4 border-t border-gray-100 flex justify-end">
                <button onClick={saveNotifs}
                  className="px-6 py-2.5 bg-[#1A766E] text-white rounded-xl text-sm font-bold hover:bg-[#0A5C53] transition-colors shadow-sm flex items-center gap-2">
                  <Save className="w-4 h-4"/> Enregistrer
                </button>
              </div>
            </div>
          )}

          {/* ── Sécurité ── */}
          {activeTab === 'securite' && (
            <div className="space-y-6">
              <h2 className="text-lg font-bold text-gray-900 border-b border-gray-100 pb-4">Sécurité du compte</h2>

              <div className="space-y-4 max-w-md">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Mot de passe actuel</label>
                  <input type="password" value={currentPw} onChange={e => setCurrentPw(e.target.value)}
                    placeholder="••••••••" className={inputCls}/>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Nouveau mot de passe</label>
                  <input type="password" value={newPw} onChange={e => setNewPw(e.target.value)}
                    placeholder="••••••••" className={inputCls}/>
                  {newPw && newPw.length < 8 && (
                    <p className="text-xs text-red-500 mt-1">Minimum 8 caractères</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Confirmer le mot de passe</label>
                  <input type="password" value={confirmPw} onChange={e => setConfirmPw(e.target.value)}
                    placeholder="••••••••" className={inputCls}/>
                  {confirmPw && confirmPw !== newPw && (
                    <p className="text-xs text-red-500 mt-1">Les mots de passe ne correspondent pas</p>
                  )}
                </div>
              </div>

              <div className="pt-4 border-t border-gray-100 flex justify-end">
                <button onClick={savePassword} disabled={saving}
                  className="px-6 py-2.5 bg-[#1A766E] text-white rounded-xl text-sm font-bold hover:bg-[#0A5C53] transition-colors shadow-sm flex items-center gap-2 disabled:opacity-60">
                  {saving ? <Loader className="w-4 h-4 animate-spin"/> : <Key className="w-4 h-4"/>}
                  Mettre à jour le mot de passe
                </button>
              </div>
            </div>
          )}

          {/* ── Entreprise ── */}
          {activeTab === 'entreprise' && (
            <div className="space-y-6">
              <h2 className="text-lg font-bold text-gray-900 border-b border-gray-100 pb-4">Informations entreprise</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Nom de l'entreprise</label>
                  <input type="text" defaultValue="StockPro SARL" className={inputCls}/>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Secteur d'activité</label>
                  <input type="text" defaultValue="Gestion de stock" className={inputCls}/>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email de contact</label>
                  <input type="email" defaultValue="contact@stockpro.ma" className={inputCls}/>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Téléphone</label>
                  <input type="tel" defaultValue="+212 6 00 00 00 00" className={inputCls}/>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Adresse</label>
                  <input type="text" defaultValue="Casablanca, Maroc" className={inputCls}/>
                </div>
              </div>
              <div className="pt-4 border-t border-gray-100 flex justify-end">
                <button onClick={() => showToast('Informations entreprise sauvegardées')}
                  className="px-6 py-2.5 bg-[#1A766E] text-white rounded-xl text-sm font-bold hover:bg-[#0A5C53] transition-colors shadow-sm flex items-center gap-2">
                  <Save className="w-4 h-4"/> Enregistrer
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
