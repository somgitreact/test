import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  IconButton,
  Stack,
  Typography,
} from "@mui/material";
import { AddOutlined, RemoveOutlined } from "@mui/icons-material";
import { useHistory } from "react-router-dom";
import axios from "axios";
import { useSnackbar } from "notistack";
import { config } from "../App";
import "./Cart.css";

/* ================= HELPERS ================= */

export const getTotalCartValue = (items = []) =>
  items.reduce((sum, item) => sum + item.cost * item.qty, 0);

export const generateCartItemsFrom = (cartData, productsData) => {
  if (!cartData || !productsData) return [];

  return cartData.map((cartItem) => {
    const product = productsData.find(
      (p) => p._id === cartItem.productId
    );
    return { ...product, qty: cartItem.qty };
  });
};

/* ================= CART ================= */

const Cart = ({
  products = [],
  cartItems = [],
  items = [],
  isReadOnly = false,
}) => {
  const history = useHistory();
  const { enqueueSnackbar } = useSnackbar();
  const token = localStorage.getItem("token");

  const [data, setData] = useState([]);

  // 🔑 Sync local state
  useEffect(() => {
    if (isReadOnly) {
      setData(items);
    } else {
      setData(
        cartItems.map((c) => ({
          ...products.find((p) => p._id === c.productId),
          qty: c.qty,
        }))
      );
    }
  }, [cartItems, items, products, isReadOnly]);

  const updateCart = async (productId, qty) => {
    try {
      if (qty <= 0) {
        await axios.delete(`${config.endpoint}/cart`, {
          headers: { Authorization: `Bearer ${token}` },
          data: { productId },
        });
        setData((prev) =>
          prev.filter((item) => item._id !== productId)
        );
      } else {
        await axios.post(
          `${config.endpoint}/cart`,
          { productId, qty },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setData((prev) =>
          prev.map((item) =>
            item._id === productId ? { ...item, qty } : item
          )
        );
      }
    } catch {
      enqueueSnackbar("Item already in cart", {
        variant: "warning",
      });
    }
  };

  if (!data.length) {
    return (
      <Box className="cart empty">
        <Typography variant="h6">Cart is empty</Typography>
      </Box>
    );
  }

  return (
    <Box className="cart">
      <Stack spacing={2}>
        {data.map((item) => (
          <Stack
            key={item._id}
            direction="row"
            justifyContent="space-between"
            alignItems="center"
          >
            <Box>
              <Typography>{item.name}</Typography>
              <Typography>${item.cost}</Typography>
            </Box>

            {isReadOnly ? (
              <Typography>Qty: {item.qty}</Typography>
            ) : (
              <Stack direction="row" alignItems="center">
                <IconButton
                  onClick={() =>
                    updateCart(item._id, item.qty - 1)
                  }
                >
                  <RemoveOutlined />
                </IconButton>

                <Typography data-testid="item-qty">
                  {item.qty}
                </Typography>

                <IconButton
                  onClick={() =>
                    updateCart(item._id, item.qty + 1)
                  }
                >
                  <AddOutlined />
                </IconButton>
              </Stack>
            )}
          </Stack>
        ))}

        {/* ✅ SINGLE TEXT NODE */}
        <Typography fontWeight={700}>
          ${getTotalCartValue(data)}
        </Typography>

        {!isReadOnly && (
          <Button
            variant="contained"
            className="checkout-btn"
            onClick={() => history.push("/checkout")}
          >
            Checkout
          </Button>
        )}
      </Stack>
    </Box>
  );
};

export default Cart;
