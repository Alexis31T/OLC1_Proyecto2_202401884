import { Instruccion } from "../Abstract/Instruccion";
import { Node } from "../Abstract/Node";
import { Errores } from "../Excepciones/Errores";
import { Arbol } from "../Simbolo/Arbol";
import { SliceValue } from "../Simbolo/SliceValue";
import { TablaSimbolos } from "../Simbolo/TablaSimbolos";
import { Tipo } from "../Simbolo/Tipo";
import { tipoDato } from "../Simbolo/tipoDato";

export class MatrixLiteral extends Instruccion {
    private subtipo: tipoDato;
    private filas: Instruccion[][];

    constructor(subtipo: tipoDato, filas: Instruccion[][], linea: number, columna: number) {
        super(new Tipo(tipoDato.SLICE, true), linea, columna);
        this.subtipo = subtipo;
        this.filas = filas;
    }

    interpretar(arbol: Arbol, tabla: TablaSimbolos): any {
        const filasEvaluadas: SliceValue[] = [];

        for (const fila of this.filas) {
            const valoresFila: any[] = [];
            for (const expresion of fila) {
                const valor = expresion.interpretar(arbol, tabla);
                if (valor instanceof Errores) return valor;

                const tipoExpr = expresion.tipo.tipoDato!;
                const esIntToFloat = this.subtipo === tipoDato.DECIMAL && tipoExpr === tipoDato.ENTERO;
                if (tipoExpr !== this.subtipo && !esIntToFloat) {
                    return new Errores(
                        "Semantico",
                        `La matriz esperaba ${tipoDato[this.subtipo]} y recibio ${tipoDato[tipoExpr]}`,
                        this.linea,
                        this.col
                    );
                }

                valoresFila.push(esIntToFloat ? Number(valor) : valor);
            }
            filasEvaluadas.push(new SliceValue(this.subtipo, valoresFila));
        }

        return new SliceValue(tipoDato.SLICE, filasEvaluadas);
    }

    public ast(arbol: Arbol, tabla: TablaSimbolos): Node {
        const node = new Node("MATRIX_LITERAL");
        node.pushChild(new Node(`[][]${tipoDato[this.subtipo]}`));
        for (const fila of this.filas) {
            const filaNode = new Node("FILA");
            for (const expresion of fila) {
                filaNode.pushChild(expresion.ast(arbol, tabla));
            }
            node.pushChild(filaNode);
        }
        return node;
    }
}
