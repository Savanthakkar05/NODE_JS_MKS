import {
  Card,
  FormGroup,
  InputGroup,
  InputGroupText,
  Form,
  Button,
  Input,
} from "reactstrap";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import forgotPasswordSchema from "../schema/forgotPassword";
import api from "../api/axiosInstance";
import { useState } from "react";
import { MdEmail } from "react-icons/md";
import FullPageLoader from "./FullPageLoader";

function ForgetPassword() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const {
    handleSubmit,
    control,
    formState: { errors },
  } = useForm({
    defaultValues: {
      email: "",
    },
    resolver: yupResolver(forgotPasswordSchema),
    mode: "onChange",
  });

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      const res = await api.post("/forgot-password", data);
      const res_data = res.data;
      if (res_data.success === true) {
        // toast.success(res_data.message);
        navigate(`/reset-password/${res_data.token}`);
      }

      if (res_data.success === false) {
        toast.error(res_data.message);
        navigate("/login");
      }
      console.log(res_data);
    } catch (error) {
      setIsLoading(false);
      console.error(error);
    }
  };

  const handleBack = () => {
    navigate("/login");
  };
  return (
    <div className="view">
      {isLoading === true && <FullPageLoader />}
      <Card className="box-login">
        <h1
          className="text-center fs-2 my-3 mt-0 mb-4 fw-bold"
          style={{ color: "black" }}
        >
          Forgot Password
        </h1>
        <Form onSubmit={handleSubmit(onSubmit)}>
          <FormGroup>
            <InputGroup className="">
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
          <div className="d-flex mt-4">
            <Button
              className="button"
              onClick={handleBack}
              disabled={isLoading}
            >
              Back
            </Button>

            <Button type="submit" className="button">
              Next
            </Button>
          </div>
        </Form>
      </Card>
    </div>
  );
}

export default ForgetPassword;
