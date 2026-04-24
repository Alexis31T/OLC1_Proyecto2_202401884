import { Instruccion } from "../Abstract/Instruccion";
import { Node } from "../Abstract/Node";
import { Errores } from "../Excepciones/Errores";
import { Arbol } from "../Simbolo/Arbol";
import { SliceValue } from "../Simbolo/SliceValue";
import { TablaSimbolos } from "../Simbolo/TablaSimbolos";
import { Tipo } from "../Simbolo/Tipo";
import { tipoDato } from "../Simbolo/tipoDato";

export class SliceAccess extends Instruccion {
    private id: string;
    private indice: Instruccion;

    constructor(id: string, indice: Instruccion, linea: number, columna: number) {
        super(new Tipo(tipoDato.NULO, true), linea, columna);
        this.id = id;
        this.indice = indice;
    }

    interpretar(arbol: Arbol, tabla: TablaSimbolos): any {
        const simbolo = tabla.getVariable(this.id);
        if (!simbolo) {
            return new Errores("Semantico", `La variable ${this.id} no existe`, this.linea, this.col);
        }

        if (!(simbolo.valor instanceof SliceValue)) {
            return new Errores("Semantico", `${this.id} no es un slice`, this.linea, this.col);
        }

        const idx = this.indice.interpretar(arbol, tabla);
        if (idx instanceof Errores) return idx;
        if (this.indice.tipo.tipoDato !== tipoDato.ENTERO) {
            return new Errores("Semantico", "El indice de un slice debe ser int", this.linea, this.col);
        }

        if (idx < 0 || idx >= simbolo.valor.valores.length) {
            return new Errores("Semantico", `Indice ${idx} fuera de rango en ${this.id}`, this.linea, this.col);
        }

        this.tipo.tipoDato = simbolo.valor.subtipo;
        return simbolo.valor.valores[idx];
    }

    public ast(arbol: Arbol, tabla: TablaSimbolos): Node {
        const node = new Node("SLICE_ACCESS");
        node.pushChild(new Node(this.id));
        node.pushChild(this.indice.ast(arbol, tabla));
        return node;
    }
}
