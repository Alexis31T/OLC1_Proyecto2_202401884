import { Instruccion } from "../Abstract/Instruccion";
import { Node } from "../Abstract/Node";
import { Errores } from "../Excepciones/Errores";
import { Arbol } from "../Simbolo/Arbol";
import { Simbolo } from "../Simbolo/Simbolo";
import { TablaSimbolos } from "../Simbolo/TablaSimbolos";
import { Tipo } from "../Simbolo/Tipo";
import { SliceValue } from "../Simbolo/SliceValue";
import { tipoDato } from "../Simbolo/tipoDato";
import { tipoInstruccion } from "../Simbolo/tipoInstruccion";
import { Break } from "./Break";
import { Continue } from "./Continue";
import { Return } from "./Return";

export class ForRange extends Instruccion {
    private idIndice: string;
    private idValor: string;
    private expresionSlice: Instruccion;
    private cuerpo: Instruccion;

    constructor(idIndice: string, idValor: string, expresionSlice: Instruccion, cuerpo: Instruccion, linea: number, columna: number) {
        super(new Tipo(tipoInstruccion.FOR, false), linea, columna);
        this.idIndice = idIndice;
        this.idValor = idValor;
        this.expresionSlice = expresionSlice;
        this.cuerpo = cuerpo;
    }

    interpretar(arbol: Arbol, tabla: TablaSimbolos): any {
        const sliceEvaluado = this.expresionSlice.interpretar(arbol, tabla);
        if (sliceEvaluado instanceof Errores) return sliceEvaluado;

        const iterable = sliceEvaluado instanceof SliceValue
            ? sliceEvaluado
            : this.expresionSlice.tipo.tipoDato === tipoDato.CADENA
                ? new SliceValue(tipoDato.CARACTER, String(sliceEvaluado).split(""))
                : null;

        if (iterable === null) {
            return new Errores("Semantico", "El for range solo acepta una expresion de tipo slice o string", this.linea, this.col);
        }

        const entornoFor = new TablaSimbolos(tabla, "ForRange");
        const simboloIndice = new Simbolo(
            new Tipo(tipoDato.ENTERO, true),
            this.idIndice,
            0,
            this.linea,
            this.col,
            entornoFor.nombreEntorno
        );
        const simboloValor = new Simbolo(
            new Tipo(iterable.subtipo, true),
            this.idValor,
            this.valorPorDefecto(iterable.subtipo),
            this.linea,
            this.col,
            entornoFor.nombreEntorno
        );

        const errIndice = entornoFor.setVariable(simboloIndice);
        if (errIndice instanceof Errores) return errIndice;
        arbol.simbolos.push(simboloIndice);

        const errValor = entornoFor.setVariable(simboloValor);
        if (errValor instanceof Errores) return errValor;
        arbol.simbolos.push(simboloValor);

        for (let i = 0; i < iterable.valores.length; i++) {
            simboloIndice.valor = i;
            simboloValor.valor = iterable.valores[i];

            const resultadoCuerpo = this.cuerpo.interpretar(arbol, entornoFor);
            if (resultadoCuerpo instanceof Errores) return resultadoCuerpo;
            if (resultadoCuerpo instanceof Continue) continue;
            if (resultadoCuerpo instanceof Break) break;
            if (resultadoCuerpo instanceof Return) return resultadoCuerpo;
        }

        return null;
    }

    private valorPorDefecto(subtipo: tipoDato): any {
        switch (subtipo) {
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
            default:
                return null;
        }
    }

    public ast(arbol: Arbol, tabla: TablaSimbolos): Node {
        const node = new Node("FOR_RANGE");
        node.pushChild(new Node(this.idIndice));
        node.pushChild(new Node(this.idValor));
        node.pushChild(this.expresionSlice.ast(arbol, tabla));
        node.pushChild(this.cuerpo.ast(arbol, tabla));
        return node;
    }
}
