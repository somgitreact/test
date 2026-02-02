import { CreditCard, Delete } from "@mui/icons-material";
import {
  Button,
  Divider,
  Grid,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { Box } from "@mui/system";
import axios from "axios";
import { useSnackbar } from "notistack";
import React, { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import { config } from "../App";
import Cart, { getTotalCartValue, generateCartItemsFrom } from "./Cart";
import "./Checkout.css";
import Footer from "./Footer";
import Header from "./Header";

/* ---------------- ADD ADDRESS VIEW ---------------- */
const AddNewAddressView = ({
  token,
  newAddress,
  handleNewAddress,
  addAddress,
}) => (
  <Box display="flex" flexDirection="column">
    <TextField
      multiline
      minRows={4}
      placeholder="Enter your complete address"
      value={newAddress.value}
      onChange={(e) =>
        handleNewAddress({ ...newAddress, value: e.target.value })
      }
    />
    <Stack direction="row" my="1rem">
      <Button
        variant="contained"
        onClick={() => addAddress(token, newAddress)}
      >
        Add
      </Button>
      <Button
        variant="text"
        onClick={() =>
          handleNewAddress({ isAddingNewAddress: false, value: "" })
        }
      >
        Cancel
      </Button>
    </Stack>
  </Box>
);

const Checkout = () => {
  const token = localStorage.getItem("token");
  const history = useHistory();
  const { enqueueSnackbar } = useSnackbar();

  const [items, setItems] = useState([]);
  const [products, setProducts] = useState([]);
  const [addresses, setAddresses] = useState({ all: [], selected: "" });
  const [newAddress, setNewAddress] = useState({
    isAddingNewAddress: false,
    value: "",
  });

  useEffect(() => {
    if (!token) {
      enqueueSnackbar(
        "You must be logged in to access checkout page",
        { variant: "info" }
      );
      history.push("/login");
      return;
    }

    const loadData = async () => {
      const productsRes = await axios.get(`${config.endpoint}/products`);
      setProducts(productsRes.data);

      const cartRes = await axios.get(`${config.endpoint}/cart`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setItems(
        generateCartItemsFrom(cartRes.data, productsRes.data)
      );

      const addressRes = await axios.get(
        `${config.endpoint}/user/addresses`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setAddresses({ all: addressRes.data, selected: "" });
    };

    loadData();
  }, [token, enqueueSnackbar, history]);

  const addAddress = async (token, newAddress) => {
    const response = await axios.post(
      `${config.endpoint}/user/addresses`,
      { address: newAddress.value },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    setAddresses({ ...addresses, all: response.data });
    setNewAddress({ isAddingNewAddress: false, value: "" });
  };

  const deleteAddress = async (token, addressId) => {
    const response = await axios.delete(
      `${config.endpoint}/user/addresses/${addressId}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    setAddresses({ ...addresses, all: response.data });
  };

  const validateRequest = () => {
    if (getTotalCartValue(items) > localStorage.getItem("balance")) {
      enqueueSnackbar(
        "You do not have enough balance in your wallet for this purchase",
        { variant: "warning" }
      );
      return false;
    }

    if (!addresses.all.length) {
      enqueueSnackbar(
        "Please add a new address before proceeding.",
        { variant: "warning" }
      );
      return false;
    }

    if (!addresses.selected) {
      enqueueSnackbar(
        "Please select one shipping address to proceed.",
        { variant: "warning" }
      );
      return false;
    }

    return true;
  };

  const performCheckout = async () => {
    if (!validateRequest()) return;

    await axios.post(
      `${config.endpoint}/cart/checkout`,
      { addressId: addresses.selected },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    localStorage.setItem(
      "balance",
      localStorage.getItem("balance") - getTotalCartValue(items)
    );

    enqueueSnackbar("Order placed successfully", { variant: "success" });
    history.push("/thanks");
  };

  return (
    <>
      <Header />
      <Grid container>
        <Grid item xs={12} md={9}>
          <Box className="shipping-container">
            <Typography variant="h4">Shipping</Typography>
            <Divider />

            {addresses.all.length ? (
              addresses.all.map((addr) => (
                <Box
                  key={addr._id}
                  className={`address-item ${
                    addresses.selected === addr._id
                      ? "selected"
                      : "not-selected"
                  }`}
                  onClick={() =>
                    setAddresses({ ...addresses, selected: addr._id })
                  }
                >
                  <Typography>{addr.address}</Typography>
                  <Button
                    startIcon={<Delete />}
                    onClick={() => deleteAddress(token, addr._id)}
                  >
                    DELETE
                  </Button>
                </Box>
              ))
            ) : (
              <Typography>
                No addresses found for this account. Please add one to proceed
              </Typography>
            )}

            {!newAddress.isAddingNewAddress ? (
              <Button
                variant="contained"
                id="add-new-btn"
                onClick={() =>
                  setNewAddress({ ...newAddress, isAddingNewAddress: true })
                }
              >
                Add new address
              </Button>
            ) : (
              <AddNewAddressView
                token={token}
                newAddress={newAddress}
                handleNewAddress={setNewAddress}
                addAddress={addAddress}
              />
            )}

            <Typography variant="h4">Payment</Typography>
            <Divider />

            <Typography>
              Pay ${getTotalCartValue(items)} of available $
              {localStorage.getItem("balance")}
            </Typography>

            <Button
              startIcon={<CreditCard />}
              variant="contained"
              onClick={performCheckout}
            >
              PLACE ORDER
            </Button>
          </Box>
        </Grid>

        <Grid item xs={12} md={3} bgcolor="#E9F5E1">
          <Cart
            products={products}
            items={items}
            isReadOnly
            handleQuantity={() => {}}
          />
        </Grid>
      </Grid>
      <Footer />
    </>
  );
};

export default Checkout;
