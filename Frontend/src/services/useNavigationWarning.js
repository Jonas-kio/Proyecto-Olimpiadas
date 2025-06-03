import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const useNavigationWarning = (hasUnsavedChanges) => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = "";
      }
    };

    const handlePopState = (e) => {
      if (
        hasUnsavedChanges &&
        !window.confirm(
          "¿Estás seguro de que deseas salir del proceso? Los datos no guardados se perderán."
        )
      ) {
        navigate(location.pathname); // Evitar navegación
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      window.removeEventListener("popstate", handlePopState);
    };
  }, [hasUnsavedChanges, navigate, location.pathname]);
};

export default useNavigationWarning;
