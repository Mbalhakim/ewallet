import React, { Dispatch, SetStateAction, useState } from 'react';
import { createContext, useContext } from 'react';

type NavbarContextType = {
  navBarShown: boolean;
  setNavBarShown: Dispatch<SetStateAction<boolean>>;
};

const initialContext: NavbarContextType = {
  navBarShown: true,
  setNavBarShown: () => {}
};

const NavbarContext = createContext<NavbarContextType>(initialContext);

export const useNavBar = () => {
  const navbarContext = useContext(NavbarContext);
  return navbarContext;
};

export const NavBarProvider = ({ children }: { children: React.ReactNode }) => {
  const [navBarShown, setNavBarShown] = useState<boolean>(true);

  return (
    <NavbarContext.Provider
      value={{ navBarShown: navBarShown, setNavBarShown: setNavBarShown }}
    >
      {children}
    </NavbarContext.Provider>
  );
};
