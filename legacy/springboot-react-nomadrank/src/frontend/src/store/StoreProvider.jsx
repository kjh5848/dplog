import { createContext, useContext } from "react";
import PropTypes from "prop-types";
import AuthStore from "/src/store/AuthStore.jsx";
import UtilStore from "/src/store/UtilStore.jsx";

const StoreContext = createContext(undefined);

StoreProvider.propTypes = {
  children: PropTypes.node.isRequired
};

export function StoreProvider({ children }) {
  return (
    <StoreContext.Provider
      value={{
        authStore: AuthStore(),
        utilStore: UtilStore()
      }}
    >
      {children}
    </StoreContext.Provider>
  );
}

export const useAuthStore = () => useContext(StoreContext).authStore;
export const useUtilStore = () => useContext(StoreContext).utilStore;