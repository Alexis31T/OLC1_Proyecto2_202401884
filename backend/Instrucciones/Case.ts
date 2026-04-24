import { Instruccion } from "../Abstract/Instruccion";
import { Node } from "../Abstract/Node";
import { Arbol } from "../Simbolo/Arbol";
import { TablaSimbolos } from "../Simbolo/TablaSimbolos";
import { Tipo } from "../Simbolo/Tipo";
import { tipoInstruccion } from "../Simbolo/tipoInstruccion";

export class Case extends Instruccion {
    public expresion: Instruccion;
    public instrucciones: Instruccion[];

    constructor(expresion: Instruccion, instrucciones: Instruccion[], linea: number, columna: number) {
        super(new Tipo(tipoInstruccion.CASE, false), linea, columna);
        this.expresion = expresion;
        this.instrucciones = instrucciones;
    }

    interpretar(_arbol: Arbol, _tabla: TablaSimbolos): any {
        return null;
    }

    public ast(arbol: Arbol, tabla: TablaSimbolos): Node {
        const node = new Node("CASE");
        node.pushChild(this.expresion.ast(arbol, tabla));
        const instruccionesNode = new Node("INSTRUCCIONES");
        for (const instruccion of this.instrucciones) {
            instruccionesNode.pushChild(instruccion.ast(arbol, tabla));
        }
        node.pushChild(instruccionesNode);
        return node;
    }
}
