import { createContext, useContext, useEffect, useState } from "react";
import { getConfigData } from "../_services/config";

const AuthContext = createContext({})

export const AuthProvider = ({ children }) => {
  const [configData, setConfigData] = useState(null);
  const [isDriveConnected, setIsDriveConnected] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [isContextLoaded, setIsContextLoaded] = useState(false);

  useEffect(() => {
    getConfigurationData()
  }, [])


  async function getConfigurationData() {
    const res = await getConfigData();
    setIsContextLoaded(true)
    if (res.status) {
      setConfigData(res.data);
      const data = res.data
      if (data.cloud_type == 1) {
        if (data.is_connect) {
          setIsDriveConnected(true);
        } else {
          setIsDriveConnected(false);
        }
      }
      if (data.is_connect) {
        setIsLoggedIn(true);
      } else {
        setIsLoggedIn(false);
      }
    }
  }



  return (
    <>
      <AuthContext.Provider value={{ isDriveConnected, configData, setConfigData, setIsDriveConnected,
          isLoggedIn, setIsLoggedIn, isContextLoaded, setIsContextLoaded }}>
        {children}
      </AuthContext.Provider>
    </>
  )

}

export const useAuthContext = () => useContext(AuthContext);

