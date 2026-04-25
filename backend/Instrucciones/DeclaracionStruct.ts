import { Instruccion } from "../Abstract/Instruccion";
import { Node } from "../Abstract/Node";
import { Errores } from "../Excepciones/Errores";
import { Arbol } from "../Simbolo/Arbol";
import { Simbolo } from "../Simbolo/Simbolo";
import { StructValue } from "../Simbolo/StructValue";
import { TablaSimbolos } from "../Simbolo/TablaSimbolos";
import { Tipo } from "../Simbolo/Tipo";
import { tipoDato } from "../Simbolo/tipoDato";
import { tipoInstruccion } from "../Simbolo/tipoInstruccion";

export class DeclaracionStruct extends Instruccion {
    private nombreStruct: string;
    private id: string;
    private valor: Instruccion | null;

    constructor(nombreStruct: string, id: string, valor: Instruccion | null, linea: number, columna: number) {
        super(new Tipo(tipoInstruccion.DECLARACION, false), linea, columna);
        this.nombreStruct = nombreStruct;
        this.id = id;
        this.valor = valor;
    }

    interpretar(arbol: Arbol, tabla: TablaSimbolos): any {
        if (!arbol.structs.has(this.nombreStruct)) {
            return new Errores("Semantico", `El struct ${this.nombreStruct} no existe`, this.linea, this.col);
        }

        let resultado: any = null;
        if (this.valor !== null) {
            resultado = this.valor.interpretar(arbol, tabla);
            if (resultado instanceof Errores) return resultado;
            if (this.valor.tipo.tipoDato === tipoDato.NULO) {
                resultado = null;
            } else
            if (!(resultado instanceof StructValue) || resultado.nombre !== this.nombreStruct) {
                return new Errores("Semantico", `No se puede declarar ${this.id} como ${this.nombreStruct}`, this.linea, this.col);
            }
        }

        const simbolo = new Simbolo(
            new Tipo(tipoDato.STRUCT, true),
            this.id,
            resultado,
            this.linea,
            this.col,
            tabla.nombreEntorno,
            this.nombreStruct
        );

        const posibleError = tabla.setVariable(simbolo);
        if (posibleError instanceof Errores) return posibleError;
        arbol.simbolos.push(simbolo);
        return null;
    }

    public ast(arbol: Arbol, tabla: TablaSimbolos): Node {
        const node = new Node("DECLARACION_STRUCT");
        node.pushChild(new Node(this.nombreStruct));
        node.pushChild(new Node(this.id));
        if (this.valor) {
            node.pushChild(this.valor.ast(arbol, tabla));
        } else {
            node.pushChild(new Node("nil"));
        }
        return node;
    }
}
