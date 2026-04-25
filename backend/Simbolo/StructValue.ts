import { CampoStruct } from "./Arbol";

export class StructValue {
    public nombre: string;
    public campos: Map<string, any>;
    public definicion: CampoStruct[];

    constructor(nombre: string, definicion: CampoStruct[], campos: Map<string, any>) {
        this.nombre = nombre;
        this.definicion = definicion;
        this.campos = campos;
    }

    getCampo(nombreCampo: string): any {
        return this.campos.get(nombreCampo);
    }

    setCampo(nombreCampo: string, valor: any): void {
        this.campos.set(nombreCampo, valor);
    }
}
