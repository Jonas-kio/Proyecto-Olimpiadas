// src/AppUsuario.jsx


import Navbar from "./components/layout/Navbar";
import Footer from "./components/layout/Footer";

import AppRouter from "./routes/AppRouter";

const AppUsuario = () => {
  return (
    <>
      <Navbar />
      <AppRouter/>
      <Footer />
    </>
  );
};

export default AppUsuario;
