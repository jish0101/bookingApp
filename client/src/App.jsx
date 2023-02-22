import "./App.css";
import { Routes, Route } from "react-router-dom";
import {
  ProfilePage,
  IndexPage,
  LoginPage,
  RegisterPage,
  PlacesPage,
  PlacesForm,
  PlacePage,
  BookingPage,
  BookingsPage
} from "./pages/index";
import { Layout } from "./components";
import axios from "axios";
import UserContextProvider from "./context/UserContext";

axios.defaults.baseURL = "http://localhost:4000";
axios.defaults.withCredentials = true;

function App() {
  return (
    <>
      <UserContextProvider>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<IndexPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/account" element={<ProfilePage />} />
            <Route path="/account/places" element={<PlacesPage />} />
            <Route path="/account/places/new" element={<PlacesForm />} />
            <Route path="/account/places/:id" element={<PlacesForm />} />
            <Route path="/place/:id" element={<PlacePage />} />
            <Route path="/account/bookings" element={<BookingsPage />} />
            <Route path="/account/bookings/:id" element={<BookingPage />} />
          </Route>
        </Routes>
      </UserContextProvider>
    </>
  );
}

export default App;
