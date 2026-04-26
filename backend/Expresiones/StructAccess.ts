import { Instruccion } from "../Abstract/Instruccion";
import { Node } from "../Abstract/Node";
import { Errores } from "../Excepciones/Errores";
import { Arbol } from "../Simbolo/Arbol";
import { StructValue } from "../Simbolo/StructValue";
import { TablaSimbolos } from "../Simbolo/TablaSimbolos";
import { Tipo } from "../Simbolo/Tipo";
import { tipoDato } from "../Simbolo/tipoDato";

export class StructAccess extends Instruccion {
    private objetivo: string | Instruccion;
    private campo: string;

    constructor(objetivo: string | Instruccion, campo: string, linea: number, columna: number) {
        super(new Tipo(tipoDato.NULO, true), linea, columna);
        this.objetivo = objetivo;
        this.campo = campo;
    }

    interpretar(arbol: Arbol, tabla: TablaSimbolos): any {
        const valorObjetivo = typeof this.objetivo === "string"
            ? this.obtenerVariable(tabla)
            : this.objetivo.interpretar(arbol, tabla);
        if (valorObjetivo instanceof Errores) return valorObjetivo;

        if (!(valorObjetivo instanceof StructValue)) {
            if (this.campo === "string") {
                this.tipo.tipoDato = tipoDato.CADENA;
                return String(valorObjetivo);
            }
            return new Errores("Semantico", `El acceso .${this.campo} requiere un struct`, this.linea, this.col);
        }

        const campoDef = valorObjetivo.definicion.find((campo) => campo.id === this.campo);
        if (!campoDef) {
            return new Errores("Semantico", `El struct ${valorObjetivo.nombre} no tiene campo ${this.campo}`, this.linea, this.col);
        }

        this.tipo.tipoDato = campoDef.tipo;
        return valorObjetivo.getCampo(this.campo);
    }

    private obtenerVariable(tabla: TablaSimbolos): any {
        const simbolo = tabla.getVariable(this.objetivo as string);
        if (!simbolo) {
            return new Errores("Semantico", `La variable ${this.objetivo} no existe`, this.linea, this.col);
        }
        return simbolo.valor;
    }

    public ast(_arbol: Arbol, _tabla: TablaSimbolos): Node {
        const node = new Node("STRUCT_ACCESS");
        node.pushChild(typeof this.objetivo === "string" ? new Node(this.objetivo) : this.objetivo.ast(_arbol, _tabla));
        node.pushChild(new Node(this.campo));
        return node;
    }
}
