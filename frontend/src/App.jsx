import { useState } from "react";

function App() {
  const tipos = {
    0: "int",
    1: "float64",
    2: "string",
    3: "bool",
    4: "rune",
    5: "slice",
    6: "nil",
    7: "error",
    8: "struct",
  };
  const [codigo, setCodigo] = useState(`func main() {
  int a = 10;
  float64 b = 20.5;
  mensaje := "Resultado:";
  fmt.Println(mensaje, a + b);
}`);
  const [salida, setSalida] = useState("");
  const [errores, setErrores] = useState([]);
  const [tablaSimbolos, setTablaSimbolos] = useState([]);
  const [astDot, setAstDot] = useState("");
  const [cargando, setCargando] = useState(false);
  const [lineaActual, setLineaActual] = useState(1);
  const [nombreArchivo, setNombreArchivo] = useState("nuevo.gst");
  const astGraphvizUrl = astDot
    ? `https://quickchart.io/graphviz?graph=${encodeURIComponent(astDot)}`
    : "";

  const getLineaActual = (elemento) => {
    const texto = elemento.value.substring(0, elemento.selectionStart);
    return texto.split("\n").length;
  };

  const ejecutar = async () => {
    setCargando(true);
    setSalida("");
    setErrores([]);
    setTablaSimbolos([]);
    setAstDot("");

    try {
      const response = await fetch("http://localhost:8001/api/parser/analizar", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ codigo }),
      });

      const data = await response.json();

      if (!response.ok) {
        const detalle =
          data?.errores?.[0]?.descripcion ||
          data?.error ||
          "No se pudo ejecutar el análisis";
        throw new Error(detalle);
      }

      setSalida(data?.consola ?? "");
      setErrores(Array.isArray(data?.errores) ? data.errores : []);
      setTablaSimbolos(Array.isArray(data?.tablaSimbolos) ? data.tablaSimbolos : []);
      setAstDot(data?.astDot ?? "");
    } catch (error) {
      setErrores([
        {
          tipo: "Error",
          descripcion: error.message || "Error inesperado",
        },
      ]);
    } finally {
      setCargando(false);
    }
  };

  const crearArchivo = () => {
    setCodigo("");
    setNombreArchivo("nuevo.gst");
    setSalida("");
    setErrores([]);
    setTablaSimbolos([]);
    setAstDot("");
    setLineaActual(1);
  };

  const abrirArchivo = (event) => {
    const archivo = event.target.files?.[0];
    if (!archivo) return;
    const lector = new FileReader();
    lector.onload = () => {
      setCodigo(String(lector.result ?? ""));
      setNombreArchivo(archivo.name);
      setLineaActual(1);
    };
    lector.readAsText(archivo);
    event.target.value = "";
  };

  const guardarArchivo = () => {
    const blob = new Blob([codigo], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const enlace = document.createElement("a");
    const nombre = nombreArchivo.endsWith(".gst") ? nombreArchivo : `${nombreArchivo}.gst`;
    enlace.href = url;
    enlace.download = nombre;
    enlace.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="container">
      <h1 className="titulo">GoScript IDE - OLC1 Proyecto 2</h1>
      <div className="toolbar">
        <button onClick={crearArchivo} className="boton secundario">Nuevo</button>
        <label className="boton secundario archivo-label">
          Abrir .gst
          <input type="file" accept=".gst,.txt" onChange={abrirArchivo} />
        </label>
        <button onClick={guardarArchivo} className="boton secundario">Guardar .gst</button>
        <button onClick={ejecutar} disabled={cargando} className="boton">
          {cargando ? "Ejecutando..." : "Ejecutar"}
        </button>
        <span className="estado-editor">Archivo: {nombreArchivo} | Linea: {lineaActual}</span>
      </div>

      <div className="paneles">
        <div className="panel">
          <h2>Entrada</h2>
          <textarea
            value={codigo}
            onChange={(e) => {
              setCodigo(e.target.value);
              setLineaActual(getLineaActual(e.target));
            }}
            onClick={(e) => setLineaActual(getLineaActual(e.target))}
            onKeyUp={(e) => setLineaActual(getLineaActual(e.target))}
            className="textarea"
            placeholder="Escribe el código aquí..."
          />
        </div>

        <div className="panel">
          <h2>Consola</h2>
          <pre className="salida">{salida || "Sin salida todavía..."}</pre>

          <h2>Reporte de errores</h2>
          <table className="tabla">
            <thead>
              <tr>
                <th>Tipo</th>
                <th>Descripcion</th>
                <th>Linea</th>
                <th>Columna</th>
              </tr>
            </thead>
            <tbody>
              {errores.length === 0 ? (
                <tr><td colSpan="4">Sin errores.</td></tr>
              ) : (
                errores.map((error, index) => (
                  <tr key={index}>
                    <td>{error.tipo ?? "-"}</td>
                    <td>{error.descripcion ?? "-"}</td>
                    <td>{error.linea ?? "-"}</td>
                    <td>{error.columna ?? "-"}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="reportes">
        <div className="panel">
          <h2>Reporte Tabla de Simbolos</h2>
          <table className="tabla">
            <thead>
              <tr>
                <th>Identificador</th>
                <th>Tipo</th>
                <th>Valor</th>
                <th>Entorno</th>
              </tr>
            </thead>
            <tbody>
              {tablaSimbolos.length === 0 ? (
                <tr><td colSpan="4">Sin simbolos.</td></tr>
              ) : (
                tablaSimbolos.map((simbolo, index) => (
                  <tr key={index}>
                    <td>{simbolo.identificador}</td>
                    <td>
                      {simbolo.tipoStruct
                        ? simbolo.tipoStruct
                        : (simbolo.subtipo !== null && simbolo.subtipo !== undefined)
                        ? `[]${tipos[simbolo.subtipo] ?? simbolo.subtipo}`
                        : (tipos[simbolo.tipo] ?? simbolo.tipo)}
                    </td>
                    <td>
                      {Array.isArray(simbolo.valor)
                        ? `[${simbolo.valor.join(" ")}]`
                        : simbolo.valor && typeof simbolo.valor === "object"
                          ? JSON.stringify(simbolo.valor)
                          : String(simbolo.valor)}
                    </td>
                    <td>{simbolo.entorno}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="panel">
          <h2>Reporte AST (Graphviz)</h2>
          {astGraphvizUrl ? (
            <div style={{ display: "grid", gap: "10px" }}>
              <img
                src={astGraphvizUrl}
                alt="AST Graphviz"
                style={{ width: "100%", maxHeight: "420px", objectFit: "contain", background: "#fff", border: "1px solid #ddd" }}
              />
              <a href={astGraphvizUrl} target="_blank" rel="noreferrer">
                Abrir AST en pestaña nueva
              </a>
              <details>
                <summary>Ver DOT generado</summary>
                <pre className="ast">{astDot}</pre>
              </details>
            </div>
          ) : (
            <pre className="ast">Sin AST generado.</pre>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;