import { useState } from "react";
import {
  Dropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
} from "reactstrap";
import { FaRegCircleUser, FaBorderAll } from "react-icons/fa6";
import { Link, useNavigate } from "react-router-dom";
import { MdOutlineFavoriteBorder } from "react-icons/md";
import { IoLogOutOutline } from "react-icons/io5";

// Redux & API
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../redux/authSlice";
import api from "../api/axiosInstance";

function DropDown() {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const toggle = () => setDropdownOpen((prevState) => !prevState);

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const user = useSelector((state) => state.auth?.user);
  const isAuth = useSelector((state) => state.auth?.isAuthenticated);

  const handleLogout = async () => {
    try {
      await api.post("/logout");
      dispatch(logout());
      navigate("/login");
    } catch (error) {
      console.error("Logout failed:", error.message);
      // Optional: Force logout on client side even if API fails
      dispatch(logout());
      navigate("/login");
    }
  };

  return (
    <div className="user-dropdown">
      <Dropdown isOpen={dropdownOpen} toggle={toggle} direction="down">
        {/* CUSTOM TOGGLE: Uses 'tag="div"' to allow flexible styling */}
        <DropdownToggle
          tag="div"
          className="d-flex align-items-center gap-2 text-white"
          style={{ cursor: "pointer" }}
        >
          <FaRegCircleUser size={22} />

          <span className="fw-medium">
            {isAuth && user ? (
              // Show User Name if logged in
              `${user.firstname} ${user.lastname}`
            ) : (
              // Show "Login" link if not logged in
              // We use a span here, the Link is technically inside but we treat the whole toggle as the interaction
              <span>Login</span>
            )}
          </span>
        </DropdownToggle>

        <DropdownMenu className="mt-2 shadow-sm border-0">
          {/* SECTION 1: New Customer (Only if NOT logged in) */}
          {!isAuth && (
            <DropdownItem header className="border-bottom pb-3 mb-2">
              <span className="text-secondary fs-6">New Customer?</span>
              <Link
                to="/register"
                className="text-primary fw-bold text-decoration-none ms-2"
              >
                Sign Up
              </Link>
            </DropdownItem>
          )}

          {/* SECTION 2: Menu Items */}
          <DropdownItem className="py-2">
            <FaRegCircleUser className="me-2" size={18} />
            <Link to={"/profile"} className="text-decoration-none text-black">
              My Profile
            </Link>
          </DropdownItem>

          <DropdownItem className="py-2">
            <FaBorderAll className="me-2" size={18} />
            <Link to={"/orders"} className="text-decoration-none text-black">Orders</Link>
          </DropdownItem>

          <DropdownItem className="py-2">
            <MdOutlineFavoriteBorder className="me-2" size={19} />
            <Link to={"/wishlist"} className="text-decoration-none text-black">Wishlist</Link>
          </DropdownItem>

          {/* SECTION 3: Logout (Only if logged in) */}
          {isAuth && (
            <>
              <DropdownItem divider />
              <DropdownItem onClick={handleLogout} className="text-danger py-2">
                <IoLogOutOutline className="me-2" size={19} />
                Logout
              </DropdownItem>
            </>
          )}

          {/* If NOT logged in, we need a clickable Login item inside the menu for mobile users mostly, 
              or just rely on the top toggle behavior. 
              Since the top toggle says "Login", clicking it usually opens this menu. 
              So we add a dedicated Login button inside for clarity. */}
          {!isAuth && (
            <>
              <DropdownItem divider />
              <DropdownItem tag={Link} to="/login" className="py-2">
                <FaRegCircleUser className="me-2 text-secondary" size={18} />
                Login
              </DropdownItem>
            </>
          )}
        </DropdownMenu>
      </Dropdown>
    </div>
  );
}

export default DropDown;
