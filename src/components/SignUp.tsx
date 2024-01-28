import { ChangeEvent, FormEvent, useState } from "react";
import styled from "styled-components";
import {
  AuthButton,
  AuthButtonContainer,
  AuthForm,
  ContentContainer,
  InputField,
  SubText,
} from "./SignIn";
import { Spinner } from "./Spinner";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

export const SignUp = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleNavigateToSignIn = () => {
    navigate("/signIn");
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setSubmitting(true);
    try {
      await axios.post(`${process.env.REACT_APP_API_URL}/users`, formData);
      toast("User created successfully", {
        type: "success",
      });
      setSubmitting(false);

      navigate("/signIn");
    } catch (error: any) {
      setSubmitting(false);
      toast(error.response.data.message || "Sign in failed", { type: "error" });
    }
  };

  return (
    <SignupContainer>
      <ContentContainer>
        <h2>Sign Up</h2>
        <AuthForm onSubmit={handleSubmit}>
          <label htmlFor="name">Name:</label>
          <InputField
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
          />

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
              <AuthButton type="submit">Sign up</AuthButton>
            )}
          </AuthButtonContainer>
        </AuthForm>
        <SubText>
          Already have an account?{" "}
          <span onClick={handleNavigateToSignIn}>Signin</span>
        </SubText>
      </ContentContainer>
    </SignupContainer>
  );
};

const SignupContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: #1b1c24;
`;
