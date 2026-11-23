export const AUTH_ENUM = {
  SIGNUP: "signup",
  LOGIN: "login",
  GOOGLE_LOGIN: "googleLogin",
  FORGET_PASSWORD: "forgetPassword",
  RESET_PASSWORD: "resetPassword",
};

const AuthEnum = {
    Bearer: "Bearer",
    Basic: "Basic"
};

Object.freeze(AuthEnum);

export { AuthEnum };