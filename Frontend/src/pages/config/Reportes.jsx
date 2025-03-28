import React from "react";
import Sidebar from "../../components/layout/Sidebar";
import { FileText } from "lucide-react";

const Reportes = () => {
  return (
    <div className="flex h-screen">
      <Sidebar />

      {/* Contenido principal */}
      <main className="flex-1 bg-gray-100 p-8 overflow-y-auto">
        <h1 className="text-2xl font-bold text-gray-800 mb-1">Panel de Administración</h1>
        <p className="text-gray-600 mb-6 text-sm">
          Gestiona las olimpiadas, configura áreas y revisa inscripciones.
        </p>

        {/* Filtros */}
        <div className="grid grid-cols-3 gap-4 mb-6 text-sm">
          <select className="border rounded p-2">
            <option>Todas las áreas</option>
          </select>
          <select className="border rounded p-2">
            <option>Todos los niveles</option>
          </select>
          <select className="border rounded p-2">
            <option>Todos los estados</option>
          </select>
        </div>

        <p className="text-sm text-gray-600 mb-2">Se encontraron 45 registros con los filtros seleccionados</p>

        <div className="flex justify-end mb-4">
          <button className="bg-blue-700 text-white px-4 py-2 rounded text-sm hover:bg-blue-800 flex items-center gap-2">
            <FileText size={16} />
            Exportar
          </button>
        </div>

        {/* Tabla */}
        <div className="overflow-x-auto mb-6">
          <table className="min-w-full text-sm bg-white rounded-lg">
            <thead className="bg-gray-100 text-gray-600">
              <tr>
                <th className="px-4 py-2 text-left">Participante</th>
                <th className="px-4 py-2 text-left">Área</th>
                <th className="px-4 py-2 text-left">Nivel</th>
                <th className="px-4 py-2 text-left">Estado</th>
                <th className="px-4 py-2 text-left">Fecha</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-t">
                <td className="px-4 py-2">Juan Pérez</td>
                <td className="px-4 py-2">Matemáticas</td>
                <td className="px-4 py-2">Avanzado</td>
                <td className="px-4 py-2 text-green-600 font-medium">Inscrito</td>
                <td className="px-4 py-2">15 de enero de 2024</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Resumen */}
        <div className="grid grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="font-semibold text-gray-700 mb-2">Resumen por Área</h2>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>Matemáticas: 85 participantes</li>
              <li>Física: 62 participantes</li>
              <li>Química: 45 participantes</li>
            </ul>
          </div>

          <div className="col-span-2 bg-white rounded-lg shadow p-6">
            <h2 className="font-semibold text-gray-700 mb-2">Estado de Pagos</h2>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>Total Recaudado: <strong>Bs. 9,600</strong></li>
              <li>Pagos Pendientes: <strong>Bs. 2,250</strong></li>
              <li>Pagos Verificados: <strong className="text-green-600">85%</strong></li>
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Reportes;


