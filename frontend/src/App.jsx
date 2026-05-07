import { useContext } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthContext } from './context/AuthContext';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import Dashboard from './pages/Dashboard';
import MealsPage from './pages/MealsPage';
import RecipesPage from './pages/RecipesPage';
import ShoppingPage from './pages/ShoppingPage';
import AppLayout from './layouts/AppLayout';

const App = () => {
  const { token } = useContext(AuthContext);

  return (
    <Routes>
      {!token ? (
        <>
          <Route path="/" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="*" element={<Navigate to="/" />} />
        </>
      ) : (
        <Route element={<AppLayout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/meals" element={<MealsPage />} />
          <Route path="/recipes" element={<RecipesPage />} />
          <Route path="/shopping" element={<ShoppingPage />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Route>
      )}
    </Routes>
  );
};

export default App;
