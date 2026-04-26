import { Instruccion } from "../Abstract/Instruccion";
import { Node } from "../Abstract/Node";
import { Errores } from "../Excepciones/Errores";
import { Arbol } from "../Simbolo/Arbol";
import { SliceValue } from "../Simbolo/SliceValue";
import { TablaSimbolos } from "../Simbolo/TablaSimbolos";
import { Tipo } from "../Simbolo/Tipo";
import { tipoDato } from "../Simbolo/tipoDato";
import { tipoInstruccion } from "../Simbolo/tipoInstruccion";

export class MatrixSet extends Instruccion {
    private id: string;
    private fila: Instruccion;
    private columna: Instruccion;
    private valor: Instruccion;

    constructor(id: string, fila: Instruccion, columna: Instruccion, valor: Instruccion, linea: number, col: number) {
        super(new Tipo(tipoInstruccion.ASIGNACION, false), linea, col);
        this.id = id;
        this.fila = fila;
        this.columna = columna;
        this.valor = valor;
    }

    interpretar(arbol: Arbol, tabla: TablaSimbolos): any {
        const simbolo = tabla.getVariable(this.id);
        if (!simbolo) {
            return new Errores("Semantico", `La variable ${this.id} no existe`, this.linea, this.col);
        }
        if (!(simbolo.valor instanceof SliceValue) || simbolo.valor.subtipo !== tipoDato.SLICE) {
            return new Errores("Semantico", `${this.id} no es un slice multidimensional`, this.linea, this.col);
        }

        const idxFila = this.fila.interpretar(arbol, tabla);
        if (idxFila instanceof Errores) return idxFila;
        const idxColumna = this.columna.interpretar(arbol, tabla);
        if (idxColumna instanceof Errores) return idxColumna;

        if (this.fila.tipo.tipoDato !== tipoDato.ENTERO || this.columna.tipo.tipoDato !== tipoDato.ENTERO) {
            return new Errores("Semantico", "Los indices de una matriz deben ser int", this.linea, this.col);
        }

        if (idxFila < 0 || idxFila >= simbolo.valor.valores.length) {
            return new Errores("Semantico", `Fila ${idxFila} fuera de rango en ${this.id}`, this.linea, this.col);
        }

        const fila = simbolo.valor.valores[idxFila];
        if (!(fila instanceof SliceValue)) {
            return new Errores("Semantico", `La fila ${idxFila} de ${this.id} no es un slice`, this.linea, this.col);
        }
        if (idxColumna < 0 || idxColumna >= fila.valores.length) {
            return new Errores("Semantico", `Columna ${idxColumna} fuera de rango en ${this.id}`, this.linea, this.col);
        }

        const nuevoValor = this.valor.interpretar(arbol, tabla);
        if (nuevoValor instanceof Errores) return nuevoValor;

        const tipoNuevo = this.valor.tipo.tipoDato!;
        const esIntToFloat = fila.subtipo === tipoDato.DECIMAL && tipoNuevo === tipoDato.ENTERO;
        if (fila.subtipo !== tipoNuevo && !esIntToFloat) {
            return new Errores(
                "Semantico",
                `No se puede asignar ${tipoDato[tipoNuevo]} en matriz de ${tipoDato[fila.subtipo]}`,
                this.linea,
                this.col
            );
        }

        fila.valores[idxColumna] = esIntToFloat ? Number(nuevoValor) : nuevoValor;
        return null;
    }

    public ast(arbol: Arbol, tabla: TablaSimbolos): Node {
        const node = new Node("MATRIX_SET");
        node.pushChild(new Node(this.id));
        node.pushChild(this.fila.ast(arbol, tabla));
        node.pushChild(this.columna.ast(arbol, tabla));
        node.pushChild(this.valor.ast(arbol, tabla));
        return node;
    }
}
