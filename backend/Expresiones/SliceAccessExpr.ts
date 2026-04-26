import { Instruccion } from "../Abstract/Instruccion";
import { Node } from "../Abstract/Node";
import { Errores } from "../Excepciones/Errores";
import { Arbol } from "../Simbolo/Arbol";
import { SliceValue } from "../Simbolo/SliceValue";
import { TablaSimbolos } from "../Simbolo/TablaSimbolos";
import { Tipo } from "../Simbolo/Tipo";
import { tipoDato } from "../Simbolo/tipoDato";

export class SliceAccessExpr extends Instruccion {
    private objetivo: Instruccion;
    private indice: Instruccion;

    constructor(objetivo: Instruccion, indice: Instruccion, linea: number, columna: number) {
        super(new Tipo(tipoDato.NULO, true), linea, columna);
        this.objetivo = objetivo;
        this.indice = indice;
    }

    interpretar(arbol: Arbol, tabla: TablaSimbolos): any {
        const slice = this.objetivo.interpretar(arbol, tabla);
        if (slice instanceof Errores) return slice;
        if (!(slice instanceof SliceValue)) {
            return new Errores("Semantico", "El acceso por indice solo aplica a slices", this.linea, this.col);
        }

        const idx = this.indice.interpretar(arbol, tabla);
        if (idx instanceof Errores) return idx;
        if (this.indice.tipo.tipoDato !== tipoDato.ENTERO) {
            return new Errores("Semantico", "El indice de un slice debe ser int", this.linea, this.col);
        }

        if (idx < 0 || idx >= slice.valores.length) {
            return new Errores("Semantico", `Indice ${idx} fuera de rango`, this.linea, this.col);
        }

        const valor = slice.valores[idx];
        this.tipo.tipoDato = valor instanceof SliceValue ? tipoDato.SLICE : slice.subtipo;
        return valor;
    }

    public ast(arbol: Arbol, tabla: TablaSimbolos): Node {
        const node = new Node("SLICE_ACCESS_EXPR");
        node.pushChild(this.objetivo.ast(arbol, tabla));
        node.pushChild(this.indice.ast(arbol, tabla));
        return node;
    }
}
