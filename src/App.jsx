import React from 'react';
import RoutesConfig from './routes';
import { AuthProvider } from './context/AuthContext';

const App = () => {
  return (
    <AuthProvider>
      <RoutesConfig />
    </AuthProvider>
  );
};

export default App;