// utils/ProtectedRoute.js
import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { checkAuthStatus } from './auth';

const ProtectedRoute = ({ children }) => {
  const [auth, setAuth] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const verifyAuth = async () => {
      const authenticated = await checkAuthStatus();
      setAuth(authenticated);
      setLoading(false);
    };
    verifyAuth();
  }, []);

  if (loading) return <div>Loading...</div>;
  return auth ? children : <Navigate to="/login" />;
};
export default ProtectedRoute;












// import React, { useEffect, useState } from 'react';
// import { Navigate } from 'react-router-dom';
// import { checkAuthStatus } from './auth';

// const ProtectedRoute = ({ children }) => {
//   const [auth, setAuth] = useState(false);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     const verifyAuth = async () => {
//       const authenticated = await checkAuthStatus();
//       setAuth(authenticated);
//       setLoading(false);
//     };
//     verifyAuth();
//   }, []);

//   if (loading) return <div>Loading...</div>;
//   return auth ? children : <Navigate to="/login" />;
// };

// export default ProtectedRoute;