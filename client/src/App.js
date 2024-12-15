import Home from "./components/pages/Home";
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from "./components/pages/Login";
import EditProfile from "./components/pages/EditProfile";
import ProfilePreferences from "./components/pages/ProfilePreferences";
import NewPost from "./components/pages/NewPost";
import { ProfileProvider } from './ProfileContext';

function App() {
  document.addEventListener('keydown', function(event) {
    if (event.key === 'Tab') {
        event.preventDefault(); 
    }
  });

  return (
    <ProfileProvider>
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
            path="/newPost" 
            element={<NewPost/>} 
          />

          <Route 
            exact
            path="/" 
            element={<Home/>} 
          />
        </Routes>
      </Router>
    </ProfileProvider>
  );
}

export default App;
