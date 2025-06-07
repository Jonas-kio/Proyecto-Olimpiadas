import "../../styles/components/Navbar.css";
import { useState, useEffect } from "react";
import { FaSignInAlt, FaUserPlus, FaSignOutAlt, FaBars } from "react-icons/fa";
import { useLocation, useNavigate } from "react-router-dom";

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [menuAbierto, setMenuAbierto] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem("token");
      setIsAuthenticated(token !== null);
    };

    checkAuth();

    window.addEventListener("storage", checkAuth);

    return () => {
      window.removeEventListener("storage", checkAuth);
    };
  }, []);

  const toggleMenu = () => {
    setMenuAbierto((prev) => !prev);
  };

  const cerrarMenu = () => setMenuAbierto(false);

  const handleScrollToAreas = () => {
    if (location.pathname === "/" || location.pathname === "/user/inicio") {
      const seccion = document.querySelector(".areas-section");
      if (seccion) {
        seccion.scrollIntoView({ behavior: "smooth" });
      }
    } else {
      navigate(isAuthenticated ? "/user/inicio" : "/");
      setTimeout(() => {
        const seccion = document.querySelector(".areas-section");
        if (seccion) {
          seccion.scrollIntoView({ behavior: "smooth" });
        }
      }, 100);
    }
    cerrarMenu();
  };

  const handleScrollToFooter = () => {
    if (location.pathname === "/" || location.pathname === "/user/inicio") {
      const footer = document.querySelector("footer");
      if (footer) {
        footer.scrollIntoView({ behavior: "smooth" });
      }
    } else {
      navigate(isAuthenticated ? "/user/inicio" : "/");
      setTimeout(() => {
        const footer = document.querySelector("footer");
        if (footer) {
          footer.scrollIntoView({ behavior: "smooth" });
        }
      }, 100);
    }
    cerrarMenu();
  };

  const handleLogin = () => {
    navigate("/login");
    cerrarMenu();
  };

  const handleRegister = () => {
    navigate("/registrar");
    cerrarMenu();
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userRole");
    setIsAuthenticated(false);

    navigate("/");
    cerrarMenu();
  };

  return (
    <nav className={`navbar ${menuAbierto ? "show" : ""}`}>
      <div className="navbar-left">
        <div className="logo-circle">O!</div>
        <span className="logo-text">Oh! SanSi</span>
      </div>

      <div className="menu-toggle" onClick={toggleMenu}>
        <FaBars />
      </div>

      <div className="navbar-center">
        <a
          href="#"
          onClick={() => {
            navigate(isAuthenticated ? "/user/inicio" : "/");
            cerrarMenu();
          }}
        >
          Inicio
        </a>
        <a href="#" onClick={handleScrollToAreas}>
          Áreas
        </a>
        {isAuthenticated && (
          <>
            <a
              href="#"
              onClick={() => {
                navigate("/user/inscripcion");
                cerrarMenu();
              }}
            >
              Inscripción
            </a>
            <a
              href="#"
              onClick={() => {
                navigate("/user/mis-inscripciones");
                cerrarMenu();
              }}
            >
              Detalle de Inscripción
            </a>
          </>
        )}
        <a href="#" onClick={handleScrollToFooter}>
          Contacto
        </a>
      </div>

      <div className="navbar-right">
        {isAuthenticated ? (
          <button className="btn logout-btn" onClick={handleLogout}>
            <FaSignOutAlt className="icon" /> Cerrar Sesión
          </button>
        ) : (
          <>
            <button className="btn login-btn" onClick={handleLogin}>
              <FaSignInAlt className="icon" /> Ingresar
            </button>
            <button className="btn register-btn" onClick={handleRegister}>
              <FaUserPlus className="icon" /> Registrarse
            </button>
          </>
        )}
      </div>

      {/* Menú desplegable móvil */}
      <div className="navbar-responsive">
        <a
          href="#"
          onClick={() => {
            navigate(isAuthenticated ? "/user/inicio" : "/");
            cerrarMenu();
          }}
        >
          Inicio
        </a>
        <a href="#" onClick={handleScrollToAreas}>
          Áreas
        </a>
        {isAuthenticated && (
          <>
            <a
              href="#"
              onClick={() => {
                navigate("/user/inscripcion");
                cerrarMenu();
              }}
            >
              Inscripción
            </a>
            <a
              href="#"
              onClick={() => {
                navigate("/user/detalle-inscripcion");
                cerrarMenu();
              }}
            >
              Detalle de Inscripción
            </a>
          </>
        )}
        <a href="#" onClick={handleScrollToFooter}>
          Contacto
        </a>
        <div className="responsive-btn-group">
          {isAuthenticated ? (
            <button className="btn logout-btn" onClick={handleLogout}>
              <FaSignOutAlt className="icon" /> Cerrar Sesión
            </button>
          ) : (
            <>
              <button className="btn login-btn" onClick={handleLogin}>
                <FaSignInAlt className="icon" /> Ingresar
              </button>
              <button className="btn register-btn" onClick={handleRegister}>
                <FaUserPlus className="icon" /> Registrarse
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
