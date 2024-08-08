import { Navigate } from "react-router";

function PrivateRoute({ children}) {
    const token = localStorage.getItem('token');
    return token ? children : <Navigate to = '/'/>
}

export default PrivateRoute