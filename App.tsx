import * as React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import AuthProvider from './context/AuthProvider';
import { NavBarProvider } from './context/NavProvider';
import Linking from './Linking';
import Router from './navigation/Router';
import BottomBar from './navigation/BottomBar';

const App = () => {
  return (
    <NavBarProvider>
      <AuthProvider>
        <NavigationContainer linking={Linking}>
          <Router />
          <BottomBar />
        </NavigationContainer>
      </AuthProvider>
    </NavBarProvider>
  );
};
export default App;
