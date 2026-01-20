import * as yup from "yup";

const forgotPasswordSchema = yup.object({
  email: yup.string().required("Email is required"),
});

export default forgotPasswordSchema;
