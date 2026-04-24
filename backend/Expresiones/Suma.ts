import { Instruccion } from "../Abstract/Instruccion"
import { Arbol } from "../Simbolo/Arbol"
import { TablaSimbolos } from "../Simbolo/TablaSimbolos"
import { Tipo } from "../Simbolo/Tipo"
import { Errores } from "../Excepciones/Errores"
import { tipoDato } from "../Simbolo/tipoDato"
import { OperadoresAritmeticos } from "./OperadoresAritmeticos"
import { Node } from "../Abstract/Node"

export class Suma extends Instruccion {

    private operando1: Instruccion
    private operando2: Instruccion
    private operacion: OperadoresAritmeticos

    constructor(
        operando1: Instruccion,
        operando2: Instruccion,
        operacion: OperadoresAritmeticos,
        linea: number,
        columna: number
    ) {
        super(new Tipo(tipoDato.ENTERO, true), linea, columna)
        this.operando1 = operando1
        this.operando2 = operando2
        this.operacion = operacion
    }

    interpretar(arbol: Arbol, tabla: TablaSimbolos): any {

        const opIzq = this.operando1.interpretar(arbol, tabla)
        if (opIzq instanceof Errores) return opIzq

        const opDer = this.operando2.interpretar(arbol, tabla)
        if (opDer instanceof Errores) return opDer

        switch (this.operacion) {
            case OperadoresAritmeticos.SUMA:
                return this.suma(opIzq, opDer)

            default:
                return new Errores(
                    "SEMANTICO",
                    "Operador invalido",
                    this.linea,
                    this.col
                )
        }
    }

    suma(op1: any, op2: any): any {
        const tipo1 = this.operando1.tipo.tipoDato
        const tipo2 = this.operando2.tipo.tipoDato

        const boolToNumber = (valor: any) => (Boolean(valor) ? 1 : 0)
        const runeToNumber = (valor: any) => valor.toString().charCodeAt(0)

        if (tipo1 === tipoDato.CADENA || tipo2 === tipoDato.CADENA) {
            this.tipo.tipoDato = tipoDato.CADENA
            return op1.toString() + op2.toString()
        }

        if (tipo1 === tipoDato.BOOLEANO && tipo2 === tipoDato.BOOLEANO) {
            this.tipo.tipoDato = tipoDato.BOOLEANO
            return Boolean(op1) || Boolean(op2)
        }

        if (tipo1 === tipoDato.ENTERO) {
            if (tipo2 === tipoDato.ENTERO) {
                this.tipo.tipoDato = tipoDato.ENTERO
                return Number(op1) + Number(op2)
            }
            if (tipo2 === tipoDato.DECIMAL) {
                this.tipo.tipoDato = tipoDato.DECIMAL
                return Number(op1) + Number(op2)
            }
            if (tipo2 === tipoDato.BOOLEANO) {
                this.tipo.tipoDato = tipoDato.ENTERO
                return Number(op1) + boolToNumber(op2)
            }
            if (tipo2 === tipoDato.CARACTER) {
                this.tipo.tipoDato = tipoDato.ENTERO
                return Number(op1) + runeToNumber(op2)
            }
        }

        if (tipo1 === tipoDato.DECIMAL) {
            if (tipo2 === tipoDato.ENTERO || tipo2 === tipoDato.DECIMAL) {
                this.tipo.tipoDato = tipoDato.DECIMAL
                return Number(op1) + Number(op2)
            }
            if (tipo2 === tipoDato.BOOLEANO) {
                this.tipo.tipoDato = tipoDato.DECIMAL
                return Number(op1) + boolToNumber(op2)
            }
            if (tipo2 === tipoDato.CARACTER) {
                this.tipo.tipoDato = tipoDato.DECIMAL
                return Number(op1) + runeToNumber(op2)
            }
        }

        if (tipo1 === tipoDato.BOOLEANO) {
            if (tipo2 === tipoDato.ENTERO) {
                this.tipo.tipoDato = tipoDato.ENTERO
                return boolToNumber(op1) + Number(op2)
            }
            if (tipo2 === tipoDato.DECIMAL) {
                this.tipo.tipoDato = tipoDato.DECIMAL
                return boolToNumber(op1) + Number(op2)
            }
            if (tipo2 === tipoDato.CARACTER) {
                this.tipo.tipoDato = tipoDato.ENTERO
                return boolToNumber(op1) + runeToNumber(op2)
            }
        }

        if (tipo1 === tipoDato.CARACTER) {
            if (tipo2 === tipoDato.ENTERO) {
                this.tipo.tipoDato = tipoDato.ENTERO
                return runeToNumber(op1) + Number(op2)
            }
            if (tipo2 === tipoDato.DECIMAL) {
                this.tipo.tipoDato = tipoDato.DECIMAL
                return runeToNumber(op1) + Number(op2)
            }
            if (tipo2 === tipoDato.BOOLEANO) {
                this.tipo.tipoDato = tipoDato.ENTERO
                return runeToNumber(op1) + boolToNumber(op2)
            }
            if (tipo2 === tipoDato.CARACTER) {
                this.tipo.tipoDato = tipoDato.ENTERO
                return runeToNumber(op1) + runeToNumber(op2)
            }
        }

        return new Errores("SEMANTICO", "Suma erronea", this.linea, this.col)
    }

    public ast(arbol: Arbol, tabla: TablaSimbolos): Node {
        let node = new Node("SUMA");
        node.pushChild(new Node(this.operando1.interpretar(arbol, tabla).toString()));
        node.pushChild(new Node("+"));
        node.pushChild(new Node(this.operando2.interpretar(arbol, tabla).toString()));
        return node;
    }

}