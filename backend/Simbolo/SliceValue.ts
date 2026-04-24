import { tipoDato } from "./tipoDato";

export class SliceValue {
    public subtipo: tipoDato;
    public valores: any[];

    constructor(subtipo: tipoDato, valores: any[] = []) {
        this.subtipo = subtipo;
        this.valores = valores;
    }
}
