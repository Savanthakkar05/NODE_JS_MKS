import { useState } from "react";
import {
  Navbar,
  NavbarToggler,
  Collapse,
  NavbarBrand,
  Input,
  InputGroup,
  InputGroupText,
} from "reactstrap";
import { Link } from "react-router-dom";
import { CiSearch } from "react-icons/ci";
import { GrCart } from "react-icons/gr";
import "../style/Navbar.scss";
import DropDown from "./DropDown";
import { useSelector } from "react-redux";

function Navbarweb() {
  const [isOpen, setIsOpen] = useState(false);
  const toggle = () => setIsOpen(!isOpen);

  const cart = useSelector((state) => state.cart.cart.length);

  return (
    <div>
      <Navbar expand="md" className="navbar-custom">
        <NavbarBrand href="/" className="navbar-brand">
          E-Commerce
        </NavbarBrand>

        <NavbarToggler
          onClick={toggle}
          className="border border-white bg-white"
        />

        <Collapse isOpen={isOpen} navbar>
          <div className="d-flex flex-column flex-md-row w-100 align-items-center justify-content-between">
            <div className="search-container mx-md-4 my-2 my-md-0">
              <InputGroup>
                <InputGroupText>
                  <CiSearch size={20} />
                </InputGroupText>
                <Input
                  placeholder="Search for products, brands & more..."
                  type="search"
                  className="search-input"
                />
              </InputGroup>
            </div>

            <div className="nav-actions">
              <div className="user-dropdown">
                <DropDown />
              </div>

              <div className="cart-container">
                <Link to="/cart" className="cart-link">
                  <GrCart size={22} />
                  <span className="d-none d-lg-block">Cart</span>
                </Link>
                <div className="cart-badge">{ cart}</div>
              </div>
            </div>
          </div>
        </Collapse>
      </Navbar>
    </div>
  );
}

export default Navbarweb;
