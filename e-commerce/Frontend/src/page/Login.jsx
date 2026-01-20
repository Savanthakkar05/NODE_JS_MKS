import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import loginSchema from "../schema/login";
import {
  Card,
  Form,
  FormGroup,
  Input,
  Label,
  Button,
  InputGroup,
  InputGroupText,
} from "reactstrap";
import { toast } from "react-toastify";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/axiosInstance";
import { useDispatch } from "react-redux";
import { loginSuccess } from "../redux/authSlice";
import { BiSolidUserRectangle } from "react-icons/bi";
import { TbLockPassword } from "react-icons/tb";
import { useState } from "react";
import { FaRegEye } from "react-icons/fa";
import { IoEyeOffOutline } from "react-icons/io5";

function Login() {
  const {
    handleSubmit,
    control,
    formState: { errors },
  } = useForm({
    defaultValues: {
      email: "",
      password: "",
    },
    resolver: yupResolver(loginSchema),
    mode: "onChange",
  });

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);

  const onSubmit = async (data) => {
    try {
      const res = await api.post("/signin", data);
      const userData = res.data;
      console.log("===> ", userData);
      dispatch(loginSuccess(userData.data));
      toast.success("Login Successfully!");
      navigate("/");
    } catch (error) {
      toast.error(error.response?.data?.message || "Login failed");
    }
  };

  return (
    <div className="view">
      <Card className="box-login">
        <h1 className="text-center fs-2 my-3 mt-0 mb-4 text-dark fw-bold">
          Login
        </h1>
        <Form onSubmit={handleSubmit(onSubmit)}>
          <FormGroup>
            <InputGroup>
              <InputGroupText>
                <BiSolidUserRectangle />
              </InputGroupText>
              <Controller
                control={control}
                name="email"
                render={({ field }) => (
                  <Input
                    id="exampleEmail"
                    name="email"
                    placeholder="Enter Email"
                    type="email"
                    {...field}
                  />
                )}
              />
            </InputGroup>
          </FormGroup>
          <p className="error">
            {<span>{errors.email && errors.email.message}</span>}
          </p>
          <FormGroup>
            <InputGroup>
              <InputGroupText>
                <TbLockPassword />
              </InputGroupText>
              <Controller
                control={control}
                name="password"
                render={({ field }) => (
                  <Input
                    id="examplePassword"
                    name="password"
                    placeholder="with a placeholder"
                    type={showPassword ? "text" : "password"}
                    {...field}
                  />
                )}
              />
              <InputGroupText onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? (
                  <IoEyeOffOutline style={{ backgroundColor: "white" }} />
                ) : (
                  <FaRegEye />
                )}
              </InputGroupText>
            </InputGroup>

            <p className="error" style={{ marginTop: "10px" }}>
              {<span>{errors.password && errors.password.message}</span>}
            </p>
            <div className="d-flex justify-content-end">
              <Link
                to={"/forgot-password"}
                className="text-decoration-none mt-2 mb-0"
              >
                Forgot Password ?
              </Link>
            </div>
          </FormGroup>

          <Button
            type="submit"
            className="button"
            style={{ marginTop: "-7px" }}
          >
            Login
          </Button>
        </Form>

        <p className="mt-3 mb-0 ml-0">
          Don't have an account ?{" "}
          <Link to={"/register"} className="text-decoration-none">
            Sign Up
          </Link>
        </p>
      </Card>
    </div>
  );
}

export default Login;
