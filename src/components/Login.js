import { useEffect, useState } from "react";
import { signInWithEmailAndPassword, auth } from "../firebase";
import { useNavigate } from "react-router-dom";
import { Alert } from "react-bootstrap";

const LogIn = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");

  useEffect(() => {
    if (localStorage.getItem("accessToken")) {
      navigate("/");
    }
  }, []);

  const onChange = (e) => {
    const { name, value } = e.target;

    setUser((prevUser) => {
      return { ...prevUser, [name]: value };
    });
  };

  const onSubmit = async (e) => {
    e.preventDefault();

    await signInWithEmailAndPassword(auth, user.email, user.password)
      .then((userCredentials) => {
        localStorage.setItem("accessToken", userCredentials.user.accessToken);

        if (user.email.includes("admin")) {
          localStorage.setItem("isAdmin", true);
          navigate("/settings");
        } else {
          localStorage.removeItem("isAdmin");
          navigate("/chat");
        }

        setError("");
      })
      .catch((error) => {
        setError(error.message);
        console.error("Authentication Error:", error.message);
      });
  };

  return (
    <div className="Auth-form-container">
      <form className="Auth-form">
        <div className="Auth-form-content">
          <h3 className="Auth-form-title">Sign In</h3>
          <div className="form-group mt-3">
            <label>Email address</label>
            <input
              type="email"
              name="email"
              className="form-control mt-1"
              placeholder="Enter email"
              onChange={onChange}
            />
          </div>
          <div className="form-group mt-3">
            <label>Password</label>
            <input
              type="password"
              name="password"
              className="form-control mt-1"
              placeholder="Enter password"
              onChange={onChange}
            />
          </div>
          <div className="d-grid gap-2 mt-3" onClick={onSubmit}>
            <button type="submit" className="btn btn-primary">
              Submit
            </button>
          </div>
          {error && <Alert variant="danger" className="mt-3">{error}</Alert>}
        </div>
      </form>
    </div>
  );
};

export default LogIn;
