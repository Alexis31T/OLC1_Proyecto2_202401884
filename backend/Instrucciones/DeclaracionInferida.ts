import { Instruccion } from "../Abstract/Instruccion";
import { Node } from "../Abstract/Node";
import { Errores } from "../Excepciones/Errores";
import { TablaSimbolos } from "../Simbolo/TablaSimbolos";
import { Simbolo } from "../Simbolo/Simbolo";
import { Tipo } from "../Simbolo/Tipo";
import { tipoInstruccion } from "../Simbolo/tipoInstruccion";

export class DeclaracionInferida extends Instruccion {
    private id: string;
    private valor: Instruccion;

    constructor(id: string, valor: Instruccion, linea: number, columna: number) {
        super(new Tipo(tipoInstruccion.DECLARACION, false), linea, columna);
        this.id = id;
        this.valor = valor;
    }

    interpretar(arbol: any, tabla: TablaSimbolos): Errores | null {
        const resultado = this.valor.interpretar(arbol, tabla);
        if (resultado instanceof Errores) {
            return resultado;
        }

        const simbolo = new Simbolo(
            new Tipo(this.valor.tipo.tipoDato!, true),
            this.id,
            resultado,
            this.linea,
            this.col,
            tabla.nombreEntorno
        );

        const posibleError = tabla.setVariable(simbolo);
        if (posibleError instanceof Errores) {
            return posibleError;
        }
        arbol.simbolos.push(simbolo);
        return null;
    }

    public ast(arbol: any, tabla: TablaSimbolos): Node {
        const node = new Node("DECLARACION_INFERIDA");
        node.pushChild(new Node(this.id));
        node.pushChild(this.valor.ast(arbol, tabla));
        return node;
    }
}
