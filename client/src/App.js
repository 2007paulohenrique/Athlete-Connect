import Home from "./components/pages/Home";
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from "./components/pages/Login";
import EditProfile from "./components/pages/EditProfile";

function App() {
  return (
    <Router>
      <Routes>
        <Route exact path="/" element={<Login/>}/>
        <Route path="/home" element={<Home/>}/>
        <Route path="/editProfile" element={<EditProfile/>}/>
      </Routes>
    </Router>
  );
}

export default App;