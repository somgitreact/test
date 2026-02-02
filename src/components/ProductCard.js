import React from "react";
import {
  Card,
  CardContent,
  CardMedia,
  Typography,
  Button,
  Rating,
} from "@mui/material";

const ProductCard = ({ product, handleAddToCart }) => {
  const { name, image, cost, rating } = product;

  return (
    <Card>
      <CardMedia component="img" height="140" image={image} alt={name} />
      <CardContent>
        <Typography noWrap>{name}</Typography>
        <Typography>${cost}</Typography>
        <Rating value={rating} readOnly size="small" />
      </CardContent>
      <Button fullWidth variant="contained" onClick={handleAddToCart}>
        ADD TO CART
      </Button>
    </Card>
  );
};

export default ProductCard;
