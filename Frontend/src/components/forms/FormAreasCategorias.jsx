import React from "react";
import "../../styles/components/InscripcionIndividual.css";

const FormAreasCategorias = ({
  areasDisponibles,
  areasSeleccionadas,
  setAreasSeleccionadas,
  categoriasFiltradas,
  categoriaSeleccionada,
  setCategoriaSeleccionada,
  categoriasDisponibles,
  setCategoriasFiltradas,
  obtenerCategoriasPorArea,
}) => {
  console.log("Áreas disponibles recibidas:", areasDisponibles);

  // const handleAreaChange = (e) => {
  //   const valor = parseInt(e.target.value);
  //   if (valor) {
  //     setAreasSeleccionadas([valor]);
  //     setCategoriaSeleccionada("");
  //   }
  //   e.target.value = "";
  // };
  // const handleAreaChange = (e) => {
  //   const idSeleccionado = parseInt(e.target.value);
  //   const areaSeleccionada = areasDisponibles.find(
  //     (a) => a.id === idSeleccionado
  //   );
  //   if (
  //     areaSeleccionada &&
  //     !areasSeleccionadas.some((a) => a.id === idSeleccionado)
  //   ) {
  //     setAreasSeleccionadas([...areasSeleccionadas, areaSeleccionada]); //para multiples areas
  //     // setAreasSeleccionadas([areaSeleccionada]);
  //     setCategoriaSeleccionada(""); // Resetear categoría al seleccionar nueva área
  //   }
  //   e.target.value = "";
  // };
  const handleAreaChange = async (e) => {
    const idSeleccionado = parseInt(e.target.value);
    const areaSeleccionada = areasDisponibles.find(
      (a) => a.id === idSeleccionado
    );

    if (!areaSeleccionada) {
      e.target.value = "";
      return;
    }

    const yaSeleccionada = areasSeleccionadas.some(
      (a) => a.id === idSeleccionado
    );

    if (yaSeleccionada) {
      alert("Esta área ya ha sido seleccionada.");
    } else if (areasSeleccionadas.length >= 2) {
      alert("Solo puedes inscribirte en un máximo de 2 áreas.");
    } else {
      setAreasSeleccionadas([...areasSeleccionadas, areaSeleccionada]);
      setCategoriaSeleccionada(""); // Resetear categoría al cambiar de área

      try {
        const response = await obtenerCategoriasPorArea(idSeleccionado);
        console.log("Respuesta completa de categorías:", response);
        // setCategoriasFiltradas(
        //   Array.isArray(response.data.data) ? response.data.data : []
        // );
        // Asegúrate de que `.data` esté correcto según tu backend
        const cursoSeleccionado = parseInt(
          localStorage.getItem("cursoSeleccionado")
        );

        const categoriasFiltradasPorCurso = Array.isArray(response.data.data)
          ? response.data.data.filter((cat) => {
              const min = parseInt(cat.grade_min);
              const max = cat.grade_max ? parseInt(cat.grade_max) : 12;
              return cursoSeleccionado >= min && cursoSeleccionado <= max;
            })
          : [];

        setCategoriasFiltradas(categoriasFiltradasPorCurso);
      } catch (error) {
        console.error("Error al obtener categorías para el área:", error);
      }
    }

    e.target.value = "";
  };
  return (
    <>
      <h2>Selección de Áreas</h2>
      <div className="alerta">
        Puedes inscribirte en múltiples áreas. El costo se calculará en base a
        tu selección.
      </div>
      <div className="fila-categorias">
        <div className="campo">
          <label>
            Áreas de Competencia <span className="asterisco rojo">*</span>
          </label>
          <select
            name="area"
            onChange={handleAreaChange}
            defaultValue=""
            // disabled={areasSeleccionadas.length >= 2}
          >
            <option value="" disabled>
              Selecciona un área
            </option>
            {areasDisponibles
              .filter(
                (area) => !areasSeleccionadas.some((a) => a.id === area.id)
              )
              .map((area) => (
                <option key={area.id} value={area.id}>
                  {area.nombre}
                </option>
              ))}
          </select>

          {areasSeleccionadas.map((area) => (
            <span className="etiqueta-area" key={area.id}>
              {area.nombre}
              <button
                type="button"
                onClick={() =>
                  setAreasSeleccionadas(
                    areasSeleccionadas.filter((a) => a.id !== area.id)
                  )
                }
              >
                ×
              </button>
            </span>
          ))}
        </div>

        <div className="campo">
          <label>
            Nivel/Categoría <span className="asterisco rojo">*</span>
          </label>
          <select
            name="categoria"
            value={categoriaSeleccionada}
            onChange={(e) => setCategoriaSeleccionada(e.target.value)}
          >
            <option value="">Selecciona una categoría</option>
            {Array.isArray(categoriasFiltradas) &&
              categoriasFiltradas.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name} - {cat.grade_name} (mínimo: {cat.grade_min} a
                  máximo: {cat.grade_max})
                </option>
              ))}
          </select>

          {categoriaSeleccionada && (
            <div className="etiquetas-contenedor">
              <span className="etiqueta-area">
                {categoriasDisponibles.find(
                  (cat) => cat.id === parseInt(categoriaSeleccionada)
                )?.name || "Categoría"}
                <button
                  type="button"
                  onClick={() => setCategoriaSeleccionada("")}
                >
                  ×
                </button>
              </span>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default FormAreasCategorias;
