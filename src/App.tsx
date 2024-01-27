import React, { useEffect, useState } from "react";
import { AppContainer } from "./components";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { SignIn } from "./components/SignIn";
import { SignUp } from "./components/SignUp";
import "react-toastify/dist/ReactToastify.css";
import { ToastContainer } from "react-toastify";
import { useAuth } from "./store";
import { Spinner } from "./components/Spinner";
import styled from "styled-components";

function App() {
  const { user, setCurrentUser } = useAuth();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      setIsLoading(true);
      await setCurrentUser();
      setIsLoading(false);
    };

    fetchUserData();
  }, []);

  if (isLoading) {
    return (
      <LoadingContainer>
        <Spinner width="100px" height="100px" />
      </LoadingContainer>
    );
  }

  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={user ? <AppContainer /> : <Navigate to="/signIn" />}
        />
        <Route path="/signIn" element={user ? <AppContainer /> : <SignIn />} />

        <Route path="/signUp" element={user ? <AppContainer /> : <SignUp />} />
      </Routes>
      <ToastContainer />
    </Router>
  );
}

const LoadingContainer = styled.div`
  display: flex;
  height: 100vh;
  justify-content: center;
  align-items: center;
`;

export default App;
