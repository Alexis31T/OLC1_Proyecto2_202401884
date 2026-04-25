import { Instruccion } from "../Abstract/Instruccion"
import { TablaSimbolos } from "./TablaSimbolos"
import { Errores } from "../Excepciones/Errores"
import { Simbolo } from "./Simbolo"
import { tipoDato } from "./tipoDato"

export type CampoStruct = {
    id: string
    tipo: tipoDato
    tipoStruct?: string | null
}

export class Arbol {

    instrucciones: Instruccion[]
    consola: string = ""
    tablaGlobal: TablaSimbolos
    errores: Errores[] = []
    simbolos: Simbolo[] = []
    structs: Map<string, CampoStruct[]> = new Map()
    contador: number = 0

    constructor(instrucciones: Instruccion[]) {
        this.instrucciones = instrucciones
        this.tablaGlobal = new TablaSimbolos()
    }

    print(valor: string) {
        this.consola += valor + "\n"
    }

    getContador(): number {
        this.contador++
        return this.contador
    }

}