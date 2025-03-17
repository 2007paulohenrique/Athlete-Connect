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
import NotificationsPage from "./components/pages/NotificationsPage";
import NewQualification from "./components/pages/NewQualification";
import Places from "./components/pages/Places";
import NewPlace from "./components/pages/NewPlace";
import RecoverPassword from "./components/pages/RecoverPassword";

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
            path="/passwordRecover" 
            element={<RecoverPassword/>} 
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
            path="/places" 
            element={<Places/>} 
          />

          <Route 
            path="/places/new" 
            element={<NewPlace/>} 
          />

          <Route 
            path="/places/myPlaces" 
            element={<Places/>} 
          />

          <Route 
            path="/myProfile/newPost" 
            element={<NewPost/>} 
          />

          <Route 
            path="/myProfile/newQualification" 
            element={<NewQualification/>} 
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
            path="/myProfile/notifications" 
            element={<NotificationsPage/>} 
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
