import React from 'react';
import RoutesConfig from './routes';
import { AuthProvider } from './context/AuthContext';
import { BookingProvider } from './context/BookingContext';

const App = () => {
  return (
    <AuthProvider>
      <BookingProvider>
        <RoutesConfig />
      </BookingProvider>
    </AuthProvider>
  );
};

export default App;