import parser from "../analizador/parserWrapper";

import { Arbol } from "../Simbolo/Arbol";
import { TablaSimbolos } from "../Simbolo/TablaSimbolos";
import { Errores } from "../Excepciones/Errores";
import { Node } from "../Abstract/Node";
import { Funcion } from "../Instrucciones/Funcion";
import { SliceValue } from "../Simbolo/SliceValue";

export const analizar = (req: any, res: any) => {

    const entrada = req.body.codigo;

    try {
        const init = new Node("INICIO");
        let instrucciones = parser.parse(entrada);

        if (!Array.isArray(instrucciones)) {
            instrucciones = [instrucciones];
        }

        const arbol = new Arbol(instrucciones);
        const tabla = new TablaSimbolos(undefined, "Global");

        const funciones = instrucciones.filter((inst: any) => inst instanceof Funcion) as Funcion[];
        const hayMain = funciones.some((fn) => fn.id === "main");

        if (funciones.length > 0 && !hayMain) {
            const errorMain = new Errores("Semantico", "No se encontro la funcion main()", 0, 0);
            arbol.errores.push(errorMain);
        }

        for (const instruccion of instrucciones) {
            if (funciones.length > 0 && instruccion instanceof Funcion && instruccion.id !== "main") {
                init.pushChild(instruccion.ast(arbol, tabla));
                continue;
            }
            const resultado = instruccion.interpretar(arbol, tabla);
            init.pushChild(instruccion.ast(arbol, tabla));
            if (resultado instanceof Errores) {
                arbol.errores.push(resultado);
            }
        }

        const erroresFormateados = arbol.errores.map((error) => ({
            tipo: error.tipo,
            descripcion: error.desc,
            linea: error.linea,
            columna: error.columna
        }));

        const tablaSimbolos = tabla.getAllSymbols().map((simbolo) => ({
            identificador: simbolo.id,
            tipo: simbolo.tipo.tipoDato,
            subtipo: simbolo.valor instanceof SliceValue ? simbolo.valor.subtipo : null,
            valor: simbolo.valor instanceof SliceValue ? simbolo.valor.valores : simbolo.valor,
            entorno: simbolo.entorno,
            linea: simbolo.linea,
            columna: simbolo.columna
        }));

        res.json({
            consola: arbol.consola,
            errores: erroresFormateados,
            tablaSimbolos,
            astDot: init.getDot()
        });
    } catch (error: any) {
        const errorSintactico = {
            tipo: "Sintactico",
            descripcion: error?.message || "Error de análisis",
            linea: error?.hash?.loc?.first_line ?? 0,
            columna: error?.hash?.loc?.first_column ?? 0
        };

        res.status(400).json({
            consola: "",
            errores: [errorSintactico],
            tablaSimbolos: [],
            astDot: ""
        });
    }

};