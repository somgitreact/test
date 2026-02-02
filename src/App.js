import React from "react";
import ipConfig from "./ipConfig.json";
import { ThemeProvider } from "@mui/material/styles";
import theme from "./theme";
import { Route, Switch } from "react-router-dom";

import Register from "./components/Register";
import Login from "./components/Login";
import Products from "./components/Products";
import Checkout from "./components/Checkout";
import Thanks from "./components/Thanks";

export const config = {
  endpoint: `http://${ipConfig.workspaceIp}:8082/api/v1`,
};

function App() {
  return (
    <ThemeProvider theme={theme}>
      <Switch>
        <Route path="/register" component={Register} />
        <Route path="/login" component={Login} />
        <Route path="/checkout" component={Checkout} />
        <Route path="/thanks" component={Thanks} />
        <Route path="/" component={Products} />
      </Switch>
    </ThemeProvider>
  );
}

export default App;
