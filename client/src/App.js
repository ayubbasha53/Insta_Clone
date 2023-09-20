import React, { useEffect, createContext, useReducer, useContext } from "react";
import NavBar from "./Components/Navbar";
import "./App.css";
import {
  BrowserRouter,
  Router,
  Routes,
  Route,
  useNavigate,
} from "react-router-dom";
import Home from "./Components/Screens/Home";
import Login from "./Components/Screens/Login";
import Profile from "./Components/Screens/Profile";
import SignUp from "./Components/Screens/Signup";
import CreatePost from "./Components/Screens/Createpost";
import { reducer, initialState } from "./reducers/userReducer";
import UserProfile from "./Components/Screens/Userprofile";
import SubscribedUserPost from "./Components/Screens/SubscribedUserPost";

export const Usercontext = createContext();
const Routing = () => {
  const navigate = useNavigate();
  const { state, dispatch } = useContext(Usercontext);
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (user) {
      dispatch({ type: "USER", payload: user });
    } else {
      navigate("/login");
    }
  }, []);
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<SignUp />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/create" element={<CreatePost />} />
      <Route path="/profile/:userid" element={<UserProfile />} />
      <Route path="/myfollowerspost" element={<SubscribedUserPost />} />
    </Routes>
  );
};

function App() {
  const [state, dispatch] = useReducer(reducer, initialState);
  return (
    <Usercontext.Provider value={{ state, dispatch }}>
      <BrowserRouter>
        <NavBar />
        <Routing />
      </BrowserRouter>
    </Usercontext.Provider>
  );
}

export default App;
