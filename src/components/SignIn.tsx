import React, { useState } from "react";
import styled from "styled-components";
import axios from "axios";
import { toast } from "react-toastify";
import { useAuth } from "../store";
import { useNavigate } from "react-router-dom";
import { Spinner } from "./Spinner";

export const SignIn = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const { login } = useAuth();

  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleNavigateToSignUp = () => {
    navigate("/signUp");
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/users/login`,
        formData
      );
      login(response.data.user, response.data.accessToken);
      localStorage.setItem("accessToken", response.data.accessToken);
      setSubmitting(false);

      navigate("/");
    } catch (error: any) {
      setSubmitting(false);
      toast(error.response.data.message || "Sign in failed", { type: "error" });
    }
  };
  return (
    <SigninContainer>
      <ContentContainer>
        <h2>Signin</h2>
        <AuthForm onSubmit={handleSubmit}>
          <label htmlFor="email">Email:</label>
          <InputField
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
          />

          <label htmlFor="password">Password:</label>
          <InputField
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
          />
          <AuthButtonContainer>
            {submitting ? (
              <Spinner />
            ) : (
              <AuthButton type="submit">Sign in</AuthButton>
            )}
          </AuthButtonContainer>
        </AuthForm>
        <SubText>
          Don't have an account?{" "}
          <span onClick={handleNavigateToSignUp}>Signup</span>
        </SubText>
      </ContentContainer>
    </SigninContainer>
  );
};

const SigninContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: #1b1c24;
`;

export const ContentContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  max-width: 400px;
  padding: 20px;
  margin: auto;
  border: 1px solid #ccc;
  border-radius: 8px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  color: #fff;
`;

export const AuthForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

export const InputField = styled.input`
  height: 15px;
  padding: 5px;
  border: 1px solid #ccc;
  border-radius: 5px;
  font-size: 16px;
`;

export const AuthButton = styled.button`
  padding: 10px;
  background: #87ceeb;
  color: #fff;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 16px;
`;

export const AuthButtonContainer = styled.div`
  margin-top: 10px;
  display: flex;
  justify-content: center;
`;

export const SubText = styled.div`
  margin-top: 20px;
  display: flex;
  span {
    color: #87c;
    cursor: pointer;
  }
`;
