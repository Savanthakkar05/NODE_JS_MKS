import { yupResolver } from "@hookform/resolvers/yup";
import { useForm, Controller } from "react-hook-form";
import { Card, Form, FormGroup, Input, Label, Button } from "reactstrap";
import registerSchema from "../schema/register";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { InputGroup, InputGroupText } from "reactstrap";
import api from "../api/axiosInstance";
import { BiSolidUserRectangle } from "react-icons/bi";
import { MdEmail } from "react-icons/md";
import { TbLockPassword } from "react-icons/tb";
import { useState } from "react";
import { FaRegEye } from "react-icons/fa";
import { IoEyeOffOutline } from "react-icons/io5";
import { useDispatch } from "react-redux";
import { loginSuccess } from "../redux/authSlice";

function Register() {
  const {
    handleSubmit,
    control,
    formState: { errors },
  } = useForm({
    defaultValues: {
      firstname: "",
      lastname: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
    resolver: yupResolver(registerSchema),
    mode: "onChange",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const onSubmit = async (data) => {
    try {
      const res = await api.post("/signup", data);

      const userData = res.data;
      console.log("==>", userData);
      dispatch(loginSuccess(userData.data));
      navigate("/");
    } catch (error) {
      console.log(error);
      toast.error(error.response.data.message);
    }
  };

  return (
    <div className="view" style={{ height: "120vh" }}>
      <Card className="box-register">
        <h1 className="text-center fs-2 my-3 mt-0 mb-4 text-dark fw-bold">
          Register
        </h1>
        <Form onSubmit={handleSubmit(onSubmit)}>
          <FormGroup>
            <InputGroup>
              <InputGroupText>
                <BiSolidUserRectangle />
              </InputGroupText>
              <Controller
                control={control}
                name="firstname"
                render={({ field }) => (
                  <Input
                    id="exampleFirstname"
                    name="email"
                    placeholder="Enter First Name"
                    type="text"
                    {...field}
                  />
                )}
              />
            </InputGroup>
          </FormGroup>

          <p className="error">
            {<span>{errors.firstname && errors.firstname.message}</span>}
          </p>
          <FormGroup>
            <InputGroup>
              <InputGroupText>
                <BiSolidUserRectangle />
              </InputGroupText>
              <Controller
                control={control}
                name="lastname"
                render={({ field }) => (
                  <Input
                    id="exampleLastname"
                    name="lastname"
                    placeholder="Enter Last Name"
                    type="text"
                    {...field}
                  />
                )}
              />
            </InputGroup>
          </FormGroup>
          <p className="error">
            {<span>{errors.lastname && errors.lastname.message}</span>}
          </p>
          <FormGroup>
            <InputGroup>
              <InputGroupText>
                <MdEmail />
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
                    placeholder="Enter Password"
                    type={showPassword ? "text" : "password"}
                    {...field}
                  />
                )}
              />

              <InputGroupText
                className="password-eye"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <IoEyeOffOutline /> : <FaRegEye />}
              </InputGroupText>
            </InputGroup>
          </FormGroup>
          <p className="error">
            {<span>{errors.password && errors.password.message}</span>}
          </p>
          <FormGroup>
            <InputGroup>
              <InputGroupText>
                <TbLockPassword />
              </InputGroupText>
              <Controller
                control={control}
                name="confirmPassword"
                render={({ field }) => (
                  <Input
                    id="exampleConfirmPassword"
                    name="confirmPassword"
                    placeholder="Enter Confirm Password"
                    type={showConfirmPassword ? "text" : "password"}
                    {...field}
                  />
                )}
              />

              <InputGroupText
                className="password-eye"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? <IoEyeOffOutline /> : <FaRegEye />}
              </InputGroupText>
            </InputGroup>
          </FormGroup>

          <p className="error">
            {
              <span>
                {errors.confirmPassword && errors.confirmPassword.message}
              </span>
            }
          </p>
          <Button type="submit" className="button">
            Register
          </Button>
        </Form>

        <p className="mt-3 mb-0 ml-0">
          You have an already account ?{" "}
          <Link to={"/login"} className="text-decoration-none">
            Login
          </Link>
        </p>
      </Card>
    </div>
  );
}

export default Register;
