import React from "react";
import LoginPage from "./pages/Login";
import { Route, Routes, BrowserRouter } from "react-router-dom";
import RegisterPage from "./pages/Register";
import MessagesPage from "./pages/Messages";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/register" element={<RegisterPage />}></Route>
        <Route path="/" element={<LoginPage />}></Route>
        <Route path="/messages" element={<MessagesPage />}></Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
