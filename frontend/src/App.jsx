import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import useAuthStore from './store/authStore';
import AppLayout from './components/layout/AppLayout';
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
          <Route path="dashboard" element={<Dashboard />} />
          
          <Route path="articles" element={<ArticlesList />} />
          <Route path="articles/create" element={<ArticleForm />} />
          <Route path="articles/edit/:id" element={<ArticleForm isEdit={true} />} />
          
          <Route path="entrees" element={<EntreeForm />} />
          <Route path="sorties" element={<SortieForm />} />
          <Route path="mouvements" element={<MouvementsList />} />
          
          <Route path="fournisseurs" element={<FournisseursList />} />
          <Route path="fournisseurs/create" element={<FournisseurForm />} />
          <Route path="fournisseurs/edit/:id" element={<FournisseurForm isEdit={true} />} />
          
          <Route path="commandes" element={<CommandesList />} />
          <Route path="commandes/create" element={<CommandeForm />} />
          <Route path="commandes/edit/:id" element={<CommandeForm isEdit={true} />} />
          
          <Route path="alertes" element={<AlertesList />} />
          <Route path="rapports" element={<Rapports />} />
          <Route path="parametres" element={<Parametres />} />
          <Route path="utilisateurs" element={<UtilisateursList />} />
          <Route path="journaux" element={<JournauxList />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
