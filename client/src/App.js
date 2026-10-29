
import React, {
  createContext,
  useEffect,
  useReducer,
  useContext,
  useState,
} from "react";

import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
} from "react-router-dom";

import NavBar from "./Components/Navbar";
import Home from "./Components/Screens/Home";
import Login from "./Components/Screens/Login";
import Profile from "./Components/Screens/Profile";
import SignUp from "./Components/Screens/Signup";
import CreatePost from "./Components/Screens/Createpost";
import UserProfile from "./Components/Screens/Userprofile";
import SubscribedUserPost from "./Components/Screens/SubscribedUserPost";

import { reducer, initialState } from "./reducers/userReducer";

import "./App.css";

export const Usercontext = createContext();

function ProtectedRoute({ children }) {
  const { state } = useContext(Usercontext);

  if (!state || !localStorage.getItem("jwt")) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

function Routing() {
  const { state, dispatch } = useContext(Usercontext);
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("jwt");
    const savedUser = localStorage.getItem("user");

    if (token && savedUser) {
      try {
        const user = JSON.parse(savedUser);
        dispatch({ type: "USER", payload: user });
      } catch (error) {
        localStorage.removeItem("jwt");
        localStorage.removeItem("user");
      }
    }

    setCheckingAuth(false);
  }, [dispatch]);

  if (checkingAuth) {
    return <div className="app-loading">Loading application...</div>;
  }

  return (
    <Routes>
      <Route
        path="/login"
        element={state ? <Navigate to="/" replace /> : <Login />}
      />

      <Route
        path="/signup"
        element={state ? <Navigate to="/" replace /> : <SignUp />}
      />

      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Home />
          </ProtectedRoute>
        }
      />

      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        }
      />

      <Route
        path="/create"
        element={
          <ProtectedRoute>
            <CreatePost />
          </ProtectedRoute>
        }
      />

      <Route
        path="/profile/:userid"
        element={
          <ProtectedRoute>
            <UserProfile />
          </ProtectedRoute>
        }
      />

      <Route
        path="/myfollowerspost"
        element={
          <ProtectedRoute>
            <SubscribedUserPost />
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

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
