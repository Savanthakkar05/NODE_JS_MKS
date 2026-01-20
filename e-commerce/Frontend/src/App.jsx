import { Route, Routes } from "react-router-dom";
import Home from "./page/Home";
import Cart from "./page/Cart";
import Login from "./page/Login";
import Register from "./page/Register";
import PageNotFound from "./page/PageNotFound";
import Profile from "./page/Profile";
import Order from "./page/Order";
import Wishlist from "./page/Wishlist";
import ForgotPassword from "./page/ForgotPassword";
import ResetPassword from "./page/ResetPassword";
function App() {
  return (
    <div className="">
      <Routes>
        <Route path="/" element={<Home />}></Route>
        <Route path="/cart" element={<Cart />}></Route>
        <Route path="/login" element={<Login />}></Route>
        <Route path="/register" element={<Register />}></Route>
        <Route path="/profile" element={<Profile />}></Route>
        <Route path="/orders" element={<Order />}></Route>
        <Route path="/wishlist" element={<Wishlist />}></Route>
        <Route path="/forgot-password" element={<ForgotPassword />}></Route>
        <Route path="/reset-password/:token" element={<ResetPassword />}></Route>

        
        {/* Not found route */}
        <Route path="*" element={<PageNotFound />}></Route>
      </Routes>
    </div>
  );
}

export default App;
