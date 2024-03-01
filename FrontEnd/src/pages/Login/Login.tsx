import React from "react";
import { Container, TextField, Button, Typography } from "@mui/material";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const LoginPage: React.FC<any> = ({
  handleSubmit,
  handleEmailChange,
  email,
  handlePasswordChange,
  password,
}) => {
  return (
    <Container maxWidth="xs" style={{ background: "white" }}>
      <Typography variant="h4" component="h1" gutterBottom color={"primary"}>
        Login
      </Typography>
      <form onSubmit={handleSubmit}>
        <TextField
          margin="normal"
          required
          fullWidth
          id="email"
          label="Email Address"
          name="email"
          autoComplete="email"
          value={email}
          onChange={handleEmailChange}
        />
        <TextField
          margin="normal"
          required
          fullWidth
          id="password"
          label="Password"
          name="password"
          autoComplete="password"
          autoFocus
          value={password}
          onChange={handlePasswordChange}
        />

        <Button
          type="submit"
          fullWidth
          variant="contained"
          color="primary"
          sx={{ mt: 3, mb: 2 }}
        >
          Sign In
        </Button>
      </form>
    </Container>
  );
};

export default LoginPage;
