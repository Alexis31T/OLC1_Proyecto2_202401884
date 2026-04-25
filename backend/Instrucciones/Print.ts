import { Instruccion } from "../Abstract/Instruccion"
import { Arbol } from "../Simbolo/Arbol"
import { TablaSimbolos } from "../Simbolo/TablaSimbolos"
import { Errores } from "../Excepciones/Errores"
import { Tipo } from "../Simbolo/Tipo"
import { tipoDato } from "../Simbolo/tipoDato"
import { tipoInstruccion } from "../Simbolo/tipoInstruccion"
import { Node } from "../Abstract/Node"
import { SliceValue } from "../Simbolo/SliceValue"
import { StructValue } from "../Simbolo/StructValue"

export class Print extends Instruccion {

    private expresion: Instruccion | Instruccion[]

    constructor(expresion: Instruccion | Instruccion[], linea: number, col: number) {
        super(new Tipo(tipoInstruccion.PRINT), linea, col)
        this.expresion = expresion
    }

    interpretar(arbol: Arbol, tabla: TablaSimbolos): any {
        if (Array.isArray(this.expresion)) {
            const salida: string[] = []
            for (const item of this.expresion) {
                const valor = item.interpretar(arbol, tabla)
                if (valor instanceof Errores) {
                    return valor
                }
                if (valor === null || valor === undefined) {
                    salida.push("nil")
                } else if (valor instanceof SliceValue) {
                    salida.push(`[${valor.valores.map((v) => String(v)).join(" ")}]`)
                } else if (valor instanceof StructValue) {
                    salida.push(this.formatearStruct(valor))
                } else {
                    salida.push(valor.toString())
                }
            }
            arbol.print(salida.join(" "))
        } else {
            const valor = this.expresion.interpretar(arbol, tabla)
            if (valor instanceof Errores) {
                return valor
            }
            if (valor === null || valor === undefined) {
                arbol.print("nil")
            } else if (valor instanceof SliceValue) {
                arbol.print(`[${valor.valores.map((v) => String(v)).join(" ")}]`)
            } else if (valor instanceof StructValue) {
                arbol.print(this.formatearStruct(valor))
            } else {
                arbol.print(valor.toString())
            }
        }

        return null
    }

    private formatearStruct(valor: StructValue): string {
        const campos = valor.definicion.map((campo) => `${campo.id}: ${valor.getCampo(campo.id)}`)
        return `${valor.nombre}{${campos.join(", ")}}`
    }

    public ast(arbol: Arbol, tabla: TablaSimbolos): Node {
        let node = new Node("PRINT");
        if (Array.isArray(this.expresion)) {
            for (const item of this.expresion) {
                node.pushChild(item.ast(arbol, tabla));
            }
        } else {
            node.pushChild(this.expresion.ast(arbol, tabla));
        }
        return node;
    }
    

}