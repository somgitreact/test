import { Button, CircularProgress, Stack, TextField } from "@mui/material";
import { Box } from "@mui/system";
import axios from "axios";
import { useSnackbar } from "notistack";
import React, { useState } from "react";
import { useHistory, Link } from "react-router-dom";
import { config } from "../App";
import Footer from "./Footer";
import Header from "./Header";
import "./Login.css";

const Login = () => {
  const { enqueueSnackbar } = useSnackbar();
  const history = useHistory();

  const [form, setForm] = useState({
    username: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  // ---------------- VALIDATION ----------------
  const validateInput = (data) => {
    if (!data.username) {
      enqueueSnackbar("Username is a required field", { variant: "warning" });
      return false;
    }
    if (!data.password) {
      enqueueSnackbar("Password is a required field", { variant: "warning" });
      return false;
    }
    return true;
  };

  // -------------- LOCAL STORAGE ----------------
  const persistLogin = (token, username, balance) => {
    localStorage.setItem("token", token);
    localStorage.setItem("username", username);
    localStorage.setItem("balance", balance);
  };

  // ------------------ LOGIN API ----------------
  const login = async () => {
    if (!validateInput(form)) return;

    try {
      setLoading(true);

      const response = await axios.post(`${config.endpoint}/auth/login`, {
        username: form.username,
        password: form.password,
      });

      if (response.status === 201) {
        enqueueSnackbar("Logged in successfully", { variant: "success" });

        const { token, username, balance } = response.data;
        persistLogin(token, username, balance);

        history.push("/");
      }
    } catch (error) {
      if (error.response && error.response.status === 400) {
        enqueueSnackbar(error.response.data.message, { variant: "error" });
      } else {
        enqueueSnackbar(
          "Something went wrong. Check that the backend is running, reachable and returns valid JSON.",
          { variant: "error" }
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      display="flex"
      flexDirection="column"
      justifyContent="space-between"
      minHeight="100vh"
    >
      <Header hasHiddenAuthButtons />

      <Box className="content">
        <Stack spacing={2} className="form">
          <h2 className="title">Login</h2>

          <TextField
            label="username"
            name="username"
            fullWidth
            onChange={handleChange}
            value={form.username}
          />

          <TextField
            label="password"
            name="password"
            type="password"
            fullWidth
            onChange={handleChange}
            value={form.password}
          />

          {loading ? (
            <Box display="flex" justifyContent="center">
              <CircularProgress />
            </Box>
          ) : (
            <Button
              variant="contained"
              fullWidth
              className="button"
              onClick={login}
            >
              LOGIN TO QKART
            </Button>
          )}

          <p className="secondary-action">
            Don’t have an account?{" "}
            <Link className="link" to="/register">
              Register now
            </Link>
          </p>
        </Stack>
      </Box>

      <Footer />
    </Box>
  );
};

export default Login;
