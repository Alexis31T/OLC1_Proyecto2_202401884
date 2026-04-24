import { Instruccion } from "../Abstract/Instruccion";
import { Node } from "../Abstract/Node";
import { Errores } from "../Excepciones/Errores";
import { Arbol } from "../Simbolo/Arbol";
import { Simbolo } from "../Simbolo/Simbolo";
import { TablaSimbolos } from "../Simbolo/TablaSimbolos";
import { Tipo } from "../Simbolo/Tipo";
import { tipoDato } from "../Simbolo/tipoDato";
import { tipoInstruccion } from "../Simbolo/tipoInstruccion";
import { Return } from "./Return";

type ParametroFuncion = {
    id: string;
    tipo: tipoDato;
    linea: number;
    columna: number;
};

export class Funcion extends Instruccion {
    public id: string;
    public parametros: ParametroFuncion[];
    public tipoRetorno: tipoDato | null;
    public instrucciones: Instruccion[];

    constructor(id: string, parametros: ParametroFuncion[], tipoRetorno: tipoDato | null, instrucciones: Instruccion[], linea: number, columna: number) {
        super(new Tipo(tipoInstruccion.FUNCION, false), linea, columna);
        this.id = id;
        this.parametros = parametros;
        this.tipoRetorno = tipoRetorno;
        this.instrucciones = instrucciones;
    }

    interpretar(arbol: Arbol, tabla: TablaSimbolos): any {
        if (this.id === "main") {
            return this.ejecutar(arbol, tabla, []);
        }
        return null;
    }

    public ejecutar(arbol: Arbol, tabla: TablaSimbolos, argumentos: Instruccion[]): any {
        if (argumentos.length !== this.parametros.length) {
            return new Errores(
                "Semantico",
                `La funcion ${this.id} esperaba ${this.parametros.length} parametros y recibio ${argumentos.length}`,
                this.linea,
                this.col
            );
        }

        const entornoFuncion = new TablaSimbolos(tabla, `Funcion:${this.id}`);

        for (let i = 0; i < this.parametros.length; i++) {
            const def = this.parametros[i];
            const arg = argumentos[i];
            const valorArg = arg.interpretar(arbol, tabla);
            if (valorArg instanceof Errores) return valorArg;

            const tipoArg = arg.tipo.tipoDato!;
            const esIntToFloat = def.tipo === tipoDato.DECIMAL && tipoArg === tipoDato.ENTERO;
            if (def.tipo !== tipoArg && !esIntToFloat) {
                return new Errores(
                    "Semantico",
                    `Parametro ${def.id} de ${this.id} esperaba ${tipoDato[def.tipo]} y recibio ${tipoDato[tipoArg]}`,
                    def.linea,
                    def.columna
                );
            }

            const simbolo = new Simbolo(
                new Tipo(def.tipo, true),
                def.id,
                esIntToFloat ? Number(valorArg) : valorArg,
                def.linea,
                def.columna,
                entornoFuncion.nombreEntorno
            );
            const posibleError = entornoFuncion.setVariable(simbolo);
            if (posibleError instanceof Errores) return posibleError;
            arbol.simbolos.push(simbolo);
        }

        for (const instruccion of this.instrucciones) {
            const resultado = instruccion.interpretar(arbol, entornoFuncion);
            if (resultado instanceof Errores) return resultado;
            if (resultado instanceof Return) {
                return this.validarRetorno(resultado);
            }
        }

        if (this.tipoRetorno !== null) {
            return new Errores("Semantico", `La funcion ${this.id} debe retornar ${tipoDato[this.tipoRetorno]}`, this.linea, this.col);
        }

        return null;
    }

    private validarRetorno(retorno: Return): any {
        if (this.tipoRetorno === null) {
            if (retorno.valorExpresion !== null) {
                return new Errores("Semantico", `La funcion ${this.id} no debe retornar un valor`, this.linea, this.col);
            }
            return null;
        }

        if (retorno.valorExpresion === null) {
            return new Errores("Semantico", `La funcion ${this.id} debe retornar ${tipoDato[this.tipoRetorno]}`, this.linea, this.col);
        }

        const tipoRet = retorno.tipo.tipoDato!;
        const esIntToFloat = this.tipoRetorno === tipoDato.DECIMAL && tipoRet === tipoDato.ENTERO;
        if (this.tipoRetorno !== tipoRet && !esIntToFloat) {
            return new Errores(
                "Semantico",
                `La funcion ${this.id} retorna ${tipoDato[tipoRet]} y se esperaba ${tipoDato[this.tipoRetorno]}`,
                this.linea,
                this.col
            );
        }

        return esIntToFloat ? Number(retorno.valorRetorno) : retorno.valorRetorno;
    }

    public ast(arbol: Arbol, tabla: TablaSimbolos): Node {
        const node = new Node("FUNCION");
        node.pushChild(new Node(this.id));

        const params = new Node("PARAMETROS");
        for (const p of this.parametros) {
            const pNode = new Node("PARAMETRO");
            pNode.pushChild(new Node(p.id));
            pNode.pushChild(new Node(tipoDato[p.tipo]));
            params.pushChild(pNode);
        }
        node.pushChild(params);

        if (this.tipoRetorno !== null) {
            node.pushChild(new Node(`RETORNO:${tipoDato[this.tipoRetorno]}`));
        } else {
            node.pushChild(new Node("RETORNO:void"));
        }

        const instrucciones = new Node("INSTRUCCIONES");
        for (const instruccion of this.instrucciones) {
            instrucciones.pushChild(instruccion.ast(arbol, tabla));
        }
        node.pushChild(instrucciones);
        return node;
    }
}
