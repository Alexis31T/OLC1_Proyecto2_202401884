import { Instruccion } from "../Abstract/Instruccion";
import { Node } from "../Abstract/Node";
import { Errores } from "../Excepciones/Errores";
import { Arbol } from "../Simbolo/Arbol";
import { TablaSimbolos } from "../Simbolo/TablaSimbolos";
import { Tipo } from "../Simbolo/Tipo";
import { SliceValue } from "../Simbolo/SliceValue";
import { tipoDato } from "../Simbolo/tipoDato";

export class SliceLiteral extends Instruccion {
    private subtipo: tipoDato;
    private expresiones: Instruccion[];

    constructor(subtipo: tipoDato, expresiones: Instruccion[], linea: number, columna: number) {
        super(new Tipo(tipoDato.SLICE, true), linea, columna);
        this.subtipo = subtipo;
        this.expresiones = expresiones;
    }

    interpretar(arbol: Arbol, tabla: TablaSimbolos): any {
        const valores: any[] = [];
        for (const expresion of this.expresiones) {
            const valor = expresion.interpretar(arbol, tabla);
            if (valor instanceof Errores) return valor;

            const tipoExpr = expresion.tipo.tipoDato!;
            if (tipoExpr !== this.subtipo) {
                return new Errores(
                    "Semantico",
                    `El slice esperaba ${tipoDato[this.subtipo]} y se recibio ${tipoDato[tipoExpr]}`,
                    this.linea,
                    this.col
                );
            }
            valores.push(valor);
        }
        return new SliceValue(this.subtipo, valores);
    }

    public ast(arbol: Arbol, tabla: TablaSimbolos): Node {
        const node = new Node("SLICE_LITERAL");
        node.pushChild(new Node(`[]${tipoDato[this.subtipo]}`));
        for (const expr of this.expresiones) {
            node.pushChild(expr.ast(arbol, tabla));
        }
        return node;
    }
}
