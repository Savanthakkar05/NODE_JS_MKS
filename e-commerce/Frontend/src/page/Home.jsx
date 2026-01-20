import { useEffect, useState } from "react";
import Navbarweb from "../component/Navbar";
import api from "../api/axiosInstance";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Card, CardBody, CardTitle, CardText, Button } from "reactstrap";
import { toast } from "react-toastify";
import { setCart } from "../redux/cartSlice";

function Home() {
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const data = useSelector((state) => state.auth.user);
  const isAuth = useSelector((state) => state.auth.isAuthenticated);
  const cart = useSelector((state) => state.cart.cart);
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const product_res = await api.get("/product");

        setProducts(product_res.data.data);
        // setUserData(data);
      } catch (error) {
        console.error(error);
      }
    };
    fetchData();
  }, []);

  // console.log(products);

  const handleCart = async (productId) => {
    // console.log(data.id);
    if (!isAuth) {
      toast.error("Please login to add product to bag.");
      navigate("/login");
      return;
    }

    try {
      const payload = {
        userId: data.id,
        productId: productId,
      };

      const res = await api.post("/cart/add", payload);
      // console.log(res.data);
      dispatch(setCart(res.data.cartItem));
      if (res.data.success) {
        // toast.success("Item added to cart!");
      }
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Failed to add item");
    }
  };
  return (
    <div className="">
      <Navbarweb />

      <div className="home">
        <div className="">
          <div className="row row-cols-1 row-cols-md-3 g-4 mt-4">
            {products &&
              products.map((product, index) => {
                return (
                  <Card
                    style={{
                      width: "18rem",
                      margin: "15px auto",
                      boxShadow: "0px 0px 8px #d6d4d4ff",
                    }}
                    key={index}
                    className="col border border-0"
                  >
                    <img
                      alt="Sample"
                      src={product.images}
                      className="my-2 "
                      style={{
                        backgroundColor: "#f4f4f4ff",
                        borderRadius: "10px",
                      }}
                    />
                    <CardBody>
                      <CardTitle tag="h5">{product.title}</CardTitle>
                      <CardText
                        className="mb-2"
                        style={{ color: "#7c7c7cff", fontWeight: "lighter" }}
                      >
                        {product.description}
                      </CardText>
                      <CardText
                        className="mb-5"
                        style={{ marginBottom: "30px" }}
                      >
                        <span
                          className=""
                          style={{ fontWeight: "bold", color: "#545454ff" }}
                        >
                          Price :{" "}
                        </span>
                        ${product.price}
                      </CardText>
                      {!cart.some((item) => item.productId === product.id) ? (
                        <Button
                          className="cart-button"
                          style={{
                            position: "absolute",
                            bottom: "12px",
                            padding: "5px 20px",
                            left: "50%",
                            transform: "translateX(-50%)",
                            backgroundColor: "#323232ff",
                          }}
                          onClick={() => handleCart(product.id)}
                        >
                          Add To Cart
                        </Button>
                      ) : (
                        <Button
                          className="cart-button"
                          style={{
                            position: "absolute",
                            bottom: "12px",
                            padding: "5px 20px",
                            left: "50%",
                            transform: "translateX(-50%)",
                            backgroundColor: "rgb(99, 99, 99)",
                          }}
                          disabled
                        >
                          Add To Cart
                        </Button>
                      )}
                    </CardBody>
                  </Card>
                );
              })}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;
