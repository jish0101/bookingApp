import axios from "axios";
import React, { useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { useAuth } from "../context/UserContext";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [redirect, setRedirect] = useState(false);

  const { user, setUser } = useAuth();

  async function handleLogin(e) {
    e.preventDefault();
    try {
      const response = await axios.post('/login', { email, password }, {
        headers: {
          'Access-Control-Allow-Origin': true,
          'Content-type': 'application/json',
      }
      });
      setUser(response.data);
      setRedirect(true);
      alert("Logged In")
    } catch (err) {
      alert("Login failed");
    }
  }

  console.log(user);

  if(redirect) {
    return <Navigate to="/" />
  }

  return (
    <div className="mt-4 grow flex items-center justify-around">
      <div className="mb-64">
        <h1 className="text-4xl text-center mb-6">Login</h1>
        <form className="max-w-md mx-auto" onSubmit={handleLogin}>
          <input
            type="email"
            placeholder="Enter your email"
            autoComplete="off"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            type="password"
            placeholder="Enter your password"
            autoComplete="off"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button className="primary">Login</button>
          <div className="text-center py-2 text-gray-500">
            <p>
              Don't have an account yet?{" "}
              <Link
                to="/register"
                className="text-black hover:opacity-70 hover:underline"
              >
                Register here{" "}
              </Link>
              ♥️
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
