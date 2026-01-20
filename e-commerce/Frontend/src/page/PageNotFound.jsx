import React from "react";
import { Link } from "react-router-dom";
import { Button } from "reactstrap";
function PageNotFound() {
  return (
    <div className="page-not-found d-flex justify-content-center align-items-center vh-100">
      <div className="">
        <h1 className="text-center fs-20 fw-bold">OOPS!</h1>
        <h2 className="text-center">Page Not Found 404</h2>
        <div className="d-flex justify-content-center align-items-center mt-4">
          <Button className="button">
            <Link to={"/"} className="text-decoration-none text-white fw-bold">GO TO HOMEPAGE</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

export default PageNotFound;
