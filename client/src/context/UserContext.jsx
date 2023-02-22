import axios from "axios";
import React, { useContext, useEffect, useState } from "react";

const UserContext = React.createContext();

export function useAuth() {
    return useContext(UserContext);
}
    

export default function UserContextProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setLoading(true);
      axios.get('/profile').then(({ data }) => {
        setUser(data);
        setLoading(false);
      })
    }
  }, []);

  return (
    <UserContext.Provider value={{ user, setUser, loading, setLoading }}>
      {children}
    </UserContext.Provider>
  );
}