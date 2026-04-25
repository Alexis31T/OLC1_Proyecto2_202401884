import { Instruccion } from "../Abstract/Instruccion";
import { Node } from "../Abstract/Node";
import { Errores } from "../Excepciones/Errores";
import { Arbol } from "../Simbolo/Arbol";
import { StructValue } from "../Simbolo/StructValue";
import { TablaSimbolos } from "../Simbolo/TablaSimbolos";
import { Tipo } from "../Simbolo/Tipo";
import { tipoDato } from "../Simbolo/tipoDato";
import { tipoInstruccion } from "../Simbolo/tipoInstruccion";

export class StructSet extends Instruccion {
    private id: string;
    private campo: string;
    private valor: Instruccion;

    constructor(id: string, campo: string, valor: Instruccion, linea: number, columna: number) {
        super(new Tipo(tipoInstruccion.ASIGNACION, false), linea, columna);
        this.id = id;
        this.campo = campo;
        this.valor = valor;
    }

    interpretar(arbol: Arbol, tabla: TablaSimbolos): any {
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

        const nuevoValor = this.valor.interpretar(arbol, tabla);
        if (nuevoValor instanceof Errores) return nuevoValor;

        const tipoNuevo = this.valor.tipo.tipoDato!;
        const esNil = tipoNuevo === tipoDato.NULO;
        if (esNil) {
            if (campoDef.tipo !== tipoDato.STRUCT) {
                return new Errores("Semantico", `No se puede asignar nil al campo ${this.campo}`, this.linea, this.col);
            }
            simbolo.valor.setCampo(this.campo, null);
            return null;
        }
        const esIntToFloat = campoDef.tipo === tipoDato.DECIMAL && tipoNuevo === tipoDato.ENTERO;
        if (campoDef.tipo !== tipoNuevo && !esIntToFloat) {
            return new Errores("Semantico", `No se puede asignar ${tipoDato[tipoNuevo]} al campo ${this.campo}`, this.linea, this.col);
        }

        if (campoDef.tipo === tipoDato.STRUCT) {
            if (!(nuevoValor instanceof StructValue) || nuevoValor.nombre !== campoDef.tipoStruct) {
                return new Errores("Semantico", `El campo ${this.campo} esperaba struct ${campoDef.tipoStruct}`, this.linea, this.col);
            }
        }

        simbolo.valor.setCampo(this.campo, esIntToFloat ? Number(nuevoValor) : nuevoValor);
        return null;
    }

    public ast(arbol: Arbol, tabla: TablaSimbolos): Node {
        const node = new Node("STRUCT_SET");
        node.pushChild(new Node(this.id));
        node.pushChild(new Node(this.campo));
        node.pushChild(this.valor.ast(arbol, tabla));
        return node;
    }
}
