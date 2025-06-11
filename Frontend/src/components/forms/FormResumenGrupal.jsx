import PropTypes from "prop-types";
import { useState, useEffect, useCallback, useRef } from "react";
import "../../styles/components/InscripcionIndividual.css";
import { calcularCostosGrupales } from "../../services/inscripcionGrupalService";
import { getAllCosts } from "../../services/costosService";

const FormResumenGrupal = ({ tutores, competidores, asignacionesAreasYCategorias, procesoId }) => {
  const [confirmado, setConfirmado] = useState(false);
  const [costosCalculados, setCostosCalculados] = useState(null);
  const [calculandoCostos, setCalculandoCostos] = useState(false);
  const [todosLosCostos, setTodosLosCostos] = useState([]);
  
  // Ref para rastrear si ya se están calculando costos para evitar bucles
  const calculandoRef = useRef(false);

  // Cargar todos los costos disponibles al montar el componente
  useEffect(() => {
    const cargarCostos = async () => {
      try {
        const costos = await getAllCosts();
        console.log("📊 Costos cargados desde API:", costos);
        setTodosLosCostos(costos);
      } catch (error) {
        console.error("❌ Error al cargar costos:", error);
        setTodosLosCostos([]);
      }
    };

    cargarCostos();
  }, []);
  // Función para calcular costos estimados basados en datos locales
  const calcularCostosEstimados = useCallback((asignaciones, competidoresData, costosDisponibles) => {
    console.log("🧮 Calculando costos estimados con:", {
      asignaciones: asignaciones?.length || 0,
      competidores: competidoresData?.length || 0,
      costos: costosDisponibles?.length || 0
    });

    if (!asignaciones || asignaciones.length === 0) {
      // Si no hay asignaciones, usar un costo promedio
      const costoPorDefecto = 50;
      const totalEstimado = competidoresData.length * costoPorDefecto;
      return {
        monto_total: totalEstimado,
        monto_total_formateado: totalEstimado.toFixed(2),
        desglose_costos: [],
        total_competidores: competidoresData.length,
        esEstimado: true
      };
    }

    // Agrupar asignaciones por área-nivel
    const combinaciones = {};
    asignaciones.forEach((asignacion, index) => {
      const key = `${asignacion.areaId}_${asignacion.categoriaId}`;
      if (!combinaciones[key]) {
        combinaciones[key] = {
          areaId: asignacion.areaId,
          categoriaId: asignacion.categoriaId,
          areaSeleccionada: asignacion.areaSeleccionada,
          categoriaSeleccionada: asignacion.categoriaSeleccionada,
          competidores: []
        };
      }
      combinaciones[key].competidores.push(competidoresData[index]);
    });

    let montoTotal = 0;
    const desgloseCostos = [];    Object.values(combinaciones).forEach(combinacion => {
      // Buscar el costo para esta combinación área-nivel
      const costoEncontrado = costosDisponibles.find(costo => 
        costo.area_id == combinacion.areaId && costo.category_id == combinacion.categoriaId
      );

      // Convertir price a número (viene como string desde la API)
      const costoUnitario = costoEncontrado ? parseFloat(costoEncontrado.price) : 50; // Valor por defecto
      const cantidadCompetidores = combinacion.competidores.length;
      const subtotal = costoUnitario * cantidadCompetidores;

      desgloseCostos.push({
        area: {
          id: combinacion.areaId,
          nombre: combinacion.areaSeleccionada?.nombre || `Área ${combinacion.areaId}`
        },
        nivel: {
          id: combinacion.categoriaId,
          nombre: combinacion.categoriaSeleccionada?.name || `Categoría ${combinacion.categoriaId}`
        },
        costo_unitario: costoUnitario,
        costo_unitario_formateado: costoUnitario.toFixed(2),
        subtotal: subtotal,
        subtotal_formateado: subtotal.toFixed(2),
        cantidad_competidores: cantidadCompetidores
      });

      montoTotal += subtotal;
    });

    return {
      monto_total: montoTotal,
      monto_total_formateado: montoTotal.toFixed(2),
      desglose_costos: desgloseCostos,
      total_competidores: competidoresData.length,
      esEstimado: true
    };
  }, []); // Dependencias vacías porque la función es pura  // Calcular costos reales cuando el componente se monta
  useEffect(() => {
    const calcularCostosReales = async () => {
      console.log("🔍 FormResumenGrupal - Iniciando cálculo de costos:", {
        procesoId,
        asignacionesLength: asignacionesAreasYCategorias?.length || 0,
        competidoresLength: competidores?.length || 0,
        asignaciones: asignacionesAreasYCategorias,
        todosLosCostosLength: todosLosCostos?.length || 0,
        yaCalculando: calculandoRef.current
      });

      // Evitar cálculos si ya estamos calculando o si no tenemos datos básicos
      if (calculandoRef.current || !procesoId || !competidores || competidores.length === 0) {
        console.log("⚠️ Saltando cálculo:", { 
          calculandoRef: calculandoRef.current, 
          procesoId: !!procesoId, 
          competidores: competidores?.length || 0 
        });
        return;
      }

      // Marcar que estamos calculando
      calculandoRef.current = true;
      setCalculandoCostos(true);      try {
        // Primero intentar cálculo estimado basado en datos locales
        // Priorizar competidores CSV sobre asignaciones manuales
        if (competidores.some(comp => comp.area_id && comp.nivel_id) && todosLosCostos.length > 0) {
          console.log("📊 Usando cálculo estimado con datos CSV");
          // Para CSV, crear asignaciones simuladas a partir de los datos de competidores
          const asignacionesCSV = competidores.map((comp) => ({
            areaId: comp.area_id,
            categoriaId: comp.nivel_id,
            areaSeleccionada: { nombre: comp.area || `Área ${comp.area_id}` },
            categoriaSeleccionada: { name: comp.nivel || `Nivel ${comp.nivel_id}` }
          }));
          const costosEstimados = calcularCostosEstimados(asignacionesCSV, competidores, todosLosCostos);
          setCostosCalculados(costosEstimados);
          return;
        } else if (asignacionesAreasYCategorias && asignacionesAreasYCategorias.length > 0 && todosLosCostos.length > 0) {
          console.log("📊 Usando cálculo estimado con asignaciones manuales");
          const costosEstimados = calcularCostosEstimados(asignacionesAreasYCategorias, competidores, todosLosCostos);
          setCostosCalculados(costosEstimados);
          return;
        }// Determinar la fuente de datos para el cálculo (priorizar datos CSV sobre asignaciones manuales)
        let areasIds = [];
        let nivelesIds = [];
        
        if (competidores.some(comp => comp.area_id && comp.nivel_id)) {
          // Para competidores cargados desde CSV que ya tienen area_id y nivel_id - mantener correspondencia 1:1
          areasIds = competidores.filter(comp => comp.area_id).map(comp => parseInt(comp.area_id));
          nivelesIds = competidores.filter(comp => comp.nivel_id).map(comp => parseInt(comp.nivel_id));
          console.log("📊 Usando datos CSV para cálculo de costos:", {
            competidores: competidores.length,
            areasIds,
            nivelesIds
          });
        } else if (asignacionesAreasYCategorias && asignacionesAreasYCategorias.length > 0) {
          // Para competidores registrados manualmente - mantener correspondencia 1:1
          areasIds = asignacionesAreasYCategorias.map(asig => parseInt(asig.areaId));
          nivelesIds = asignacionesAreasYCategorias.map(asig => parseInt(asig.categoriaId));
          console.log("📊 Usando asignaciones manuales para cálculo de costos:", {
            asignaciones: asignacionesAreasYCategorias.length,
            areasIds,
            nivelesIds
          });
        } else {
          // No hay datos suficientes para calcular costos reales
          console.log("⚠️ No hay datos suficientes para calcular costos reales, esperando asignaciones...");
          // Calcular costo estimado basado en número de competidores solo una vez
          const costoPorCompetidor = 50; // Valor por defecto
          const costoEstimado = competidores.length * costoPorCompetidor;
          setCostosCalculados({
            monto_total: costoEstimado,
            monto_total_formateado: costoEstimado.toFixed(2),
            desglose_costos: [],
            total_competidores: competidores?.length || 0,
            esEstimado: true // Bandera para indicar que es estimado
          });
          return;
        }

        if (areasIds.length === 0 || nivelesIds.length === 0) {
          console.log("⚠️ No se encontraron áreas o niveles para calcular costos");
          return;
        }

        console.log("📊 Calculando costos grupales con:", { areasIds, nivelesIds, procesoId });
        
        const response = await calcularCostosGrupales(procesoId, areasIds, nivelesIds);
        
        if (response.data.success) {
          setCostosCalculados(response.data.data);
          console.log("✅ Costos grupales calculados:", response.data.data);
        }
      } catch (error) {
        console.error("❌ Error al calcular costos grupales:", error);
        // Usar valores por defecto en caso de error
        setCostosCalculados({
          monto_total: competidores.length * 50,
          monto_total_formateado: (competidores.length * 50).toFixed(2),
          desglose_costos: []
        });
      } finally {
        calculandoRef.current = false;
        setCalculandoCostos(false);
      }
    };    calcularCostosReales();
  }, [asignacionesAreasYCategorias, competidores, procesoId, todosLosCostos, calcularCostosEstimados]);
  // Valores de costos (usar calculados o fallback)
  const costoTotalFormateado = costosCalculados ? costosCalculados.monto_total_formateado : (competidores.length * 50).toFixed(2);

  return (
    <div className="formulario confirmacion">
      <h2 className="titulo-confirmacion">Confirmación de Inscripción Grupal</h2>
      <p className="subtitulo-confirmacion">
        Por favor revise la información ingresada antes de confirmar la inscripción grupal.
      </p>

      {/* Sección: Información General */}
      <div className="seccion">
        <h3>Información General</h3>
        <div className="fila-resumen">
          <span className="etiqueta">Tipo de Inscripción:</span>
          <span className="valor">Grupal</span>
        </div>
        <div className="fila-resumen">
          <span className="etiqueta">Total de Competidores:</span>
          <span className="valor highlight">{competidores.length}</span>
        </div>
        <div className="fila-resumen">
          <span className="etiqueta">Total de Tutores:</span>
          <span className="valor">{tutores.length}</span>
        </div>
        <div className="fila-resumen">
          <span className="etiqueta">Fecha de Registro:</span>
          <span className="valor">{new Date().toLocaleDateString('es-BO')}</span>
        </div>
      </div>

      {/* Sección: Tutores */}
      {tutores && tutores.length > 0 && (
        <div className="seccion">
          <h3>Datos de los Tutores ({tutores.length})</h3>
          {tutores.map((tutor, index) => (
            <div className="fila-resumen" key={index}>
              <div className="subseccion-tutor">
                <h4 className="subtitulo-tutor">
                  {index === 0 ? "Tutor Principal" : `Tutor Adicional ${index}`}
                </h4>
                <div>
                  <span className="etiqueta">Nombre completo:</span>{" "}
                  <span className="valor">
                    {tutor.nombres} {tutor.apellidos}
                  </span>
                </div>
                <div>
                  <span className="etiqueta">Contacto:</span>{" "}
                  <span className="valor">
                    {tutor.correo_electronico} / {tutor.telefono}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Sección: Competidores */}
      {competidores && competidores.length > 0 && (
        <div className="seccion">
          <h3>Competidores Registrados ({competidores.length})</h3>
          <div className="tabla-competidores">
            {competidores.map((competidor, index) => (
              <div key={index} className="competidor-item">
                <div className="competidor-numero">#{index + 1}</div>
                <div className="competidor-info">
                  <div className="fila-resumen">
                    <span className="etiqueta">Nombre completo:</span>
                    <span className="valor">{competidor.nombres} {competidor.apellidos}</span>
                  </div>
                  <div className="fila-resumen">
                    <span className="etiqueta">Documento:</span>
                    <span className="valor">CI: {competidor.documento_identidad}</span>
                  </div>
                  <div className="fila-resumen">
                    <span className="etiqueta">Colegio:</span>
                    <span className="valor">{competidor.colegio}</span>
                  </div>
                  <div className="fila-resumen">
                    <span className="etiqueta">Curso:</span>
                    <span className="valor">{competidor.curso}</span>
                  </div>
                  <div className="fila-resumen">
                    <span className="etiqueta">Provincia:</span>
                    <span className="valor">{competidor.provincia}</span>
                  </div>
                  <div className="fila-resumen">
                    <span className="etiqueta">Contacto:</span>
                    <span className="valor">{competidor.correo_electronico}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}      {/* Sección: Áreas de Competencia */}
      {asignacionesAreasYCategorias && asignacionesAreasYCategorias.length > 0 ? (
        <div className="seccion">
          <h3>Distribución por Áreas de Competencia</h3>
          <div className="areas-asignadas">
            {asignacionesAreasYCategorias.map((asignacion, index) => {
              const competidor = competidores[index];
              if (!competidor) return null;
              
              return (
                <div key={index} className="fila-resumen">
                  <span className="etiqueta">
                    {competidor.nombres} {competidor.apellidos}:
                  </span>
                  <span className="valor">
                    {asignacion.areaSeleccionada?.nombre || `Área ${asignacion.areaId}`} - 
                    {asignacion.categoriaSeleccionada?.name || `Categoría ${asignacion.categoriaId}`}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        // Mostrar áreas directamente desde competidores CSV si no hay asignaciones manuales
        competidores.some(comp => comp.area || comp.nivel) && (
          <div className="seccion">
            <h3>Distribución por Áreas de Competencia</h3>
            <div className="areas-asignadas">
              {competidores.map((competidor, index) => {
                if (!competidor.area && !competidor.nivel) return null;
                
                return (
                  <div key={index} className="fila-resumen">
                    <span className="etiqueta">
                      {competidor.nombres} {competidor.apellidos}:
                    </span>
                    <span className="valor">
                      {competidor.area || 'Área no especificada'} - {competidor.nivel || 'Nivel no especificado'}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )
      )}{/* Sección: Costos */}
      <div className="seccion">
        <h3>Costo de Inscripción</h3>
        {calculandoCostos ? (
          <div className="fila-resumen">
            <span className="etiqueta">Calculando costos...</span>
            <span className="valor">⏳</span>
          </div>
        ) : (
          <>
            <div className="fila-resumen">
              <span className="etiqueta">Cantidad de Competidores:</span>
              <span className="valor">{competidores.length}</span>
            </div>
            
            {costosCalculados && costosCalculados.desglose_costos && costosCalculados.desglose_costos.length > 0 ? (
              <>
                <div className="fila-resumen">
                  <span className="etiqueta">Desglose por área:</span>
                </div>
                {costosCalculados.desglose_costos.map((item, index) => (
                  <div className="fila-resumen" key={index} style={{ marginLeft: "20px" }}>
                    <span className="etiqueta">
                      {item.area?.nombre || 'Área'} ({item.cantidad_competidores} competidor{item.cantidad_competidores !== 1 ? 'es' : ''}):
                    </span>
                    <span className="valor">Bs. {item.subtotal_formateado}</span>
                  </div>
                ))}
              </>
            ) : (
              <div className="fila-resumen">
                <span className="etiqueta">Costo estimado por competidor:</span>
                <span className="valor">Bs. 50.00</span>
              </div>
            )}
              <div className="fila-resumen total">
              <span className="etiqueta">Total a Pagar:</span>              <span className="valor">
                Bs. {costoTotalFormateado}
              </span>
            </div>
          </>
        )}
      </div>

      {/* Información Importante */}
      <div className="seccion">
        <h3>Información Importante</h3>
        <ul className="areas-lista">
          <li>Una vez generada la boleta, no se podrán realizar cambios en la inscripción</li>
          <li>Deberá realizar el pago correspondiente para completar la inscripción</li>
          <li>Mantenga el código de boleta para futuras consultas</li>
          <li>Recibirá un correo electrónico con los detalles de la boleta</li>
        </ul>
      </div>      {/* Aceptar términos */}
      <div className="terminos" style={{ marginTop: "20px" }}>
        <label>
          <input
            type="checkbox"
            checked={confirmado}
            onChange={(e) => setConfirmado(e.target.checked)}
            required
          />
          Confirmo que toda la información es correcta y acepto los términos y condiciones de la Olimpiada Oh! SanSi
        </label>
      </div>
    </div>
  );
};

FormResumenGrupal.propTypes = {
  tutores: PropTypes.arrayOf(PropTypes.shape({
    nombres: PropTypes.string.isRequired,
    apellidos: PropTypes.string.isRequired,
    correo_electronico: PropTypes.string.isRequired,
    telefono: PropTypes.string.isRequired
  })).isRequired,
  competidores: PropTypes.arrayOf(PropTypes.shape({
    nombres: PropTypes.string.isRequired,
    apellidos: PropTypes.string.isRequired,
    documento_identidad: PropTypes.string.isRequired,
    colegio: PropTypes.string.isRequired,
    curso: PropTypes.string.isRequired,
    provincia: PropTypes.string,
    correo_electronico: PropTypes.string,
    area: PropTypes.string, // Opcional para competidores CSV
    nivel: PropTypes.string, // Opcional para competidores CSV
    area_id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]), // Opcional para competidores CSV
    nivel_id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]) // Opcional para competidores CSV
  })).isRequired,
  asignacionesAreasYCategorias: PropTypes.arrayOf(PropTypes.shape({
    areaId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    categoriaId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    areaSeleccionada: PropTypes.object,
    categoriaSeleccionada: PropTypes.object
  })).isRequired,
  procesoId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired
};

export default FormResumenGrupal;
