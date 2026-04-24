import { Instruccion } from "../Abstract/Instruccion";
import { Node } from "../Abstract/Node";
import { Errores } from "../Excepciones/Errores";
import { Arbol } from "../Simbolo/Arbol";
import { TablaSimbolos } from "../Simbolo/TablaSimbolos";
import { Tipo } from "../Simbolo/Tipo";
import { tipoDato } from "../Simbolo/tipoDato";

export class Modulo extends Instruccion {
    private operando1: Instruccion;
    private operando2: Instruccion;

    constructor(operando1: Instruccion, operando2: Instruccion, linea: number, columna: number) {
        super(new Tipo(tipoDato.ENTERO, true), linea, columna);
        this.operando1 = operando1;
        this.operando2 = operando2;
    }

    interpretar(arbol: Arbol, tabla: TablaSimbolos): any {
        const opIzq = this.operando1.interpretar(arbol, tabla);
        if (opIzq instanceof Errores) return opIzq;

        const opDer = this.operando2.interpretar(arbol, tabla);
        if (opDer instanceof Errores) return opDer;

        if (this.operando1.tipo.tipoDato !== tipoDato.ENTERO || this.operando2.tipo.tipoDato !== tipoDato.ENTERO) {
            return new Errores("Semantico", "El operador % solo acepta int % int", this.linea, this.col);
        }

        if (Number(opDer) === 0) {
            return new Errores("Semantico", "No se puede operar modulo con 0", this.linea, this.col);
        }

        this.tipo.tipoDato = tipoDato.ENTERO;
        return Number(opIzq) % Number(opDer);
    }

    public ast(arbol: Arbol, tabla: TablaSimbolos): Node {
        const node = new Node("MODULO");
        node.pushChild(new Node(this.operando1.interpretar(arbol, tabla).toString()));
        node.pushChild(new Node("%"));
        node.pushChild(new Node(this.operando2.interpretar(arbol, tabla).toString()));
        return node;
    }
}
