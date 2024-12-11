import Home from "./components/pages/Home";
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from "./components/pages/Login";
import EditProfile from "./components/pages/EditProfile";
import ProfilePreferences from "./components/pages/ProfilePreferences";
import NewPost from "./components/pages/NewPost";

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
          path="/NewPost" 
          element={<NewPost/>} 
        />

        <Route 
          exact
          path="/" 
          element={<Home/>} 
        />
      </Routes>
    </Router>
  );
}

export default App;
