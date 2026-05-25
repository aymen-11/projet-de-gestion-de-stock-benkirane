import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import useAuthStore from './store/authStore';
import AppLayout from './components/layout/AppLayout';
import RoleRoute from './components/layout/RoleRoute';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import ArticlesList from './pages/Articles/Index';
import ArticleForm from './pages/Articles/Form';
import AlertesList from './pages/Alertes/Index';
import Rapports from './pages/Rapports/Index';
import EntreeForm from './pages/Mouvements/EntreeForm';
import SortieForm from './pages/Mouvements/SortieForm';
import MouvementsList from './pages/Mouvements/Index';
import FournisseursList from './pages/Fournisseurs/Index';
import FournisseurForm from './pages/Fournisseurs/Form';
import CommandesList from './pages/Commandes/Index';
import CommandeForm from './pages/Commandes/Form';
import Parametres from './pages/Parametres/Index';
import UtilisateursList from './pages/Utilisateurs/Index';
import JournauxList from './pages/Journaux/Index';

const ProtectedRoute = ({ children }) => {
  const user = useAuthStore((state) => state.user);
  if (!user) return <Navigate to="/login" replace />;
  return children;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        
        <Route path="/" element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<RoleRoute roles={['admin', 'responsable', 'magasinier', 'fournisseur']}><Dashboard /></RoleRoute>} />
          
          <Route path="articles" element={<RoleRoute roles={['admin', 'responsable', 'magasinier', 'fournisseur']}><ArticlesList /></RoleRoute>} />
          <Route path="articles/create" element={<RoleRoute roles={['admin', 'responsable']}><ArticleForm /></RoleRoute>} />
          <Route path="articles/edit/:id" element={<RoleRoute roles={['admin', 'responsable']}><ArticleForm isEdit={true} /></RoleRoute>} />
          
          <Route path="entrees" element={<RoleRoute roles={['admin', 'responsable', 'magasinier']}><EntreeForm /></RoleRoute>} />
          <Route path="sorties" element={<RoleRoute roles={['admin', 'responsable', 'magasinier']}><SortieForm /></RoleRoute>} />
          <Route path="mouvements" element={<RoleRoute roles={['admin', 'responsable', 'magasinier']}><MouvementsList /></RoleRoute>} />
          <Route path="historique" element={<RoleRoute roles={['admin', 'responsable', 'magasinier']}><MouvementsList /></RoleRoute>} />
          
          <Route path="fournisseurs" element={<RoleRoute roles={['admin', 'responsable']}><FournisseursList /></RoleRoute>} />
          <Route path="fournisseurs/create" element={<RoleRoute roles={['admin', 'responsable']}><FournisseurForm /></RoleRoute>} />
          <Route path="fournisseurs/edit/:id" element={<RoleRoute roles={['admin', 'responsable']}><FournisseurForm isEdit={true} /></RoleRoute>} />
          
          <Route path="commandes" element={<RoleRoute roles={['admin', 'responsable', 'fournisseur']}><CommandesList /></RoleRoute>} />
          <Route path="commandes/create" element={<RoleRoute roles={['admin', 'responsable']}><CommandeForm /></RoleRoute>} />
          <Route path="commandes/edit/:id" element={<RoleRoute roles={['admin', 'responsable', 'fournisseur']}><CommandeForm isEdit={true} /></RoleRoute>} />
          
          <Route path="alertes" element={<RoleRoute roles={['admin', 'responsable', 'magasinier']}><AlertesList /></RoleRoute>} />
          <Route path="rapports" element={<RoleRoute roles={['admin', 'responsable']}><Rapports /></RoleRoute>} />
          <Route path="parametres" element={<RoleRoute roles={['admin', 'responsable', 'magasinier', 'fournisseur']}><Parametres /></RoleRoute>} />
          <Route path="utilisateurs" element={<RoleRoute roles={['admin']}><UtilisateursList /></RoleRoute>} />
          <Route path="journaux" element={<RoleRoute roles={['admin']}><JournauxList /></RoleRoute>} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
