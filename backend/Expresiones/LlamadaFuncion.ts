import { Instruccion } from "../Abstract/Instruccion";
import { Node } from "../Abstract/Node";
import { Errores } from "../Excepciones/Errores";
import { Arbol } from "../Simbolo/Arbol";
import { TablaSimbolos } from "../Simbolo/TablaSimbolos";
import { Tipo } from "../Simbolo/Tipo";
import { tipoDato } from "../Simbolo/tipoDato";
import { Funcion } from "../Instrucciones/Funcion";

export class LlamadaFuncion extends Instruccion {
    private id: string;
    private argumentos: Instruccion[];

    constructor(id: string, argumentos: Instruccion[], linea: number, columna: number) {
        super(new Tipo(tipoDato.NULO, true), linea, columna);
        this.id = id;
        this.argumentos = argumentos;
    }

    interpretar(arbol: Arbol, tabla: TablaSimbolos): any {
        let encontrada: Funcion | null = null;
        for (const instruccion of arbol.instrucciones) {
            if (instruccion instanceof Funcion && instruccion.id === this.id) {
                encontrada = instruccion;
                break;
            }
        }

        if (!encontrada) {
            return new Errores("Semantico", `La funcion ${this.id} no existe`, this.linea, this.col);
        }

        const resultado = encontrada.ejecutar(arbol, tabla, this.argumentos);
        if (resultado instanceof Errores) return resultado;

        this.tipo.tipoDato = encontrada.tipoRetorno?.tipo ?? tipoDato.NULO;
        return resultado;
    }

    public ast(arbol: Arbol, tabla: TablaSimbolos): Node {
        const node = new Node("LLAMADA_FUNCION");
        node.pushChild(new Node(this.id));
        const args = new Node("ARGUMENTOS");
        for (const arg of this.argumentos) {
            args.pushChild(arg.ast(arbol, tabla));
        }
        node.pushChild(args);
        return node;
    }
}
