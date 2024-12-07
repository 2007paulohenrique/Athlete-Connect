import Home from "./components/pages/Home";
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
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
          element={<EditProfile/>} 
        />

        <Route 
          path="/profilePreferences" 
          element={<ProfilePreferences/>} 
        />

        <Route 
          path="/" 
          element={<Home/>} 
        />
      </Routes>
    </Router>
  );
}

export default App;
