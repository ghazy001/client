import { Link, useNavigate, useLocation } from "react-router-dom";
import LoginForm from "../../../forms/LoginForm";
import { useContext, useEffect } from "react";
import { AuthContext } from "../../../context/AuthContext";
import axios from "axios";
import { toast } from "react-toastify";

const LoginArea = () => {
  const { setUser } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  // Handle Google login redirect with JWT token
  useEffect(() => {
    const query = new URLSearchParams(location.search);
    const token = query.get("token");
    const error = query.get("error");

    if (error) {
      toast.error(decodeURIComponent(error), { position: "top-center" });
      return;
    }

    if (token) {
      // Fetch user data using the JWT token
      const fetchUser = async () => {
        try {
          const response = await axios.get("http://localhost:3000/user/current-user", {
            withCredentials: true,
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          const userData = response.data;
          setUser({
            id: userData.id,
            name: userData.name,
            email: userData.email,
            role: userData.role,
          });
          toast.success("Google login successful!", { position: "top-center" });

          // Redirect based on role
          if (userData.role === "instructor" || userData.role === "admin") {
            navigate("/instructor-dashboard");
          } else {
            navigate("/courses");
          }
        } catch (err) {
          toast.error("Failed to fetch user data after Google login", {
            position: "top-center",
          });
        }
      };
      fetchUser();
    }
  }, [location, setUser, navigate]);

  const handleGoogleLogin = () => {
    window.location.href = "http://localhost:3000/auth/google";
  };

  const handleFacebookLogin = () => {
    window.location.href = "http://localhost:3000/auth/facebook";
  };

  const handleGithubLogin = () => {
    window.location.href = "http://localhost:3000/auth/github";
  };

  const handleLinkedinLogin = () => {
    window.location.href = "http://localhost:3000/auth/linkedin";
  };

  return (
    <section className="singUp-area section-py-120">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-xl-6 col-lg-8">
            <div className="singUp-wrap">
              <h2 className="title">Welcome back!</h2>
              <p>Hey there! Ready to log in? Just enter your username and password below and you'll be back in action in no time. Let's go!</p>
              <div className="account__social">
                <Link to="#" className="account__social-btn" onClick={handleGoogleLogin}>
                  <img src="/assets/img/icons/google.svg" alt="img" />
                  Continue with google
                </Link>
              </div>
              <div className="account__social m-1">
                <Link to="#" className="account__social-btn" onClick={handleFacebookLogin}>
                  <img src="/assets/img/icons/facebook.svg" alt="img" />
                  Continue with Facebook
                </Link>
              </div>
              <div className="account__social m-1">
                <Link to="#" className="account__social-btn" onClick={handleGithubLogin}>
                  <img src="https://github.com/favicon.ico" style={{ height: "20px", width: "20px" }} alt="img" />
                  Continue with Github
                </Link>
              </div>
              <div className="account__social m-1">
                <Link to="#" className="account__social-btn" onClick={handleLinkedinLogin}>
                  <img src="https://www.linkedin.com/favicon.ico" style={{ height: "20px", width: "20px" }} alt="img" />
                  Continue with Linkedin
                </Link>
              </div>
              <div className="account__divider">
                <span>or</span>
              </div>
              <LoginForm />
              <div className="account__switch">
                <p>
                  Don't have an account?<Link to="/registration">Sign Up</Link>
                </p>
                <p className="m-4">
                  Just use your Face<Link to="/FaceLogin">Face Login</Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default LoginArea;