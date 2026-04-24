import { Instruccion } from "../Abstract/Instruccion";
import { Node } from "../Abstract/Node";
import { Errores } from "../Excepciones/Errores";
import { Arbol } from "../Simbolo/Arbol";
import { TablaSimbolos } from "../Simbolo/TablaSimbolos";
import { Tipo } from "../Simbolo/Tipo";
import { tipoDato } from "../Simbolo/tipoDato";
import { tipoInstruccion } from "../Simbolo/tipoInstruccion";

export enum OperadorUnario {
    INCREMENTO = "INCREMENTO",
    DECREMENTO = "DECREMENTO"
}

export class ActualizacionUnaria extends Instruccion {
    private id: string;
    private operador: OperadorUnario;

    constructor(id: string, operador: OperadorUnario, linea: number, columna: number) {
        super(new Tipo(tipoInstruccion.ACTUALIZACION_UNARIA, false), linea, columna);
        this.id = id;
        this.operador = operador;
    }

    interpretar(_arbol: Arbol, tabla: TablaSimbolos): any {
        const simbolo = tabla.getVariable(this.id);
        if (!simbolo) {
            return new Errores("Semantico", `La variable ${this.id} no existe`, this.linea, this.col);
        }

        if (simbolo.tipo.tipoDato !== tipoDato.ENTERO && simbolo.tipo.tipoDato !== tipoDato.DECIMAL) {
            return new Errores("Semantico", `El operador ${this.operador === OperadorUnario.INCREMENTO ? "++" : "--"} solo aplica a int o float64`, this.linea, this.col);
        }

        if (this.operador === OperadorUnario.INCREMENTO) {
            simbolo.valor = Number(simbolo.valor) + 1;
        } else {
            simbolo.valor = Number(simbolo.valor) - 1;
        }

        return null;
    }

    public ast(_arbol: Arbol, _tabla: TablaSimbolos): Node {
        const node = new Node("ACTUALIZACION_UNARIA");
        node.pushChild(new Node(this.id));
        node.pushChild(new Node(this.operador === OperadorUnario.INCREMENTO ? "++" : "--"));
        return node;
    }
}
