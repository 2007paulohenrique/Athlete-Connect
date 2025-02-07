import Home from "./components/pages/Home";
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from "./components/pages/Login";
import EditProfile from "./components/pages/EditProfile";
import ProfilePreferences from "./components/pages/ProfilePreferences";
import NewPost from "./components/pages/NewPost";
import { ProfileProvider } from './ProfileContext';
import ErrorPage from "./components/pages/ErrorPage";
import Profile from "./components/pages/Profile";
import Config from "./components/pages/Config";
import SearchPage from "./components/pages/SearchPage";
import PostPage from "./components/pages/PostPage";

export const EXPIRATION_TIME = 24 * 60 * 60 * 1000;

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
            path="/errorPage" 
            element={<ErrorPage/>} 
          />

          <Route 
            path="/profile/:id" 
            element={<Profile/>} 
          />

          <Route 
            path="/post/:id" 
            element={<PostPage/>} 
          />

          <Route 
            path="/myProfile" 
            element={<Profile/>} 
          />

          <Route 
            path="/myProfile/config" 
            element={<Config/>} 
          />

          <Route 
            path="/search" 
            element={<SearchPage/>} 
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
