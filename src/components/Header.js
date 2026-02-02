import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { Avatar, Button, Stack } from "@mui/material";
import Box from "@mui/material/Box";
import React from "react";
import "./Header.css";
import { useHistory } from "react-router-dom";

const Header = ({ hasHiddenAuthButtons, children }) => {
  const history = useHistory();
  const username = localStorage.getItem("username");

  const logout = () => {
    localStorage.clear();
    window.location.reload();
  };

  return (
    <Box className="header">
      {/* Logo */}
      <Box className="header-title" onClick={() => history.push("/")}>
        <img src="logo_light.svg" alt="QKart-icon" />
      </Box>

      {/* Search bar (only on Products page) */}
      {children}

      {/* Right side buttons */}
      {!hasHiddenAuthButtons ? (
        username ? (
          <Stack direction="row" spacing={2} alignItems="center">
            <Avatar src="avatar.png" alt={username} />
            <p className="username-text">{username}</p>
            <Button variant="text" onClick={logout}>
              Logout
            </Button>
          </Stack>
        ) : (
          <Stack direction="row" spacing={2}>
            <Button onClick={() => history.push("/login")} variant="text">
              Login
            </Button>
            <Button onClick={() => history.push("/register")} variant="contained">
              Register
            </Button>
          </Stack>
        )
      ) : (
        <Button
          className="explore-button"
          startIcon={<ArrowBackIcon />}
          variant="text"
          onClick={() => history.push("/")}
        >
          Back to explore
        </Button>
      )}
    </Box>
  );
};

export default Header;
