import React ,{useState , useContext} from "react";
import { authStyles as styles } from "../assets/dummystyle";
import { useNavigate } from "react-router-dom";
import { UserContext } from "../context/UserContext";
import { validateEmail } from "../utils/helper"; 
import axios from "axios";
import { Input } from "./Input";
import axiosInstance from "../utils/axiosInstance";
import { API_PATHS } from "../utils/apiPaths";

const SignUp = ({setCurrentPage}) => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [error, setError] = useState(null);
  const { updateUser } = useContext(UserContext);
  const navigate = useNavigate();

  const handleSignUp = async (e) => {
    e.preventDefault();
    if(!fullName){
      setError("Full name is required");
      return;
    }
    if(!validateEmail(email)){
      setError("Please enter a valid email address");
      return;
    }
    if(!password){
      setError("Password is required");
      return;
    }
    setError('');

    try {
      const response = await axiosInstance.post(API_PATHS.AUTH.REGISTER, {
        name: fullName,
        email,
        password
      });
      const {token } = response.data;
      if (token) {
        localStorage.setItem("token", token);
        updateUser(response.data);
        navigate("/dashboard");
      } 
    } catch (error) {
      setError("An error occurred. Please try again.");
    }
  };

  return (
    <div className={styles.signupContainer}>
      <div className={styles.headerWrapper}>
        <h3 className={styles.signupTitle}>Create an Account</h3>
        <p className={styles.signupSubtitle}>
          Join us to explore more opportunities
        </p>
      </div>
      {/*FORM*/}
      <form onSubmit={handleSignUp} className={styles.signupForm}>
        <Input
          value={fullName}
          onChange={({target}) => setFullName(target.value)}
          label="Full Name"
          placeholder="Carl Johnson"
          type="text"
        />
        <Input
          value={email}
          onChange={({target}) => setEmail(target.value)}
          label="Email"
          placeholder="ReSume@resume.com"
          type="email"
        />
        <Input
          value={password}
          onChange={({target}) => setPassword(target.value)}
          label="Password"
          placeholder="Minimum 8 characters"
          type="password"
        />

        {error && <div className={styles.errorMessage}>{error}</div>}
        <button type="submit" className={styles.signupSubmit}>
          Create Account
        </button>

        {/*FOOTER*/}
        <p className={styles.switchText}>
          Already have an account?{" "}
          <button onClick={() => setCurrentPage("login")} type="button" className={styles.signupSwitchButton}>Sign In</button>
        </p>
      </form>
    </div>
  );
};

export default SignUp;
