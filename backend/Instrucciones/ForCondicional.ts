import { Instruccion } from "../Abstract/Instruccion";
import { Node } from "../Abstract/Node";
import { Errores } from "../Excepciones/Errores";
import { Arbol } from "../Simbolo/Arbol";
import { TablaSimbolos } from "../Simbolo/TablaSimbolos";
import { Tipo } from "../Simbolo/Tipo";
import { tipoDato } from "../Simbolo/tipoDato";
import { tipoInstruccion } from "../Simbolo/tipoInstruccion";
import { Break } from "./Break";
import { Continue } from "./Continue";
import { Return } from "./Return";

export class ForCondicional extends Instruccion {
    private condicion: Instruccion;
    private cuerpo: Instruccion;

    constructor(condicion: Instruccion, cuerpo: Instruccion, linea: number, columna: number) {
        super(new Tipo(tipoInstruccion.FOR, false), linea, columna);
        this.condicion = condicion;
        this.cuerpo = cuerpo;
    }

    interpretar(arbol: Arbol, tabla: TablaSimbolos): any {
        const entornoFor = new TablaSimbolos(tabla, "For");

        while (true) {
            const resultadoCondicion = this.condicion.interpretar(arbol, entornoFor);
            if (resultadoCondicion instanceof Errores) return resultadoCondicion;

            if (this.condicion.tipo.tipoDato !== tipoDato.BOOLEANO) {
                return new Errores("Semantico", "La condicion del for debe ser booleana", this.linea, this.col);
            }

            if (!resultadoCondicion) break;

            const resultadoCuerpo = this.cuerpo.interpretar(arbol, entornoFor);
            if (resultadoCuerpo instanceof Errores) return resultadoCuerpo;
            if (resultadoCuerpo instanceof Continue) continue;
            if (resultadoCuerpo instanceof Break) break;
            if (resultadoCuerpo instanceof Return) return resultadoCuerpo;
        }

        return null;
    }

    public ast(arbol: Arbol, tabla: TablaSimbolos): Node {
        const node = new Node("FOR_CONDICIONAL");
        node.pushChild(this.condicion.ast(arbol, tabla));
        node.pushChild(this.cuerpo.ast(arbol, tabla));
        return node;
    }
}
