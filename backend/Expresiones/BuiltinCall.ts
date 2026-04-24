import { Instruccion } from "../Abstract/Instruccion";
import { Node } from "../Abstract/Node";
import { Errores } from "../Excepciones/Errores";
import { Arbol } from "../Simbolo/Arbol";
import { SliceValue } from "../Simbolo/SliceValue";
import { TablaSimbolos } from "../Simbolo/TablaSimbolos";
import { Tipo } from "../Simbolo/Tipo";
import { tipoDato } from "../Simbolo/tipoDato";

export enum BuiltinName {
    LEN = "len",
    APPEND = "append",
    SLICE_INDEX = "slices.Index",
    STRINGS_JOIN = "strings.Join"
}

export class BuiltinCall extends Instruccion {
    private nombre: BuiltinName;
    private args: Instruccion[];

    constructor(nombre: BuiltinName, args: Instruccion[], linea: number, columna: number) {
        super(new Tipo(tipoDato.NULO, true), linea, columna);
        this.nombre = nombre;
        this.args = args;
    }

    interpretar(arbol: Arbol, tabla: TablaSimbolos): any {
        switch (this.nombre) {
            case BuiltinName.LEN:
                return this.len(arbol, tabla);
            case BuiltinName.APPEND:
                return this.append(arbol, tabla);
            case BuiltinName.SLICE_INDEX:
                return this.sliceIndex(arbol, tabla);
            case BuiltinName.STRINGS_JOIN:
                return this.stringsJoin(arbol, tabla);
            default:
                return new Errores("Semantico", "Funcion embebida no soportada", this.linea, this.col);
        }
    }

    private len(arbol: Arbol, tabla: TablaSimbolos): any {
        if (this.args.length !== 1) {
            return new Errores("Semantico", "len() espera 1 parametro", this.linea, this.col);
        }
        const valor = this.args[0].interpretar(arbol, tabla);
        if (valor instanceof Errores) return valor;
        if (!(valor instanceof SliceValue)) {
            return new Errores("Semantico", "len() solo aplica a slices", this.linea, this.col);
        }
        this.tipo.tipoDato = tipoDato.ENTERO;
        return valor.valores.length;
    }

    private append(arbol: Arbol, tabla: TablaSimbolos): any {
        if (this.args.length !== 2) {
            return new Errores("Semantico", "append() espera 2 parametros", this.linea, this.col);
        }
        const slice = this.args[0].interpretar(arbol, tabla);
        if (slice instanceof Errores) return slice;
        if (!(slice instanceof SliceValue)) {
            return new Errores("Semantico", "append() primer parametro debe ser slice", this.linea, this.col);
        }
        const valor = this.args[1].interpretar(arbol, tabla);
        if (valor instanceof Errores) return valor;
        if (this.args[1].tipo.tipoDato !== slice.subtipo) {
            return new Errores("Semantico", `append() esperaba ${tipoDato[slice.subtipo]}`, this.linea, this.col);
        }
        slice.valores.push(valor);
        this.tipo.tipoDato = tipoDato.SLICE;
        return slice;
    }

    private sliceIndex(arbol: Arbol, tabla: TablaSimbolos): any {
        if (this.args.length !== 2) {
            return new Errores("Semantico", "slices.Index() espera 2 parametros", this.linea, this.col);
        }
        const slice = this.args[0].interpretar(arbol, tabla);
        if (slice instanceof Errores) return slice;
        if (!(slice instanceof SliceValue)) {
            return new Errores("Semantico", "slices.Index() primer parametro debe ser slice", this.linea, this.col);
        }
        const buscado = this.args[1].interpretar(arbol, tabla);
        if (buscado instanceof Errores) return buscado;
        if (this.args[1].tipo.tipoDato !== slice.subtipo) {
            return new Errores("Semantico", "slices.Index() tipo del elemento no coincide con el slice", this.linea, this.col);
        }
        this.tipo.tipoDato = tipoDato.ENTERO;
        return slice.valores.findIndex((v) => v === buscado);
    }

    private stringsJoin(arbol: Arbol, tabla: TablaSimbolos): any {
        if (this.args.length !== 2) {
            return new Errores("Semantico", "strings.Join() espera 2 parametros", this.linea, this.col);
        }
        const slice = this.args[0].interpretar(arbol, tabla);
        if (slice instanceof Errores) return slice;
        if (!(slice instanceof SliceValue) || slice.subtipo !== tipoDato.CADENA) {
            return new Errores("Semantico", "strings.Join() solo aplica a []string", this.linea, this.col);
        }
        const separador = this.args[1].interpretar(arbol, tabla);
        if (separador instanceof Errores) return separador;
        if (this.args[1].tipo.tipoDato !== tipoDato.CADENA) {
            return new Errores("Semantico", "strings.Join() separador debe ser string", this.linea, this.col);
        }
        this.tipo.tipoDato = tipoDato.CADENA;
        return slice.valores.join(separador);
    }

    public ast(arbol: Arbol, tabla: TablaSimbolos): Node {
        const node = new Node("BUILTIN_CALL");
        node.pushChild(new Node(this.nombre));
        for (const arg of this.args) {
            node.pushChild(arg.ast(arbol, tabla));
        }
        return node;
    }
}
