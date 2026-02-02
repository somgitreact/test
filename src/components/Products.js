import { Search, SentimentDissatisfied } from "@mui/icons-material";
import {
  CircularProgress,
  Grid,
  InputAdornment,
  TextField,
  Box,
} from "@mui/material";
import axios from "axios";
import { useSnackbar } from "notistack";
import React, { useEffect, useState, useCallback } from "react";
import { config } from "../App";
import Footer from "./Footer";
import Header from "./Header";
import ProductCard from "./ProductCard";
import Cart from "./Cart";
import "./Products.css";

const Products = () => {
  const { enqueueSnackbar } = useSnackbar();

  const [products, setProducts] = useState([]);
  const [cartItems, setCartItems] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [debounceTimeout, setDebounceTimeout] = useState(null);
  const [loading, setLoading] = useState(false);

  const token = localStorage.getItem("token");

  /* ---------------- FETCH PRODUCTS ---------------- */
  const performAPICall = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${config.endpoint}/products`);
      setProducts(response.data);
    } catch (err) {
      enqueueSnackbar("Could not fetch products. Check backend.", {
        variant: "error",
      });
    } finally {
      setLoading(false);
    }
  }, [enqueueSnackbar]);

  /* ---------------- FETCH CART ---------------- */
  const fetchCart = useCallback(async () => {
    if (!token) return;

    try {
      const response = await axios.get(`${config.endpoint}/cart`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCartItems(response.data || []);
    } catch (e) {
      enqueueSnackbar(
        "Could not fetch cart details. Check that the backend is running.",
        { variant: "error" }
      );
    }
  }, [token, enqueueSnackbar]);

  /* ---------------- HANDLE QUANTITY ---------------- */
  const handleQuantity = async (productId, qty) => {
    if (!token) return;

    try {
      if (qty <= 0) {
        await axios.delete(`${config.endpoint}/cart`, {
          headers: { Authorization: `Bearer ${token}` },
          data: { productId },
        });
      } else {
        await axios.post(
          `${config.endpoint}/cart`,
          { productId, qty },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }
      fetchCart();
    } catch (e) {
      enqueueSnackbar("Could not update cart", { variant: "error" });
    }
  };

  /* ---------------- SEARCH ---------------- */
  const performSearch = async (text) => {
    try {
      const response = await axios.get(
        `${config.endpoint}/products/search?value=${text}`
      );
      setProducts(response.data);
    } catch (err) {
      if (err.response && err.response.status === 404) {
        setProducts([]);
      } else {
        enqueueSnackbar("Search failed", { variant: "error" });
      }
    }
  };

  const debounceSearch = (e) => {
    const value = e.target.value;
    setSearchText(value);

    if (debounceTimeout) clearTimeout(debounceTimeout);

    const timeout = setTimeout(() => {
      performSearch(value);
    }, 500);

    setDebounceTimeout(timeout);
  };

  /* ---------------- ON LOAD ---------------- */
  useEffect(() => {
    performAPICall();
    if (token) fetchCart();
  }, [performAPICall, fetchCart, token]);

  return (
    <div>
      <Header>
        <TextField
          className="search-desktop"
          size="small"
          placeholder="Search for items/categories"
          value={searchText}
          fullWidth
          onChange={debounceSearch}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <Search />
              </InputAdornment>
            ),
          }}
        />
      </Header>

      <TextField
        className="search-mobile"
        fullWidth
        size="small"
        placeholder="Search for items/categories"
        value={searchText}
        onChange={debounceSearch}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <Search />
            </InputAdornment>
          ),
        }}
      />

      {loading && (
        <Box className="loading">
          <CircularProgress />
          <h4>Loading Products</h4>
        </Box>
      )}

      {!loading && products.length === 0 && (
        <Box className="no-product">
          <SentimentDissatisfied />
          <h4>No products found</h4>
        </Box>
      )}

      <Grid container spacing={2} px={2}>
        <Grid item xs={12} md={9}>
          <Grid container spacing={2}>
            {products.map((product) => (
              <Grid item xs={6} md={3} key={product._id}>
                {/* 🔑 CRITICAL FIX: pass handleAddToCart */}
                <ProductCard
                  product={product}
                  handleAddToCart={() =>
                    handleQuantity(product._id, 1)
                  }
                />
              </Grid>
            ))}
          </Grid>
        </Grid>

        <Grid item xs={12} md={3} bgcolor="#E9F5E1">
          <Cart
            products={products}
            cartItems={cartItems}
            handleQuantity={handleQuantity}
          />
        </Grid>
      </Grid>

      <Footer />
    </div>
  );
};

export default Products;
