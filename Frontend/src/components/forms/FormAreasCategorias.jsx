/* eslint-disable react/prop-types */
import { useState } from "react";
import "../../styles/components/InscripcionIndividual.css";

const FormAreasCategorias = ({
  areasDisponibles,
  areasSeleccionadas,
  setAreasSeleccionadas,
  categoriasFiltradas,
  categoriasSeleccionadas,
  setCategoriasSeleccionadas,
  setCategoriasFiltradas,
  obtenerCategoriasPorArea,
  maximoAreas,
}) => {
  const [mensajeErrorAreas, setMensajeErrorAreas] = useState("");
  const [mensajeErrorNiveles, setMensajeErrorNiveles] = useState("");

  console.log("Áreas disponibles recibidas:", areasDisponibles);

  const handleAreaChange = async (e) => {
    const idSeleccionado = parseInt(e.target.value);
    const areaSeleccionada = areasDisponibles.find(
      (a) => a.id === idSeleccionado
    );

    if (!areaSeleccionada) {
      e.target.value = "";
      return;
    }

    if (areasSeleccionadas.some((a) => a.id === idSeleccionado)) {
      alert("Esta área ya ha sido seleccionada.");
      e.target.value = "";
      return;
    }

    // 🔍 Primero validamos si ya hay un área exclusiva seleccionada
    const yaTieneExclusiva = areasSeleccionadas.some((a) => a.area_exclusiva);
    if (yaTieneExclusiva) {
      setMensajeErrorAreas(
        "Ya has seleccionado un área exclusiva. No puedes elegir más áreas."
      );
      e.target.value = "";
      setTimeout(() => setMensajeErrorAreas(""), 3000);
      return;
    }

    //  Validación general del máximo permitido
    if (areasSeleccionadas.length >= maximoAreas) {
      setMensajeErrorAreas(
        `Solo puedes seleccionar un máximo de ${maximoAreas} áreas.`
      );
      e.target.value = "";
      setTimeout(() => setMensajeErrorAreas(""), 3000);
      return;
    }

    // Validación específica si el área seleccionada es exclusiva
    if (areaSeleccionada.area_exclusiva && areasSeleccionadas.length > 0) {
      setMensajeErrorAreas(
        `El área "${areaSeleccionada.nombre}" es exclusiva y no puede combinarse con otras áreas.`
      );
      e.target.value = "";
      setTimeout(() => setMensajeErrorAreas(""), 3000);
      return;
    }

    //Si pasa todas las validaciones, agregar el área
    const nuevasAreas = [...areasSeleccionadas, areaSeleccionada];
    setAreasSeleccionadas(nuevasAreas);
    setCategoriasSeleccionadas([]);
    setCategoriasFiltradas([]);

    // Obtener categorías válidas
    const cursoSeleccionado = localStorage.getItem("cursoSeleccionado");
    const cursosOrdenados = [
      "3ro Primaria",
      "4to Primaria",
      "5to Primaria",
      "6to Primaria",
      "1ro Secundaria",
      "2do Secundaria",
      "3ro Secundaria",
      "4to Secundaria",
      "5to Secundaria",
      "6to Secundaria",
    ];
    let todasLasCategorias = [];

    for (const area of nuevasAreas) {
      try {
        const response = await obtenerCategoriasPorArea(area.id);
        const categorias = Array.isArray(response.data.data)
          ? response.data.data
          : [];

        const filtradas = categorias.filter((cat) => {
          // Concatenamos nivel (grade_name) y curso (grade_min) para formar el formato del curso
          const minCurso = `${cat.grade_min} ${cat.grade_name}`.trim();
          const maxCurso = cat.grade_max
            ? `${cat.grade_max} ${cat.grade_name}`.trim()
            : minCurso;

          const indexSeleccionado = cursosOrdenados.indexOf(cursoSeleccionado);
          const indexMin = cursosOrdenados.indexOf(minCurso);
          const indexMax = cursosOrdenados.indexOf(maxCurso);

          console.log(
            `Comparando ${cursoSeleccionado} con rango ${minCurso} - ${maxCurso}`
          );
          console.log(
            `Índices: curso=${indexSeleccionado}, min=${indexMin}, max=${indexMax}`
          );

          return (
            indexSeleccionado !== -1 &&
            indexMin !== -1 &&
            indexSeleccionado >= indexMin &&
            indexSeleccionado <= indexMax
          );
        });
        todasLasCategorias = [...todasLasCategorias, ...filtradas];
      } catch (error) {
        console.error(
          `Error al obtener categorías del área ${area.nombre}:`,
          error
        );
      }
    }

    setCategoriasFiltradas(todasLasCategorias);
    e.target.value = "";
  };

  return (
    <>
      <h2>Selección de Áreas</h2>
      <p style={{ marginTop: "10px", fontWeight: "bold" }}>
        Máximo de áreas permitidas: {maximoAreas}
      </p>
      <div className="alerta">
        Puedes inscribirte en múltiples áreas. El costo se calculará en base a
        tu selección.
      </div>
      <div className="fila-categorias">
        <div className="campo">
          <label>
            Áreas de Competencia <span className="asterisco rojo">*</span>
          </label>
          <select name="area" onChange={handleAreaChange} defaultValue="">
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
                  {area.nivel_unico ? " (Nivel Único)" : ""}
                  {area.area_exclusiva ? " (Área Exclusiva)" : ""}
                </option>
              ))}
          </select>

          <div className="etiquetas-contenedor">
            {areasSeleccionadas.map((area) => (
              <span className="etiqueta-area" key={area.id}>
                {area.nombre}
                {area.nivel_unico && (
                  <span style={{ color: "green", marginLeft: "5px" }}>
                    Nivel Único
                  </span>
                )}
                {area.area_exclusiva && (
                  <span style={{ color: "red", marginLeft: "5px" }}>
                    Área Exclusiva
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => {
                    setAreasSeleccionadas(
                      areasSeleccionadas.filter((a) => a.id !== area.id)
                    );
                    setCategoriasFiltradas(
                      categoriasFiltradas.filter(
                        (cat) => cat.area_id !== area.id
                      )
                    );
                    setCategoriasSeleccionadas(
                      categoriasSeleccionadas.filter(
                        (cat) => cat.area_id !== area.id
                      )
                    );
                  }}
                >
                  ×
                </button>
              </span>
            ))}
          </div>
          {/* Mensaje de error debajo de las etiquetas */}
          {mensajeErrorAreas && (
            <p style={{ color: "red", marginTop: "8px" }}>
              {mensajeErrorAreas}
            </p>
          )}
        </div>

        <div className="campo">
          <label>
            Nivel/Categoría <span className="asterisco rojo">*</span>
          </label>
          <select
            name="categoria"
            value=""
            onChange={(e) => {
              const nivelId = parseInt(e.target.value);
              if (!nivelId) return;

              const nivelObj = categoriasFiltradas.find(
                (cat) => cat.id === nivelId
              );
              if (!nivelObj) return;

              const area = areasDisponibles.find(
                (a) => a.id === nivelObj.area_id
              );
              const nombreArea = area ? area.nombre : "Área desconocida";

              if (area?.nivel_unico) {
                const yaExiste = categoriasSeleccionadas.some(
                  (cat) => cat.area_id === nivelObj.area_id
                );
                if (yaExiste) {
                  setMensajeErrorNiveles(
                    `El área "${nombreArea}" solo permite un nivel.`
                  );
                  setTimeout(() => setMensajeErrorNiveles(""), 3000);
                  e.target.value = "";
                  return;
                }
              }

              // Si pasa las validaciones, agrega la categoría
              if (!categoriasSeleccionadas.some((cat) => cat.id === nivelId)) {
                setCategoriasSeleccionadas([
                  ...categoriasSeleccionadas,
                  nivelObj,
                ]);
              }

              e.target.value = ""; // Limpiar selección
            }}
          >
            <option value="">
              {categoriasFiltradas.length === 0
                ? "No existen niveles en las áreas seleccionadas"
                : "Selecciona una categoría"}
            </option>
            {categoriasFiltradas
              .filter(
                (cat) =>
                  !categoriasSeleccionadas.some((sel) => sel.id === cat.id)
              )
              .map((cat) => {
                // Encuentra el nombre del área correspondiente a cada categoría
                const area = areasDisponibles.find((a) => a.id === cat.area_id);
                const nombreArea = area ? area.nombre : "Área desconocida";
                return (
                  <option
                    key={cat.id}
                    value={cat.id}
                    className="option-categoria"
                  >
                    [{nombreArea}] {cat.name} - {cat.grade_name} (
                    {cat.grade_min} - {cat.grade_max})
                  </option>
                );
              })}
          </select>

          {categoriasSeleccionadas.length > 0 && (
            <div className="etiquetas-contenedor">
              {categoriasSeleccionadas.map((cat) => {
                const area = areasDisponibles.find((a) => a.id === cat.area_id);
                const nombreArea = area ? area.nombre : "Área desconocida";
                return (
                  <span className="etiqueta-area" key={cat.id}>
                    [{nombreArea}] {cat.name} - {cat.grade_name}
                    {/* - (curso:{" "}
                    {cat.grade_min}) */}
                    <button
                      type="button"
                      onClick={() =>
                        setCategoriasSeleccionadas(
                          categoriasSeleccionadas.filter((c) => c.id !== cat.id)
                        )
                      }
                    >
                      ×
                    </button>
                  </span>
                );
              })}
            </div>
          )}
          {mensajeErrorNiveles && (
            <p style={{ color: "red", marginTop: "8px" }}>
              {mensajeErrorNiveles}
            </p>
          )}
        </div>
      </div>
    </>
  );
};

export default FormAreasCategorias;
