import * as yup from "yup";

const loginSchema = yup.object({
  email: yup.string().required("Email is required"),
  password: yup.string().required("Password is required").min(8),
});

export default loginSchema;
