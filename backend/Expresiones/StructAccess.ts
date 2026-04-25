import { Instruccion } from "../Abstract/Instruccion";
import { Node } from "../Abstract/Node";
import { Errores } from "../Excepciones/Errores";
import { Arbol } from "../Simbolo/Arbol";
import { StructValue } from "../Simbolo/StructValue";
import { TablaSimbolos } from "../Simbolo/TablaSimbolos";
import { Tipo } from "../Simbolo/Tipo";
import { tipoDato } from "../Simbolo/tipoDato";

export class StructAccess extends Instruccion {
    private id: string;
    private campo: string;

    constructor(id: string, campo: string, linea: number, columna: number) {
        super(new Tipo(tipoDato.NULO, true), linea, columna);
        this.id = id;
        this.campo = campo;
    }

    interpretar(_arbol: Arbol, tabla: TablaSimbolos): any {
        const simbolo = tabla.getVariable(this.id);
        if (!simbolo) {
            return new Errores("Semantico", `La variable ${this.id} no existe`, this.linea, this.col);
        }
        if (!(simbolo.valor instanceof StructValue)) {
            return new Errores("Semantico", `${this.id} no es una instancia de struct`, this.linea, this.col);
        }

        const campoDef = simbolo.valor.definicion.find((campo) => campo.id === this.campo);
        if (!campoDef) {
            return new Errores("Semantico", `El struct ${simbolo.valor.nombre} no tiene campo ${this.campo}`, this.linea, this.col);
        }

        this.tipo.tipoDato = campoDef.tipo;
        return simbolo.valor.getCampo(this.campo);
    }

    public ast(_arbol: Arbol, _tabla: TablaSimbolos): Node {
        const node = new Node("STRUCT_ACCESS");
        node.pushChild(new Node(this.id));
        node.pushChild(new Node(this.campo));
        return node;
    }
}
