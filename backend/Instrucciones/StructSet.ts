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
    private objetivo: string | Instruccion;
    private campo: string;
    private valor: Instruccion;

    constructor(objetivo: string | Instruccion, campo: string, valor: Instruccion, linea: number, columna: number) {
        super(new Tipo(tipoInstruccion.ASIGNACION, false), linea, columna);
        this.objetivo = objetivo;
        this.campo = campo;
        this.valor = valor;
    }

    interpretar(arbol: Arbol, tabla: TablaSimbolos): any {
        const structObjetivo = typeof this.objetivo === "string"
            ? this.obtenerVariable(tabla)
            : this.objetivo.interpretar(arbol, tabla);
        if (structObjetivo instanceof Errores) return structObjetivo;

        if (!(structObjetivo instanceof StructValue)) {
            return new Errores("Semantico", `El acceso .${this.campo} requiere un struct`, this.linea, this.col);
        }

        const campoDef = structObjetivo.definicion.find((campo) => campo.id === this.campo);
        if (!campoDef) {
            return new Errores("Semantico", `El struct ${structObjetivo.nombre} no tiene campo ${this.campo}`, this.linea, this.col);
        }

        const nuevoValor = this.valor.interpretar(arbol, tabla);
        if (nuevoValor instanceof Errores) return nuevoValor;

        const tipoNuevo = this.valor.tipo.tipoDato!;
        const esNil = tipoNuevo === tipoDato.NULO;
        if (esNil) {
            if (campoDef.tipo !== tipoDato.STRUCT) {
                return new Errores("Semantico", `No se puede asignar nil al campo ${this.campo}`, this.linea, this.col);
            }
            structObjetivo.setCampo(this.campo, null);
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

        structObjetivo.setCampo(this.campo, esIntToFloat ? Number(nuevoValor) : nuevoValor);
        return null;
    }

    private obtenerVariable(tabla: TablaSimbolos): any {
        const simbolo = tabla.getVariable(this.objetivo as string);
        if (!simbolo) {
            return new Errores("Semantico", `La variable ${this.objetivo} no existe`, this.linea, this.col);
        }
        return simbolo.valor;
    }

    public ast(arbol: Arbol, tabla: TablaSimbolos): Node {
        const node = new Node("STRUCT_SET");
        node.pushChild(typeof this.objetivo === "string" ? new Node(this.objetivo) : this.objetivo.ast(arbol, tabla));
        node.pushChild(new Node(this.campo));
        node.pushChild(this.valor.ast(arbol, tabla));
        return node;
    }
}
