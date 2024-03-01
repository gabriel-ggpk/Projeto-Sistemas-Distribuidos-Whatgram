import React, { useState } from "react";
import Main from "./Register";
import { useNavigate } from "react-router-dom";
import api from "../../service/api";
const RegisterPage: React.FC = () => {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleFullNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFullName(event.target.value);
  };

  const handleEmailChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(event.target.value);
  };

  const handlePasswordChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(event.target.value);
  };

  const handleConfirmPasswordChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setConfirmPassword(event.target.value);
  };
  const navigate = useNavigate(); // Initialize useNavigate at the top of your component function

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    // Here, add your logic for registration (e.g., form validation, API request)
    // For demonstration, we'll assume the registration is successful and redirect
    try {
      api.post("/register", {
        username: fullName,
        email: email,
        password: password,
      });

      navigate("/");
    } catch (error) {
      alert(error);
    }
  };

  return (
    <Main
      handleSubmit={handleSubmit}
      handleFullNameChange={handleFullNameChange}
      handleEmailChange={handleEmailChange}
      handlePasswordChange={handlePasswordChange}
      handleConfirmPasswordChange={handleConfirmPasswordChange}
      fullName={fullName}
      email={email}
      password={password}
      confirmPassword={confirmPassword}
    ></Main>
  );
};

export default RegisterPage;
