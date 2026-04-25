import { Instruccion } from "../Abstract/Instruccion";
import { TablaSimbolos } from "../Simbolo/TablaSimbolos";
import { Tipo } from "../Simbolo/Tipo";
import { tipoInstruccion } from "../Simbolo/tipoInstruccion";
import { Errores } from "../Excepciones/Errores";
import { tipoDato } from "../Simbolo/tipoDato";
import { Node } from "../Abstract/Node"
import { Arbol } from "../Simbolo/Arbol";
import { SliceValue } from "../Simbolo/SliceValue";
import { StructValue } from "../Simbolo/StructValue";

export class Asignacion extends Instruccion {
    private id: string;
    private valor: Instruccion;

    constructor(id: string, valor: Instruccion, linea: number, columna: number) {
        super(new Tipo(tipoInstruccion.ASIGNACION, false), linea, columna);
        this.id = id;
        this.valor = valor;
    }

    interpretar(arbol: any, tabla: TablaSimbolos): any {
        const simbolo = tabla.getVariable(this.id);

        if (!simbolo) {
            return new Errores(
                "Semantico",
                `La variable ${this.id} no existe`,
                this.linea,
                this.col
            );
        }

        const nuevoValor = this.valor.interpretar(arbol, tabla);
        if (nuevoValor instanceof Errores) return nuevoValor;

        const tipoVariable = simbolo.tipo.tipoDato;
        const tipoNuevo = this.valor.tipo.tipoDato;
        const esNil = tipoNuevo === tipoDato.NULO;

        if (esNil) {
            if (tipoVariable !== tipoDato.SLICE && tipoVariable !== tipoDato.STRUCT) {
                return new Errores(
                    "Semantico",
                    `No se puede asignar nil a ${this.id} de tipo ${tipoDato[tipoVariable!]}`,
                    this.linea,
                    this.col
                );
            }
            simbolo.valor = null;
            return null;
        }

        const esIntToFloat =
            tipoVariable === tipoDato.DECIMAL && tipoNuevo === tipoDato.ENTERO;

        if (tipoVariable !== tipoNuevo && !esIntToFloat) {
            return new Errores(
                "Semantico",
                `No se puede asignar un valor de tipo distinto a ${this.id}`,
                this.linea,
                this.col
            );
        }

        if (tipoVariable === tipoDato.STRUCT) {
            if (!(nuevoValor instanceof StructValue) || nuevoValor.nombre !== simbolo.tipoStruct) {
                return new Errores(
                    "Semantico",
                    `No se puede asignar un struct distinto a ${this.id}`,
                    this.linea,
                    this.col
                );
            }
        }

        if (tipoVariable === tipoDato.SLICE && simbolo.valor instanceof SliceValue && nuevoValor instanceof SliceValue) {
            if (simbolo.valor.subtipo !== tipoDato.NULO && simbolo.valor.subtipo !== nuevoValor.subtipo) {
                return new Errores(
                    "Semantico",
                    `No se puede asignar un []${tipoDato[nuevoValor.subtipo]} a ${this.id} que es []${tipoDato[simbolo.valor.subtipo]}`,
                    this.linea,
                    this.col
                );
            }
            if (simbolo.valor.subtipo === tipoDato.NULO) {
                simbolo.valor.subtipo = nuevoValor.subtipo;
            }
        }

        simbolo.valor = esIntToFloat ? Number(nuevoValor) : nuevoValor;
        return null;
    }

    public ast(arbol: Arbol, tabla: TablaSimbolos): Node {
        let node = new Node("ASIGNACION");
        node.pushChild(new Node(this.id));
        node.pushChild(this.valor.ast(arbol, tabla));
        return node;
    }
}