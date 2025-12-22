import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  Dispatch,
  SetStateAction
} from 'react';
import { StorageKeyEnums } from '../constants/const';
import { Authdata } from '../util/DataTypes';
import { getData, storeData } from '../util/EncryptedStorage';

type AuthContextType = {
  isLoggedIn: boolean;
  setIsLoggedIn: Dispatch<SetStateAction<boolean>>;
  authData: Authdata | null;
  setAuthData: Dispatch<SetStateAction<Authdata | null>>;
  logout: () => Promise<void>;
  checkUserRegistered: () => Promise<void>;
  userRegistered: boolean;
  setUserRegistered: Dispatch<SetStateAction<boolean>>;
};

const defaultAuthContext = {
  isLoggedIn: false,
  setIsLoggedIn: () => {},
  authData: null,
  setAuthData: () => {},
  logout: async () => {},
  checkUserRegistered: async () => {},
  userRegistered: false,
  setUserRegistered: () => {}
};

const AuthContext = createContext<AuthContextType>(defaultAuthContext);

/**
 * This 'component' is used to provide the authentication context to the app.
 * It is used to store the authentication data and the login status.
 * Additionally, it provides a way to store VCs in the encrypted storage.
 */
const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [authData, setAuthData] = useState<Authdata | null>(null);
  const [userRegistered, setUserRegistered] = useState<boolean>(false);

  useEffect(() => {
    loadUserData(setIsLoggedIn, setAuthData).catch((error) =>
      console.warn(error)
    );
    checkUserRegistered();
  }, []);

  const logout = async (): Promise<void> => {
    try {
      const data = await getData(StorageKeyEnums.AUTH_DATA);
      // Clear the stored authentication data and update the state
      let newAuthData: Authdata = { ...data, isLoggedIn: false };
      await storeData(StorageKeyEnums.AUTH_DATA, newAuthData);
      setAuthData(newAuthData);
      setIsLoggedIn(false);
    } catch (error) {
      console.warn(error);
    }
  };

  const checkUserRegistered = async () => {
    getData(StorageKeyEnums.AUTH_DATA)
      .then((data) =>
        setUserRegistered(Object.keys(data).length > 0 ? true : false)
      )
      .catch((_e) => setUserRegistered(false));
  };

  return (
    <AuthContext.Provider
      value={{
        isLoggedIn,
        setIsLoggedIn,
        authData,
        setAuthData,
        logout,
        checkUserRegistered,
        setUserRegistered,
        userRegistered
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

/* This function is used to load the authentication data from the encrypted storage */
const loadUserData = async (setIsLoggedIn, setAuthData): Promise<void> => {
  try {
    const authData = await getData(StorageKeyEnums.AUTH_DATA);
    setAuthData(authData);
    setIsLoggedIn(authData.isLoggedIn);
  } catch (error) {
    console.warn(error);
  }
};

export const useAuth = () => useContext(AuthContext);

export default AuthProvider;
