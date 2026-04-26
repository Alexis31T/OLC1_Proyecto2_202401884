import { Instruccion } from "../Abstract/Instruccion";
import { Node } from "../Abstract/Node";
import { Errores } from "../Excepciones/Errores";
import { Arbol } from "../Simbolo/Arbol";
import { Simbolo } from "../Simbolo/Simbolo";
import { SliceValue } from "../Simbolo/SliceValue";
import { TablaSimbolos } from "../Simbolo/TablaSimbolos";
import { Tipo } from "../Simbolo/Tipo";
import { tipoDato } from "../Simbolo/tipoDato";
import { tipoInstruccion } from "../Simbolo/tipoInstruccion";

export class DeclaracionSlice extends Instruccion {
    private id: string;
    private subtipo: tipoDato;
    private valor: Instruccion | null;

    constructor(id: string, subtipo: tipoDato, valor: Instruccion | null, linea: number, columna: number) {
        super(new Tipo(tipoInstruccion.DECLARACION, false), linea, columna);
        this.id = id;
        this.subtipo = subtipo;
        this.valor = valor;
    }

    interpretar(arbol: Arbol, tabla: TablaSimbolos): any {
        let resultado: any = null;

        if (this.valor !== null) {
            resultado = this.valor.interpretar(arbol, tabla);
            if (resultado instanceof Errores) return resultado;

            if (this.valor.tipo.tipoDato === tipoDato.NULO) {
                resultado = null;
            } else if (!(resultado instanceof SliceValue)) {
                return new Errores("Semantico", `${this.id} debe recibir un slice`, this.linea, this.col);
            } else if (resultado.subtipo !== this.subtipo && resultado.subtipo !== tipoDato.NULO) {
                return new Errores(
                    "Semantico",
                    `No se puede declarar []${tipoDato[this.subtipo]} con []${tipoDato[resultado.subtipo]}`,
                    this.linea,
                    this.col
                );
            }
        }

        const simbolo = new Simbolo(
            new Tipo(tipoDato.SLICE, true),
            this.id,
            resultado,
            this.linea,
            this.col,
            tabla.nombreEntorno,
            undefined,
            this.subtipo
        );

        const posibleError = tabla.setVariable(simbolo);
        if (posibleError instanceof Errores) return posibleError;
        arbol.simbolos.push(simbolo);
        return null;
    }

    public ast(arbol: Arbol, tabla: TablaSimbolos): Node {
        const node = new Node("DECLARACION_SLICE");
        node.pushChild(new Node(`[]${tipoDato[this.subtipo]}`));
        node.pushChild(new Node(this.id));
        if (this.valor) {
            node.pushChild(this.valor.ast(arbol, tabla));
        } else {
            node.pushChild(new Node("nil"));
        }
        return node;
    }
}
