import { Instruccion } from "../Abstract/Instruccion";
import { Node } from "../Abstract/Node";
import { Arbol } from "../Simbolo/Arbol";
import { TablaSimbolos } from "../Simbolo/TablaSimbolos";
import { Tipo } from "../Simbolo/Tipo";
import { tipoInstruccion } from "../Simbolo/tipoInstruccion";

export class Break extends Instruccion {
    constructor(linea: number, columna: number) {
        super(new Tipo(tipoInstruccion.BREAK, false), linea, columna);
    }

    interpretar(_arbol: Arbol, _tabla: TablaSimbolos): any {
        return this;
    }

    public ast(_arbol: Arbol, _tabla: TablaSimbolos): Node {
        return new Node("BREAK");
    }
}
