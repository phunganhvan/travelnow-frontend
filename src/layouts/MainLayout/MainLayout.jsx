import React from 'react';
import { Outlet } from 'react-router-dom';
import NavBar from '../../components/molecules/Navbar/Navbar';
import Chatbot from '../../components/organisms/Chatbot/Chatbot';

const MainLayout = () => {
  return (
    <div className="min-h-screen bg-slate-50">
      <NavBar />
      <main>
        <Outlet />
      </main>
      <Chatbot />
    </div>
  );
};

export default MainLayout;