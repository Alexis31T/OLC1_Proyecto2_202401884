import { Instruccion } from "../Abstract/Instruccion";
import { Node } from "../Abstract/Node";
import { Errores } from "../Excepciones/Errores";
import { Arbol, CampoStruct } from "../Simbolo/Arbol";
import { StructValue } from "../Simbolo/StructValue";
import { TablaSimbolos } from "../Simbolo/TablaSimbolos";
import { Tipo } from "../Simbolo/Tipo";
import { tipoDato } from "../Simbolo/tipoDato";

export type CampoInicializador = {
    id: string;
    valor: Instruccion;
};

export class StructLiteral extends Instruccion {
    private nombreStruct: string;
    private inicializadores: CampoInicializador[];

    constructor(nombreStruct: string, inicializadores: CampoInicializador[], linea: number, columna: number) {
        super(new Tipo(tipoDato.STRUCT, true), linea, columna);
        this.nombreStruct = nombreStruct;
        this.inicializadores = inicializadores;
    }

    interpretar(arbol: Arbol, tabla: TablaSimbolos): any {
        const definicion = arbol.structs.get(this.nombreStruct);
        if (!definicion) {
            return new Errores("Semantico", `El struct ${this.nombreStruct} no existe`, this.linea, this.col);
        }

        const campos = new Map<string, any>();
        for (const campo of definicion) {
            campos.set(campo.id, this.valorPorDefecto(campo, arbol));
        }

        const usados = new Set<string>();
        for (const inicializador of this.inicializadores) {
            if (usados.has(inicializador.id)) {
                return new Errores("Semantico", `El campo ${inicializador.id} esta repetido`, this.linea, this.col);
            }
            usados.add(inicializador.id);

            const campo = definicion.find((item) => item.id === inicializador.id);
            if (!campo) {
                return new Errores("Semantico", `El struct ${this.nombreStruct} no tiene campo ${inicializador.id}`, this.linea, this.col);
            }

            const valor = inicializador.valor.interpretar(arbol, tabla);
            if (valor instanceof Errores) return valor;

            const tipoValor = inicializador.valor.tipo.tipoDato!;
            const esNil = tipoValor === tipoDato.NULO;
            if (esNil) {
                if (campo.tipo !== tipoDato.STRUCT) {
                    return new Errores("Semantico", `El campo ${campo.id} no puede recibir nil`, this.linea, this.col);
                }
                campos.set(campo.id, null);
                continue;
            }
            const esIntToFloat = campo.tipo === tipoDato.DECIMAL && tipoValor === tipoDato.ENTERO;
            if (campo.tipo !== tipoValor && !esIntToFloat) {
                return new Errores("Semantico", `El campo ${campo.id} esperaba ${tipoDato[campo.tipo]}`, this.linea, this.col);
            }

            if (campo.tipo === tipoDato.STRUCT) {
                if (!(valor instanceof StructValue) || valor.nombre !== campo.tipoStruct) {
                    return new Errores("Semantico", `El campo ${campo.id} esperaba struct ${campo.tipoStruct}`, this.linea, this.col);
                }
            }

            campos.set(campo.id, esIntToFloat ? Number(valor) : valor);
        }

        return new StructValue(this.nombreStruct, definicion, campos);
    }

    private valorPorDefecto(campo: CampoStruct, arbol: Arbol): any {
        switch (campo.tipo) {
            case tipoDato.ENTERO:
                return 0;
            case tipoDato.DECIMAL:
                return 0.0;
            case tipoDato.CADENA:
                return "";
            case tipoDato.BOOLEANO:
                return false;
            case tipoDato.CARACTER:
                return "\u0000";
            case tipoDato.STRUCT:
                return null;
            default:
                return null;
        }
    }

    public ast(arbol: Arbol, tabla: TablaSimbolos): Node {
        const node = new Node("STRUCT_LITERAL");
        node.pushChild(new Node(this.nombreStruct));
        for (const inicializador of this.inicializadores) {
            const campoNode = new Node(inicializador.id);
            campoNode.pushChild(inicializador.valor.ast(arbol, tabla));
            node.pushChild(campoNode);
        }
        return node;
    }
}
