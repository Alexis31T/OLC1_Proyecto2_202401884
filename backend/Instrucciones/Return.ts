import { Instruccion } from "../Abstract/Instruccion";
import { Node } from "../Abstract/Node";
import { Arbol } from "../Simbolo/Arbol";
import { TablaSimbolos } from "../Simbolo/TablaSimbolos";
import { Tipo } from "../Simbolo/Tipo";
import { tipoDato } from "../Simbolo/tipoDato";
import { tipoInstruccion } from "../Simbolo/tipoInstruccion";
import { Errores } from "../Excepciones/Errores";

export class Return extends Instruccion {
    public valorExpresion: Instruccion | null;
    public valorRetorno: any = null;

    constructor(valorExpresion: Instruccion | null, linea: number, columna: number) {
        super(new Tipo(tipoInstruccion.RETURN, false), linea, columna);
        this.valorExpresion = valorExpresion;
    }

    interpretar(arbol: Arbol, tabla: TablaSimbolos): any {
        if (this.valorExpresion == null) {
            this.valorRetorno = null;
            this.tipo = new Tipo(tipoDato.NULO, true);
            return this;
        }

        const resultado = this.valorExpresion.interpretar(arbol, tabla);
        if (resultado instanceof Errores) return resultado;
        this.valorRetorno = resultado;
        this.tipo = new Tipo(this.valorExpresion.tipo.tipoDato!, true);
        return this;
    }

    public ast(arbol: Arbol, tabla: TablaSimbolos): Node {
        const node = new Node("RETURN");
        if (this.valorExpresion) {
            node.pushChild(this.valorExpresion.ast(arbol, tabla));
        }
        return node;
    }
}
