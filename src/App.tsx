import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import { useEffect } from "react";
import ItemList from "@/pages/ItemList";
import ItemDetail from "@/pages/ItemDetail";
import ItemEditor from "@/pages/ItemEditor";
import Categories from "@/pages/Categories";
import Locations from "@/pages/Locations";
import Settings from "@/pages/Settings";
import { BottomNav } from "@/components/BottomNav";
import { seedInitialData } from "@/db";

function AppContent() {
  const location = useLocation();
  const showBottomNav = ['/', '/categories', '/locations', '/settings'].includes(location.pathname);

  useEffect(() => {
    seedInitialData();
  }, []);

  return (
    <div className="min-h-screen bg-stone-50">
      <Routes>
        <Route path="/" element={<ItemList />} />
        <Route path="/item/:id" element={<ItemDetail />} />
        <Route path="/item/new" element={<ItemEditor />} />
        <Route path="/item/:id/edit" element={<ItemEditor />} />
        <Route path="/categories" element={<Categories />} />
        <Route path="/locations" element={<Locations />} />
        <Route path="/settings" element={<Settings />} />
      </Routes>
      {showBottomNav && <BottomNav />}
    </div>
  );
}

export default function App() {
  return (
    <Router basename="/ctorage-manager">
      <AppContent />
    </Router>
  );
}
