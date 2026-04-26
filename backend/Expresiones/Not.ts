import { Instruccion } from "../Abstract/Instruccion";
import { Node } from "../Abstract/Node";
import { Errores } from "../Excepciones/Errores";
import { Arbol } from "../Simbolo/Arbol";
import { TablaSimbolos } from "../Simbolo/TablaSimbolos";
import { Tipo } from "../Simbolo/Tipo";
import { tipoDato } from "../Simbolo/tipoDato";

export class Not extends Instruccion {
    private operando: Instruccion;

    constructor(operando: Instruccion, linea: number, columna: number) {
        super(new Tipo(tipoDato.BOOLEANO, true), linea, columna);
        this.operando = operando;
    }

    interpretar(arbol: Arbol, tabla: TablaSimbolos): any {
        const valor = this.operando.interpretar(arbol, tabla);
        if (valor instanceof Errores) return valor;

        if (this.operando.tipo.tipoDato !== tipoDato.BOOLEANO) {
            return new Errores("Semantico", "El operador ! solo acepta booleanos", this.linea, this.col);
        }

        return !Boolean(valor);
    }

    public ast(arbol: Arbol, tabla: TablaSimbolos): Node {
        const node = new Node("NOT");
        node.pushChild(new Node("!"));
        node.pushChild(this.operando.ast(arbol, tabla));
        return node;
    }
}
