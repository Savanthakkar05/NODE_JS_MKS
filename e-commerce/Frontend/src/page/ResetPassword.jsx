import React, { useState } from "react";
import {
  Card,
  Form,
  FormGroup,
  Input,
  InputGroup,
  InputGroupText,
  Button,
} from "reactstrap";

import { FaRegEye } from "react-icons/fa";
import { IoEyeOffOutline } from "react-icons/io5";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import resetPasswordSchema from "../schema/resetPassword";
import { toast } from "react-toastify";
import { TbLockPassword } from "react-icons/tb";
import api from "../api/axiosInstance";
import { useNavigate, useParams } from "react-router-dom";

function ResetPassword() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();
  const { token } = useParams();

  const {
    handleSubmit,
    control,
    formState: { errors },
  } = useForm({
    defaultValues: {
      password: "",
      confirm_password: "",
    },
    resolver: yupResolver(resetPasswordSchema),
    mode: "onChange",
  });

  const onSubmit = async (data) => {
    try {
      const res = await api.patch(`/reset-password/${token}`, data);
      const res_data = res.data;

      if (res_data.success) {
        navigate("/login");
        toast.success(res_data.message);
      }
      console.log(res_data);
      console.log(data);
    } catch (error) {
      toast.error(`${error.response.data.message}`);
      navigate("/login");
      console.error(error.message);
    }
  };

  return (
    <div className="view">
      <Card className="box-login">
        <h1
          className="text-center fs-2 my-3 mt-0 mb-4 fw-bold"
          style={{ color: "black" }}
        >
          Reset Password
        </h1>
        <Form onSubmit={handleSubmit(onSubmit)}>
          <FormGroup>
            <InputGroup className="">
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
            <InputGroup className="">
              <InputGroupText>
                <TbLockPassword />
              </InputGroupText>
              <Controller
                control={control}
                name="confirm_password"
                render={({ field }) => (
                  <Input
                    id="exampleConfirmPassword"
                    name="confirm_password"
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
            {<span>{errors.confirm_password && errors.confirm_password.message}</span>}
          </p>
          <div className="d-flex mt-4">
            <Button type="submit" className="button">
              Reset Password
            </Button>
          </div>
        </Form>
      </Card>
    </div>
  );
}

export default ResetPassword;
