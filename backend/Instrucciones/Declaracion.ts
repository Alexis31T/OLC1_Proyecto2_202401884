import { Instruccion } from "../Abstract/Instruccion";
import { TablaSimbolos } from "../Simbolo/TablaSimbolos";
import { Simbolo } from "../Simbolo/Simbolo";
import { Tipo } from "../Simbolo/Tipo";
import { Errores } from "../Excepciones/Errores";
import { tipoInstruccion } from "../Simbolo/tipoInstruccion";
import { Node } from "../Abstract/Node";
import { tipoDato } from "../Simbolo/tipoDato";
import { SliceValue } from "../Simbolo/SliceValue";

export class Declaracion extends Instruccion {

    tipoDeclarado: any;
    id: string;
    valor: any;

    constructor(tipo: any, id: string, valor: any, linea: number, columna: number) {
        super(new Tipo(tipoInstruccion.DECLARACION, false), linea, columna);
        this.tipoDeclarado = tipo;
        this.id = id;
        this.valor = valor;
    }

    interpretar(arbol: any, tabla: TablaSimbolos): Errores | null {
        let resultado: any = null;
        if (this.valor !== null) {
            resultado = this.valor.interpretar(arbol, tabla);
            if (resultado instanceof Errores) {
                return resultado;
            }
            const tipoValor = this.valor.tipo.tipoDato;
            const esIntToFloat = this.tipoDeclarado === tipoDato.DECIMAL && tipoValor === tipoDato.ENTERO;
            if (this.tipoDeclarado !== tipoValor && !esIntToFloat) {
                return new Errores(
                    "Semantico",
                    `No se puede declarar ${this.id} de tipo ${tipoDato[this.tipoDeclarado]} con valor ${tipoDato[tipoValor]}`,
                    this.linea,
                    this.col
                );
            }
            if (esIntToFloat) {
                resultado = Number(resultado);
            }
        } else {
            switch (this.tipoDeclarado) {
                case tipoDato.ENTERO:
                    resultado = 0;
                    break;
                case tipoDato.DECIMAL:
                    resultado = 0.0;
                    break;
                case tipoDato.CADENA:
                    resultado = "";
                    break;
                case tipoDato.BOOLEANO:
                    resultado = false;
                    break;
                case tipoDato.CARACTER:
                    resultado = "\u0000";
                    break;
                case tipoDato.SLICE:
                    resultado = new SliceValue(tipoDato.NULO, []);
                    break;
                default:
                    resultado = null;
            }
        }

        const simbolo = new Simbolo(
            new Tipo(this.tipoDeclarado, true),
            this.id,
            resultado,
            this.linea,
            this.col, 
            tabla.nombreEntorno
        );

        const posibleError = tabla.setVariable(simbolo);
        if (posibleError instanceof Errores) {
            return posibleError;
        }
        arbol.simbolos.push(simbolo);
        return null;
    }

    public ast(arbol: any, tabla: TablaSimbolos): Node {
        let node = new Node("DECLARACION");
        node.pushChild(new Node(tipoDato[this.tipoDeclarado].toString()));
        node.pushChild(new Node(this.id));
        if (this.valor) {
            node.pushChild(this.valor.ast(arbol, tabla));
        } else {
            node.pushChild(new Node("default"));
        }
        return node;
    }
}