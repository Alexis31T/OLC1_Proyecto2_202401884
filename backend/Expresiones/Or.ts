import { Instruccion } from "../Abstract/Instruccion";
import { Node } from "../Abstract/Node";
import { Errores } from "../Excepciones/Errores";
import { Arbol } from "../Simbolo/Arbol";
import { TablaSimbolos } from "../Simbolo/TablaSimbolos";
import { Tipo } from "../Simbolo/Tipo";
import { tipoDato } from "../Simbolo/tipoDato";

export class Or extends Instruccion {
    private operando1: Instruccion;
    private operando2: Instruccion;

    constructor(operando1: Instruccion, operando2: Instruccion, linea: number, columna: number) {
        super(new Tipo(tipoDato.BOOLEANO, true), linea, columna);
        this.operando1 = operando1;
        this.operando2 = operando2;
    }

    interpretar(arbol: Arbol, tabla: TablaSimbolos): any {
        const opIzq = this.operando1.interpretar(arbol, tabla);
        if (opIzq instanceof Errores) return opIzq;

        const opDer = this.operando2.interpretar(arbol, tabla);
        if (opDer instanceof Errores) return opDer;

        if (this.operando1.tipo.tipoDato !== tipoDato.BOOLEANO || this.operando2.tipo.tipoDato !== tipoDato.BOOLEANO) {
            return new Errores("Semantico", "El operador || solo acepta bool || bool", this.linea, this.col);
        }

        return Boolean(opIzq) || Boolean(opDer);
    }

    public ast(arbol: Arbol, tabla: TablaSimbolos): Node {
        const node = new Node("OR");
        node.pushChild(this.operando1.ast(arbol, tabla));
        node.pushChild(new Node("||"));
        node.pushChild(this.operando2.ast(arbol, tabla));
        return node;
    }
}
