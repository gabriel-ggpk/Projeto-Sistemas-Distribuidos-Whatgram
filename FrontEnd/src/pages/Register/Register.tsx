import React from "react";
import { Container, TextField, Button, Typography } from "@mui/material";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const RegistrationPage: React.FC<any> = ({
  fullName,
  email,
  password,
  handleFullNameChange,
  handleEmailChange,
  handlePasswordChange,
  handleSubmit,
}) => {
  return (
    <Container maxWidth="xs">
      <Typography variant="h4" component="h1" gutterBottom>
        Register
      </Typography>
      <form noValidate autoComplete="off" onSubmit={handleSubmit}>
        <TextField
          margin="normal"
          required
          fullWidth
          id="fullName"
          label="Full Name"
          name="fullName"
          autoFocus
          value={fullName}
          onChange={handleFullNameChange}
        />
        <TextField
          margin="normal"
          required
          fullWidth
          id="email"
          label="Email Address"
          name="email"
          value={email}
          onChange={handleEmailChange}
        />
        <TextField
          margin="normal"
          required
          fullWidth
          name="password"
          label="Password"
          type="password"
          id="password"
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
          Register
        </Button>
      </form>
    </Container>
  );
};

export default RegistrationPage;
