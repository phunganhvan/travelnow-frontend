import React from 'react';
import { Outlet } from 'react-router-dom';
import NavBar from '../../components/molecules/NavBar/NavBar';

const MainLayout = () => {
  return (
    <div className="min-h-screen bg-slate-50">
      <NavBar />
      <main>
        <Outlet />
      </main>
    </div>
  );
};

export default MainLayout;