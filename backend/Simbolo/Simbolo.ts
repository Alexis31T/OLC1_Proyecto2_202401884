import { Tipo } from "./Tipo";

export class Simbolo {

    public tipo: Tipo
    public id: string
    public valor: any
    public linea: number
    public columna: number
    public entorno: string
    public tipoStruct?: string
    public subtipo?: number
    
    constructor(
        tipo: Tipo,
        id: string,
        valor: any,
        linea: number,
        columna: number,
        entorno: string,
        tipoStruct?: string,
        subtipo?: number
    ) {
        this.tipo = tipo
        this.id = id
        this.valor = valor
        this.linea = linea
        this.columna = columna
        this.entorno = entorno
        this.tipoStruct = tipoStruct
        this.subtipo = subtipo
    }

}