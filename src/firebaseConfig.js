import { auth, googleProvider } from "../firebaseConfig";
import { signInWithPopup, signOut } from "firebase/auth";

const Login = ({ user }) => {
  const loginWithGoogle = () => {
    signInWithPopup(auth, googleProvider)
      .catch((error) => console.error("Login failed:", error));
  };

  return (
    <div style={{ padding: '20px', textAlign: 'center' }}>
      {!user ? (
        <button onClick={loginWithGoogle} className="purple-btn">
          Coach Login (Google)
        </button>
      ) : (
        <div>
          <p>Logged in as: {user.email}</p>
          <button onClick={() => signOut(auth)}>Logout</button>
        </div>
      )}
    </div>
  );
};

export default Login;
