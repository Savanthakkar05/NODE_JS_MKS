import { useEffect, useState } from "react";
import Navbarweb from "../component/Navbar";

import { Card, CardBody, CardTitle } from "reactstrap";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

function Profile() {
  const [userData, setUserData] = useState(null);
  const data = useSelector((state) => state.auth.user);
  const isAuth = useSelector((state) => state.auth.isAuthenticated);
  const navigate = useNavigate();

  useEffect(() => {
    setUserData(data);
  }, []);
  return (
    <div>
      {isAuth ? (
        <div>
          <Navbarweb />
          <div className="container-custom">
            <Card
              style={{
                width: "40rem",
                border: "solid 2px #1b95a8",
              }}
              className="px-4"
            >
              <CardBody className="d-flex justify-content-center align-items-center">
                <div className="row">
                  <CardTitle
                    tag="h5"
                    className="fs-1 text-center mb-3"
                    style={{ color: "#6f7575" }}
                  >
                    User Detail
                  </CardTitle>
                  <div className="col-3 " style={{ color: "#6f7575" }}>
                    <p className="fw-semibold fs-5">First Name : </p>
                    <p className="fw-semibold fs-5">Last Name : </p>
                    <p className="fw-semibold fs-5">Email : </p>
                  </div>
                  <div className="col-9" style={{ color: "#6f7575" }}>
                    <p className="fw-normal fs-5">{userData?.firstname}</p>
                    <p className="fw-normal fs-5">{userData?.lastname}</p>
                    <p className="fw-normal fs-5">{userData?.email}</p>
                  </div>
                </div>
              </CardBody>
            </Card>
          </div>
        </div>
      ) : (
        useEffect(() => {
          navigate("/login");
        }, [])
      )}
    </div>
  );
}

export default Profile;
