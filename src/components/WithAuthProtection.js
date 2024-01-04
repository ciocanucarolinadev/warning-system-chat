import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { auth } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";

const withAuthProtection = (WrappedComponent) => {
  return (props) => {
    const [authenticated, setAuthenticated] = useState(false);
    const [user, setUser] = useState({});

    useEffect(() => {
      const unsubscribe = onAuthStateChanged(auth, (user) => {
        if (user) {
          if(user?.email?.includes('admin')) {
            localStorage.setItem('isAdmin', true);
          } else {
            localStorage.removeItem('isAdmin');
          }

          setUser(user);
          setAuthenticated(true);
        } else {
          setUser({});
          setAuthenticated(false);
        }
      });

      return () => unsubscribe();
    }, []);

    if (authenticated || localStorage.getItem("accessToken")) {
      return <WrappedComponent {...props} user={user} />;
    }

    return <Navigate to="/login" />;
  };
};

export default withAuthProtection;
