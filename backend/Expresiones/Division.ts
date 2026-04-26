import { Instruccion } from "../Abstract/Instruccion"
import { Arbol } from "../Simbolo/Arbol"
import { TablaSimbolos } from "../Simbolo/TablaSimbolos"
import { Tipo } from "../Simbolo/Tipo"
import { Errores } from "../Excepciones/Errores"
import { tipoDato } from "../Simbolo/tipoDato"
import { OperadoresAritmeticos } from "./OperadoresAritmeticos"
import { Node } from "../Abstract/Node"

export class Division extends Instruccion {

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
            case OperadoresAritmeticos.DIVISION:
                return this.division(opIzq, opDer)

            default:
                return new Errores(
                    "SEMANTICO",
                    "Operador invalido",
                    this.linea,
                    this.col
                )
        }
    }

    division(op1: any, op2: any): any {
        const tipo1 = this.operando1.tipo.tipoDato
        const tipo2 = this.operando2.tipo.tipoDato

        const divisor = Number(op2)
        if (divisor === 0) {
            return new Errores("SEMANTICO", "No se puede dividir dentro de 0", this.linea, this.col)
        }

        if (tipo1 === tipoDato.ENTERO) {
            if (tipo2 === tipoDato.ENTERO) {
                this.tipo.tipoDato = tipoDato.ENTERO
                return Math.trunc(Number(op1) / Number(op2))
            }
            if (tipo2 === tipoDato.DECIMAL) {
                this.tipo.tipoDato = tipoDato.DECIMAL
                return Number(op1) / Number(op2)
            }
        }

        if (tipo1 === tipoDato.DECIMAL) {
            if (tipo2 === tipoDato.ENTERO || tipo2 === tipoDato.DECIMAL) {
                this.tipo.tipoDato = tipoDato.DECIMAL
                return Number(op1) / Number(op2)
            }
        }

        return new Errores("SEMANTICO", "Division erronea", this.linea, this.col)
    }

    public ast(arbol: Arbol, tabla: TablaSimbolos): Node {
        let node = new Node("DIVISION");
        node.pushChild(this.operando1.ast(arbol, tabla));
        node.pushChild(new Node("/"));
        node.pushChild(this.operando2.ast(arbol, tabla));
        return node;
    }

}