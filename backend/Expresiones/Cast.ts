import { Instruccion } from "../Abstract/Instruccion";
import { Node } from "../Abstract/Node";
import { Errores } from "../Excepciones/Errores";
import { Arbol } from "../Simbolo/Arbol";
import { TablaSimbolos } from "../Simbolo/TablaSimbolos";
import { Tipo } from "../Simbolo/Tipo";
import { tipoDato } from "../Simbolo/tipoDato";

export class Cast extends Instruccion {
    private destino: tipoDato;
    private expresion: Instruccion;

    constructor(destino: tipoDato, expresion: Instruccion, linea: number, columna: number) {
        super(new Tipo(destino, true), linea, columna);
        this.destino = destino;
        this.expresion = expresion;
    }

    interpretar(arbol: Arbol, tabla: TablaSimbolos): any {
        const valor = this.expresion.interpretar(arbol, tabla);
        if (valor instanceof Errores) return valor;

        const origen = this.expresion.tipo.tipoDato;
        this.tipo.tipoDato = this.destino;

        if (this.destino === tipoDato.DECIMAL && origen === tipoDato.ENTERO) return Number(valor);
        if (this.destino === tipoDato.ENTERO && origen === tipoDato.DECIMAL) return Math.trunc(Number(valor));
        if (this.destino === tipoDato.CADENA) return String(valor);
        if (this.destino === origen) return valor;

        return new Errores("Semantico", `No se puede convertir ${tipoDato[origen!]} a ${tipoDato[this.destino]}`, this.linea, this.col);
    }

    public ast(arbol: Arbol, tabla: TablaSimbolos): Node {
        const node = new Node("CAST");
        node.pushChild(new Node(tipoDato[this.destino]));
        node.pushChild(this.expresion.ast(arbol, tabla));
        return node;
    }
}
