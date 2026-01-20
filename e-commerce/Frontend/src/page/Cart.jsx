import React, { useEffect, useState } from "react";
import Navbarweb from "../component/Navbar";
import api from "../api/axiosInstance";
import { useDispatch, useSelector } from "react-redux";
import {
  Button,
  Card,
  CardBody,
  Col,
  Container,
  Input,
  Row,
  Spinner,
} from "reactstrap";
import { useNavigate } from "react-router-dom";
import { FaMinus, FaPlus, FaTrash } from "react-icons/fa6";
import { removeCart } from "../redux/cartSlice";

function Cart() {
  const data = useSelector((state) => state.auth.user);
  const [cartData, setCartData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const fetchCart = async () => {
    if (!data.id) {
      return;
    }

    try {
      setLoading(true);
      const res = await api.get(`/cart/${data.id}`);
      console.log(res.data);
      setCartData(res.data.cart);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, [data]);

  const handleNavigate = () => {
    navigate("/");
  };

  const handleRemove = async (cart) => {
    // console.log("===> ", cart);
    try {
      await api.delete("/cart/remove", {
        data: { userId: data.id, productId: cart.product.id },
      });
      fetchCart();
      dispatch(removeCart(cart));
    } catch (error) {
      console.error(error);
    }
  };

  const calculateTotal = () => {
    if (!cartData || !cartData.cartItem) return 0;

    return cartData.cartItem.reduce((acc, item) => {
      const price = item.product ? item.product.price : 0;
      return acc + price * item.quantity;
    }, 0);
  };

  if (loading) {
    <div className="d-flex justify-content-center align-items-center vh-100 ">
      <Spinner color="dark" />
    </div>;
  }

  const handleUpdateQuantity = async (productId, currentQuantity, change) => {
    if (currentQuantity === 1 && change === -1) {
      handleRemove(productId);
      return;
    }

    try {
      await api.post("/cart/add", {
        userId: data.id,
        productId: productId,
        quantity: change,
      });
      fetchCart();
    } catch (error) {
      console.error(error);
    }
  };
  return (
    <div className="cart-page">
      <Navbarweb />

      <Container className="py-5">
        <h2 className="mb-4 fw-bold">Shopping Cart</h2>
        {!cartData || !cartData.cartItem || cartData.cartItem.length === 0 ? (
          <div className="text-center py-5">
            <h3>Your Cart is empty</h3>
            <Button className="mt-3" color="dark" onClick={handleNavigate}>
              Continue Shopping
            </Button>
          </div>
        ) : (
          <Row>
            <Col lg="8">
              <Card className="border-0 shadow-sm mb-4">
                <CardBody className="p-0">
                  {cartData.cartItem.map((item, index) => (
                    <div
                      className="d-flex align-items-center p-3 border-bottom"
                      key={index}
                    >
                      <img
                        src={item.product?.images}
                        alt={item.product?.title}
                        className="cart-item-img me-3"
                      />

                      <div className="flex-grow-1">
                        <h5
                          className="mb-1 text-truncate"
                          style={{ maxWidth: "250px" }}
                        >
                          {item.product?.title}
                        </h5>
                        <p className="text-muted mb-0 small">
                          ${item.product?.price} / unit
                        </p>
                      </div>

                      <div className="d-flex align-items-center mx-3">
                        <Button
                          className="border"
                          size="sm"
                          color="dark"
                          onClick={() =>
                            handleUpdateQuantity(
                              item.productId,
                              item.quantity,
                              -1,
                            )
                          }
                          disabled={item.quantity === 1}
                        >
                          <FaMinus size={10} />
                        </Button>
                        <Input
                          value={item.quantity}
                          readOnly
                          className="mx-2 text-center"
                          style={{
                            width: "45px",
                            height: "30px",
                            fontSize: "14px",
                          }}
                        />
                        <Button
                          className="border"
                          size="sm"
                          color="dark"
                          onClick={() =>
                            handleUpdateQuantity(
                              item.productId,
                              item.quantity,
                              1,
                            )
                          }
                          disabled={loading}
                        >
                          <FaPlus size={10} />
                        </Button>
                      </div>

                      <div className="text-end" style={{ minWidth: "80px" }}>
                        <h6 className="mb-2 fw-bold">
                          ${(item.product?.price * item.quantity).toFixed(2)}
                        </h6>
                        <Button
                          className="text-danger p-0 text-decoration-none small"
                          color="link"
                          onClick={() => handleRemove(item)}
                        >
                          <FaTrash className="me-1" /> Remove
                        </Button>
                      </div>
                    </div>
                  ))}
                </CardBody>
              </Card>
            </Col>

            <Col lg="4">
              <Card className="border-0 shadow-sm summary-card">
                <CardBody className="p-4">
                  <h5 className="fw-bold mb-4">Order Summary</h5>

                  <div className="d-flex justify-conent-between mb-2">
                    <span className="text-muted pe-1">Subtotal</span>
                    <span> ${calculateTotal().toFixed(2)}</span>
                  </div>

                  <div className="d-flex justify-conent-between mb-2">
                    <span className="text-muted pe-1">Shpping</span>
                    <span className="text-success">Free</span>
                  </div>

                  <div className="d-flex justify-conent-between mb-4">
                    <span className="text-muted pe-1">Tax</span>
                    <span>$0.00</span>
                  </div>

                  <hr />

                  <div className="d-flex justify-conent-between mb-4">
                    <span className="fw-bold fs-5 pe-1"> Total </span>
                    <span className="fw-bold fs-5">
                      ${calculateTotal().toFixed(2)}
                    </span>
                  </div>

                  <Button className="w-100" color="dark" block size="lg">
                    Proceed to Checkout
                  </Button>
                </CardBody>
              </Card>
            </Col>
          </Row>
        )}
      </Container>
    </div>
  );
}

export default Cart;
