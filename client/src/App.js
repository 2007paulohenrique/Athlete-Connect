import Home from "./components/pages/Home";
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from "./components/pages/Login";
import EditProfile from "./components/pages/EditProfile";
import ProfilePreferences from "./components/pages/ProfilePreferences";

function App() {
  return (
    <Router>
      <Routes>
        <Route 
          path="/login" 
          element={<Login/>} 
        />

        <Route 
          path="/editProfile" 
          element={
            sessionStorage.getItem("profilesExists") &&
            sessionStorage.getItem("profile") 
              ? <EditProfile/> 
              : <Navigate to="/login"/>
          } 
        />
        
        <Route 
          path="/profilePreferences" 
          element={
            sessionStorage.getItem("profileReady") 
              ? <ProfilePreferences/> 
              : <Navigate to="/login"/>
          } 
        />
        
        <Route 
          path="/" 
          element={
            localStorage.getItem("profileId") 
              ? <Home/> 
              : <Navigate to="/login"/>
          } 
        />
      </Routes>
    </Router>
  );
}

export default App;