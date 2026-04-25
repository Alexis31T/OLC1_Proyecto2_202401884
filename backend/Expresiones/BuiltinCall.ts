import { Instruccion } from "../Abstract/Instruccion";
import { Node } from "../Abstract/Node";
import { Errores } from "../Excepciones/Errores";
import { Arbol } from "../Simbolo/Arbol";
import { SliceValue } from "../Simbolo/SliceValue";
import { StructValue } from "../Simbolo/StructValue";
import { TablaSimbolos } from "../Simbolo/TablaSimbolos";
import { Tipo } from "../Simbolo/Tipo";
import { tipoDato } from "../Simbolo/tipoDato";

export enum BuiltinName {
    LEN = "len",
    APPEND = "append",
    SLICE_INDEX = "slices.Index",
    STRINGS_JOIN = "strings.Join",
    STRCONV_ATOI = "strconv.Atoi",
    STRCONV_PARSEFLOAT = "strconv.ParseFloat",
    REFLECT_TYPEOF = "reflect.TypeOf"
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
            case BuiltinName.STRCONV_ATOI:
                return this.strconvAtoi(arbol, tabla);
            case BuiltinName.STRCONV_PARSEFLOAT:
                return this.strconvParseFloat(arbol, tabla);
            case BuiltinName.REFLECT_TYPEOF:
                return this.reflectTypeOf(arbol, tabla);
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

    private strconvAtoi(arbol: Arbol, tabla: TablaSimbolos): any {
        if (this.args.length !== 1) {
            return new Errores("Semantico", "strconv.Atoi() espera 1 parametro", this.linea, this.col);
        }
        const texto = this.args[0].interpretar(arbol, tabla);
        if (texto instanceof Errores) return texto;
        if (this.args[0].tipo.tipoDato !== tipoDato.CADENA) {
            return new Errores("Semantico", "strconv.Atoi() solo acepta string", this.linea, this.col);
        }

        const fuente = String(texto).trim();
        if (!/^[+-]?\d+$/.test(fuente)) {
            return new Errores("Semantico", `strconv.Atoi() no puede convertir "${texto}" a int`, this.linea, this.col);
        }

        this.tipo.tipoDato = tipoDato.ENTERO;
        return parseInt(fuente, 10);
    }

    private strconvParseFloat(arbol: Arbol, tabla: TablaSimbolos): any {
        if (this.args.length !== 1) {
            return new Errores("Semantico", "strconv.ParseFloat() espera 1 parametro", this.linea, this.col);
        }
        const texto = this.args[0].interpretar(arbol, tabla);
        if (texto instanceof Errores) return texto;
        if (this.args[0].tipo.tipoDato !== tipoDato.CADENA) {
            return new Errores("Semantico", "strconv.ParseFloat() solo acepta string", this.linea, this.col);
        }

        const fuente = String(texto).trim();
        const numero = Number(fuente);
        if (fuente.length === 0 || Number.isNaN(numero)) {
            return new Errores("Semantico", `strconv.ParseFloat() no puede convertir "${texto}" a float64`, this.linea, this.col);
        }

        this.tipo.tipoDato = tipoDato.DECIMAL;
        return numero;
    }

    private reflectTypeOf(arbol: Arbol, tabla: TablaSimbolos): any {
        if (this.args.length !== 1) {
            return new Errores("Semantico", "reflect.TypeOf() espera 1 parametro", this.linea, this.col);
        }

        const valor = this.args[0].interpretar(arbol, tabla);
        if (valor instanceof Errores) return valor;

        const tipoArg = this.args[0].tipo.tipoDato;
        if (tipoArg === undefined) {
            return new Errores("Semantico", "reflect.TypeOf() no pudo determinar el tipo", this.linea, this.col);
        }

        let nombreTipo = tipoDato[tipoArg].toLowerCase();
        if (tipoArg === tipoDato.SLICE && valor instanceof SliceValue) {
            nombreTipo = `[]${tipoDato[valor.subtipo].toLowerCase()}`;
        } else if (tipoArg === tipoDato.STRUCT && valor instanceof StructValue) {
            nombreTipo = valor.nombre;
        } else {
            switch (tipoArg) {
                case tipoDato.ENTERO:
                    nombreTipo = "int";
                    break;
                case tipoDato.DECIMAL:
                    nombreTipo = "float64";
                    break;
                case tipoDato.CADENA:
                    nombreTipo = "string";
                    break;
                case tipoDato.BOOLEANO:
                    nombreTipo = "bool";
                    break;
                case tipoDato.CARACTER:
                    nombreTipo = "rune";
                    break;
                case tipoDato.NULO:
                    nombreTipo = "nil";
                    break;
                default:
                    break;
            }
        }

        this.tipo.tipoDato = tipoDato.CADENA;
        return nombreTipo;
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
