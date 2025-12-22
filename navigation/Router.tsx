import React from 'react';
import HomeStackNavigator from './HomeStackNavigator';
import AuthStackNavigator from './AuthStackNavigator';
import { useAuth } from '../context/AuthProvider';

/**
 * This component is used to display the correct stack navigator depending on
 * the login status of the user.
 * @returns A stack navigator depending on the login status of the user
 * @see AuthStackNavigator
 * @see HomeStackNavigator
 */
const Router = () => {
  const { isLoggedIn } = useAuth();
  return isLoggedIn ? <HomeStackNavigator /> : <AuthStackNavigator />;
};

export default Router;
