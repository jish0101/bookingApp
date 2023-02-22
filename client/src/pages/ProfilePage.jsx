import axios from "axios";
import React, { useState } from "react";
import { Navigate, useParams } from "react-router-dom";
import { PlacesPage } from ".";
import { AccountNavigation } from "../components/index";
import { useAuth } from "../context/UserContext";

export default function ProfilePage() {
  const { user, loading, setUser, setLoading } = useAuth();
  const [redirect, setRedirect] = useState(false);

  let { subpage } = useParams();
  if (subpage === undefined) {
    subpage = "profile";
  }

  if (loading) {
    return <div className="text-center mt-20">Loading...</div>;
  }

  if (!loading && !user && !redirect) {
    return <Navigate to="/login" />;
  }

  async function logout() {
    setLoading(true);
    const response = await axios.post("/logout");
    if (response.status === 200) {
      setUser(null);
      setRedirect(true);
    }
    setLoading(false);
  }

  if (redirect) {
    return <Navigate to={"/"} />;
  }

  return (
    <div>
      <AccountNavigation />
      {subpage === "profile" && (
        <div className="text-center max-w-lg mx-auto">
          Logged in as {user?.name} ({user?.email}) <br />
          <button
            disabled={loading}
            className="primary max-w-sm mt-2"
            onClick={logout}
          >
            Logout
          </button>
        </div>
      )}
      {subpage === "places" && <PlacesPage />}
    </div>
  );
}
