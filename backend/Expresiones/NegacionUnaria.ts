import { Instruccion } from "../Abstract/Instruccion";
import { Node } from "../Abstract/Node";
import { Errores } from "../Excepciones/Errores";
import { Arbol } from "../Simbolo/Arbol";
import { TablaSimbolos } from "../Simbolo/TablaSimbolos";
import { Tipo } from "../Simbolo/Tipo";
import { tipoDato } from "../Simbolo/tipoDato";

export class NegacionUnaria extends Instruccion {
    private operando: Instruccion;

    constructor(operando: Instruccion, linea: number, columna: number) {
        super(new Tipo(tipoDato.ENTERO, true), linea, columna);
        this.operando = operando;
    }

    interpretar(arbol: Arbol, tabla: TablaSimbolos): any {
        const valor = this.operando.interpretar(arbol, tabla);
        if (valor instanceof Errores) return valor;

        const tipo = this.operando.tipo.tipoDato;
        if (tipo !== tipoDato.ENTERO && tipo !== tipoDato.DECIMAL) {
            return new Errores("Semantico", "La negacion unaria solo acepta valores numericos", this.linea, this.col);
        }

        this.tipo.tipoDato = tipo;
        return -Number(valor);
    }

    public ast(arbol: Arbol, tabla: TablaSimbolos): Node {
        const node = new Node("NEGACION_UNARIA");
        node.pushChild(new Node("-"));
        node.pushChild(this.operando.ast(arbol, tabla));
        return node;
    }
}
