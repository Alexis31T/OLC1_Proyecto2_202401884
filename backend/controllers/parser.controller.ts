import parser from "../analizador/parserWrapper";

import { Arbol } from "../Simbolo/Arbol";
import { TablaSimbolos } from "../Simbolo/TablaSimbolos";
import { Errores } from "../Excepciones/Errores";
import { Node } from "../Abstract/Node";
import { Funcion } from "../Instrucciones/Funcion";
import { StructDefinicion } from "../Instrucciones/StructDefinicion";
import { SliceValue } from "../Simbolo/SliceValue";
import { StructValue } from "../Simbolo/StructValue";
import { tipoDato } from "../Simbolo/tipoDato";

export const analizar = (req: any, res: any) => {

    const entrada = String(req.body.codigo ?? "");
    const recuperacionLexica = recuperarErroresLexicos(entrada);

    try {
        const init = new Node("INICIO");
        let instrucciones = parser.parse(recuperacionLexica.codigo);

        if (!Array.isArray(instrucciones)) {
            instrucciones = [instrucciones];
        }

        const arbol = new Arbol(instrucciones);
        const tabla = new TablaSimbolos(undefined, "Global");
        arbol.errores.push(...recuperacionLexica.errores);

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

        const tablaVariables = tabla.getAllSymbols().map((simbolo) => ({
            identificador: simbolo.id,
            tipo: simbolo.tipo.tipoDato,
            tipoStruct: simbolo.tipoStruct ?? null,
            subtipo: simbolo.valor instanceof SliceValue ? simbolo.valor.subtipo : simbolo.subtipo ?? null,
            tipoDisplay: formatearTipoSimbolo(simbolo.valor, simbolo.tipo.tipoDato, simbolo.tipoStruct, simbolo.subtipo),
            valor: formatearValorReporte(simbolo.valor),
            entorno: simbolo.entorno,
            linea: simbolo.linea,
            columna: simbolo.columna
        }));

        const tablaFunciones = funciones.map((fn) => ({
            identificador: fn.id,
            tipo: "func",
            tipoStruct: null,
            subtipo: null,
            tipoDisplay: "func",
            valor: `${fn.parametros.length} parametro(s)`,
            entorno: "Global",
            linea: fn.linea,
            columna: fn.col
        }));

        const tablaStructs = instrucciones
            .filter((inst: any) => inst instanceof StructDefinicion)
            .map((structDef: StructDefinicion) => ({
                identificador: structDef.id,
                tipo: "struct",
                tipoStruct: null,
                subtipo: null,
                tipoDisplay: "struct",
                valor: (arbol.structs.get(structDef.id) ?? [])
                    .map((campo) => `${campo.id}: ${campo.tipoStruct ?? nombreTipoDato(campo.tipo)}`)
                    .join(", "),
                entorno: "Global",
                linea: structDef.linea,
                columna: structDef.col
            }));

        const tablaSimbolos = [...tablaStructs, ...tablaFunciones, ...tablaVariables];

        res.json({
            consola: arbol.consola,
            errores: erroresFormateados,
            tablaSimbolos,
            astDot: init.getDot()
        });
    } catch (error: any) {
        const esLexico = error?.hash?.token === "INVALIDO" || String(error?.message ?? "").includes("got 'INVALIDO'");
        const errorSintactico = {
            tipo: esLexico ? "Lexico" : "Sintactico",
            descripcion: esLexico
                ? `Caracter invalido '${error?.hash?.text ?? ""}'`
                : error?.message || "Error de analisis",
            linea: error?.hash?.loc?.first_line ?? 0,
            columna: error?.hash?.loc?.first_column ?? 0
        };

        res.status(400).json({
            consola: "",
            errores: [...recuperacionLexica.errores.map((err) => ({
                tipo: err.tipo,
                descripcion: err.desc,
                linea: err.linea,
                columna: err.columna
            })), errorSintactico],
            tablaSimbolos: [],
            astDot: ""
        });
    }

};

const recuperarErroresLexicos = (entrada: string): { codigo: string; errores: Errores[] } => {
    const errores: Errores[] = [];
    const lineas = entrada.split(/\r?\n/);
    const lineasLimpias = lineas.map((linea, indiceLinea) => limpiarLineaLexica(linea, indiceLinea + 1, errores));
    const codigoSinLlavesExtra = removerLlavesExtra(lineasLimpias.join("\n"), errores);

    return {
        codigo: codigoSinLlavesExtra,
        errores
    };
};

const removerLlavesExtra = (codigo: string, errores: Errores[]): string => {
    let limpio = "";
    let profundidad = 0;
    let linea = 1;
    let columna = 0;
    let enCadena = false;
    let enRune = false;
    let escape = false;

    for (let i = 0; i < codigo.length; i++) {
        const char = codigo[i];
        const siguiente = codigo[i + 1];

        if (char === "\n") {
            limpio += char;
            linea++;
            columna = 0;
            continue;
        }

        if (!enCadena && !enRune && char === "/" && siguiente === "/") {
            const finLinea = codigo.indexOf("\n", i);
            const comentario = finLinea === -1 ? codigo.slice(i) : codigo.slice(i, finLinea);
            limpio += comentario;
            columna += comentario.length;
            i += comentario.length - 1;
            continue;
        }

        if (enCadena) {
            limpio += char;
            if (escape) escape = false;
            else if (char === "\\") escape = true;
            else if (char === "\"") enCadena = false;
            columna++;
            continue;
        }

        if (enRune) {
            limpio += char;
            if (escape) escape = false;
            else if (char === "\\") escape = true;
            else if (char === "'") enRune = false;
            columna++;
            continue;
        }

        if (char === "\"") {
            enCadena = true;
            limpio += char;
            columna++;
            continue;
        }

        if (char === "'") {
            enRune = true;
            limpio += char;
            columna++;
            continue;
        }

        if (char === "{") profundidad++;

        if (char === "}") {
            if (profundidad === 0) {
                errores.push(new Errores("Sintactico", "Llave de cierre inesperada '}'", linea, columna));
                columna++;
                continue;
            }
            profundidad--;
        }

        limpio += char;
        columna++;
    }

    return limpio;
};

const limpiarLineaLexica = (linea: string, numeroLinea: number, errores: Errores[]): string => {
    let limpia = "";
    let enCadena = false;
    let enRune = false;
    let escape = false;

    for (let i = 0; i < linea.length; i++) {
        const char = linea[i];
        const siguiente = linea[i + 1];

        if (!enCadena && !enRune && char === "/" && siguiente === "/") {
            limpia += linea.slice(i);
            break;
        }

        if (enCadena) {
            limpia += char;
            if (escape) {
                escape = false;
            } else if (char === "\\") {
                escape = true;
            } else if (char === "\"") {
                enCadena = false;
            }
            continue;
        }

        if (enRune) {
            limpia += char;
            if (escape) {
                escape = false;
            } else if (char === "\\") {
                escape = true;
            } else if (char === "'") {
                enRune = false;
            }
            continue;
        }

        if (char === "\"") {
            enCadena = true;
            limpia += char;
            continue;
        }

        if (char === "'") {
            enRune = true;
            limpia += char;
            continue;
        }

        if (esCaracterPermitido(char)) {
            limpia += char;
            continue;
        }

        const inicioInvalido = i;
        while (i < linea.length && !esCaracterPermitido(linea[i])) {
            errores.push(new Errores("Lexico", `Caracter invalido '${linea[i]}'`, numeroLinea, i));
            i++;
        }

        // Casos como "$$4" son ruido léxico pegado al número; se descarta el token completo.
        if (i < linea.length && inicioInvalido < i && /[A-Za-z0-9_]/.test(linea[i])) {
            while (i < linea.length && /[A-Za-z0-9_]/.test(linea[i])) i++;
        }

        i--;
    }

    return limpia;
};

const esCaracterPermitido = (char: string): boolean => {
    if (/[\w\s]/.test(char)) return true;
    return "()[]{};:.,+-*/%!=<>&|".includes(char);
};

const formatearValorReporte = (valor: any): any => {
    if (valor === null || valor === undefined) return "nil";
    if (valor instanceof SliceValue) {
        return valor.valores.map((item) => formatearValorReporte(item));
    }
    if (valor instanceof StructValue) {
        return Object.fromEntries(
            Array.from(valor.campos.entries()).map(([clave, campoValor]) => [clave, formatearValorReporte(campoValor)])
        );
    }
    return valor;
};

const formatearTipoSimbolo = (valor: any, tipo?: tipoDato, tipoStruct?: string, subtipo?: tipoDato): string => {
    if (tipoStruct) return tipoStruct;
    if (valor instanceof SliceValue) return formatearTipoSlice(valor);
    if (tipo === tipoDato.SLICE && subtipo !== undefined) return `[]${nombreTipoDato(subtipo)}`;
    if (tipo !== undefined) return nombreTipoDato(tipo);
    return "-";
};

const formatearTipoSlice = (slice: SliceValue): string => {
    if (slice.subtipo !== tipoDato.SLICE) {
        return `[]${nombreTipoDato(slice.subtipo)}`;
    }

    const primeraFila = slice.valores.find((valor) => valor instanceof SliceValue) as SliceValue | undefined;
    if (!primeraFila) return "[][]nil";
    return `[]${formatearTipoSlice(primeraFila)}`;
};

const nombreTipoDato = (tipo: tipoDato): string => {
    switch (tipo) {
        case tipoDato.ENTERO:
            return "int";
        case tipoDato.DECIMAL:
            return "float64";
        case tipoDato.CADENA:
            return "string";
        case tipoDato.BOOLEANO:
            return "bool";
        case tipoDato.CARACTER:
            return "rune";
        case tipoDato.SLICE:
            return "slice";
        case tipoDato.NULO:
            return "nil";
        case tipoDato.STRUCT:
            return "struct";
        default:
            return "error";
    }
};