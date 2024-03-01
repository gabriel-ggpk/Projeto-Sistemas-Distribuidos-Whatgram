import React, { useState } from "react";
import Main from "./Login";
import { useNavigate } from "react-router-dom";
import api from "../../service/api";
const LoginPage: React.FC = () => {
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");

  const navigate = useNavigate();

  const handlePasswordChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(event.target.value);
  };

  const handleEmailChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(event.target.value);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault(); // Prevent the default form submission behavior
    // Pass the password and email to your function here
    const res = await api.post("/login", {
      password: password,
      email: email,
    });
    console.log(res.data);
    localStorage.setItem("token", res.data.token);
    localStorage.setItem("userId", res.data.userId);

    navigate("/messages");
  };

  return (
    <Main
      handlePasswordChange={handlePasswordChange}
      handleEmailChange={handleEmailChange}
      handleSubmit={handleSubmit}
      password={password}
      email={email}
    ></Main>
  );
};

export default LoginPage;
