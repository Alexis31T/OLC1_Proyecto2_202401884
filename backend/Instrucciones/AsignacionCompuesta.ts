import { Instruccion } from "../Abstract/Instruccion";
import { Node } from "../Abstract/Node";
import { Errores } from "../Excepciones/Errores";
import { Arbol } from "../Simbolo/Arbol";
import { TablaSimbolos } from "../Simbolo/TablaSimbolos";
import { Tipo } from "../Simbolo/Tipo";
import { tipoDato } from "../Simbolo/tipoDato";
import { tipoInstruccion } from "../Simbolo/tipoInstruccion";

export enum OperadorAsignacionCompuesta {
    SUMA = "SUMA",
    RESTA = "RESTA"
}

export class AsignacionCompuesta extends Instruccion {
    private id: string;
    private valor: Instruccion;
    private operador: OperadorAsignacionCompuesta;

    constructor(id: string, operador: OperadorAsignacionCompuesta, valor: Instruccion, linea: number, columna: number) {
        super(new Tipo(tipoInstruccion.ASIGNACION_COMPUESTA, false), linea, columna);
        this.id = id;
        this.operador = operador;
        this.valor = valor;
    }

    interpretar(arbol: Arbol, tabla: TablaSimbolos): any {
        const simbolo = tabla.getVariable(this.id);
        if (!simbolo) {
            return new Errores("Semantico", `La variable ${this.id} no existe`, this.linea, this.col);
        }

        const valorDerecha = this.valor.interpretar(arbol, tabla);
        if (valorDerecha instanceof Errores) return valorDerecha;

        const tipoIzq = simbolo.tipo.tipoDato!;
        const tipoDer = this.valor.tipo.tipoDato!;

        const boolToNumber = (valor: any) => (Boolean(valor) ? 1 : 0);
        const runeToNumber = (valor: any) => valor.toString().charCodeAt(0);

        if (this.operador === OperadorAsignacionCompuesta.SUMA) {
            if (tipoIzq === tipoDato.CADENA) {
                simbolo.valor = simbolo.valor.toString() + valorDerecha.toString();
                return null;
            }

            if (tipoIzq === tipoDato.BOOLEANO && tipoDer === tipoDato.BOOLEANO) {
                simbolo.valor = Boolean(simbolo.valor) || Boolean(valorDerecha);
                return null;
            }

            if (tipoIzq === tipoDato.ENTERO) {
                if (tipoDer === tipoDato.ENTERO) {
                    simbolo.valor = Number(simbolo.valor) + Number(valorDerecha);
                    return null;
                }
                if (tipoDer === tipoDato.BOOLEANO) {
                    simbolo.valor = Number(simbolo.valor) + boolToNumber(valorDerecha);
                    return null;
                }
                if (tipoDer === tipoDato.CARACTER) {
                    simbolo.valor = Number(simbolo.valor) + runeToNumber(valorDerecha);
                    return null;
                }
            }

            if (tipoIzq === tipoDato.DECIMAL) {
                if (tipoDer === tipoDato.ENTERO || tipoDer === tipoDato.DECIMAL) {
                    simbolo.valor = Number(simbolo.valor) + Number(valorDerecha);
                    return null;
                }
                if (tipoDer === tipoDato.BOOLEANO) {
                    simbolo.valor = Number(simbolo.valor) + boolToNumber(valorDerecha);
                    return null;
                }
                if (tipoDer === tipoDato.CARACTER) {
                    simbolo.valor = Number(simbolo.valor) + runeToNumber(valorDerecha);
                    return null;
                }
            }

            if (tipoIzq === tipoDato.CARACTER) {
                if (tipoDer === tipoDato.ENTERO || tipoDer === tipoDato.DECIMAL) {
                    return new Errores("Semantico", `No se puede asignar un valor ${tipoDato[tipoDer]} a ${this.id} de tipo rune`, this.linea, this.col);
                }
            }
        }

        if (this.operador === OperadorAsignacionCompuesta.RESTA) {
            if (tipoIzq === tipoDato.ENTERO) {
                if (tipoDer === tipoDato.ENTERO) {
                    simbolo.valor = Number(simbolo.valor) - Number(valorDerecha);
                    return null;
                }
                if (tipoDer === tipoDato.BOOLEANO) {
                    simbolo.valor = Number(simbolo.valor) - boolToNumber(valorDerecha);
                    return null;
                }
                if (tipoDer === tipoDato.CARACTER) {
                    simbolo.valor = Number(simbolo.valor) - runeToNumber(valorDerecha);
                    return null;
                }
            }

            if (tipoIzq === tipoDato.DECIMAL) {
                if (tipoDer === tipoDato.ENTERO || tipoDer === tipoDato.DECIMAL) {
                    simbolo.valor = Number(simbolo.valor) - Number(valorDerecha);
                    return null;
                }
                if (tipoDer === tipoDato.BOOLEANO) {
                    simbolo.valor = Number(simbolo.valor) - boolToNumber(valorDerecha);
                    return null;
                }
                if (tipoDer === tipoDato.CARACTER) {
                    simbolo.valor = Number(simbolo.valor) - runeToNumber(valorDerecha);
                    return null;
                }
            }
        }

        return new Errores(
            "Semantico",
            `Operacion ${this.operador === OperadorAsignacionCompuesta.SUMA ? "+=" : "-="} invalida para ${tipoDato[tipoIzq]} y ${tipoDato[tipoDer]}`,
            this.linea,
            this.col
        );
    }

    public ast(arbol: Arbol, tabla: TablaSimbolos): Node {
        const node = new Node("ASIGNACION_COMPUESTA");
        node.pushChild(new Node(this.id));
        node.pushChild(new Node(this.operador === OperadorAsignacionCompuesta.SUMA ? "+=" : "-="));
        node.pushChild(this.valor.ast(arbol, tabla));
        return node;
    }
}
