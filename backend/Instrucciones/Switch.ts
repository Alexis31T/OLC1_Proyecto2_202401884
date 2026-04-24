import { Instruccion } from "../Abstract/Instruccion";
import { Node } from "../Abstract/Node";
import { Errores } from "../Excepciones/Errores";
import { Arbol } from "../Simbolo/Arbol";
import { TablaSimbolos } from "../Simbolo/TablaSimbolos";
import { Tipo } from "../Simbolo/Tipo";
import { tipoDato } from "../Simbolo/tipoDato";
import { tipoInstruccion } from "../Simbolo/tipoInstruccion";
import { Break } from "./Break";
import { Case } from "./Case";
import { Continue } from "./Continue";
import { Return } from "./Return";

export class Switch extends Instruccion {
    private expresion: Instruccion;
    private casos: Case[];
    private bloqueDefault: Instruccion[] | null;

    constructor(expresion: Instruccion, casos: Case[], bloqueDefault: Instruccion[] | null, linea: number, columna: number) {
        super(new Tipo(tipoInstruccion.SWITCH, false), linea, columna);
        this.expresion = expresion;
        this.casos = casos;
        this.bloqueDefault = bloqueDefault;
    }

    interpretar(arbol: Arbol, tabla: TablaSimbolos): any {
        const valorSwitch = this.expresion.interpretar(arbol, tabla);
        if (valorSwitch instanceof Errores) return valorSwitch;
        const tipoSwitch = this.expresion.tipo.tipoDato;

        for (const caso of this.casos) {
            const valorCaso = caso.expresion.interpretar(arbol, tabla);
            if (valorCaso instanceof Errores) return valorCaso;

            if (tipoSwitch !== caso.expresion.tipo.tipoDato) {
                return new Errores("Semantico", "El tipo del case debe coincidir con el tipo del switch", this.linea, this.col);
            }

            if (this.sonIguales(valorSwitch, valorCaso, tipoSwitch!)) {
                return this.ejecutarBloque(caso.instrucciones, arbol, tabla);
            }
        }

        if (this.bloqueDefault) {
            return this.ejecutarBloque(this.bloqueDefault, arbol, tabla);
        }

        return null;
    }

    private ejecutarBloque(instrucciones: Instruccion[], arbol: Arbol, tabla: TablaSimbolos): any {
        const entornoSwitch = new TablaSimbolos(tabla, "Switch");
        for (const instruccion of instrucciones) {
            const resultado = instruccion.interpretar(arbol, entornoSwitch);
            if (resultado instanceof Errores) return resultado;
            if (resultado instanceof Break) return null;
            if (resultado instanceof Continue) return resultado;
            if (resultado instanceof Return) return resultado;
        }
        return null;
    }

    private sonIguales(izq: any, der: any, tipo: tipoDato): boolean {
        if (tipo === tipoDato.ENTERO || tipo === tipoDato.DECIMAL) return Number(izq) === Number(der);
        if (tipo === tipoDato.CARACTER) return izq.toString().charCodeAt(0) === der.toString().charCodeAt(0);
        return izq === der;
    }

    public ast(arbol: Arbol, tabla: TablaSimbolos): Node {
        const node = new Node("SWITCH");
        node.pushChild(this.expresion.ast(arbol, tabla));

        const casesNode = new Node("CASES");
        for (const caso of this.casos) {
            casesNode.pushChild(caso.ast(arbol, tabla));
        }
        node.pushChild(casesNode);

        if (this.bloqueDefault) {
            const defaultNode = new Node("DEFAULT");
            for (const instruccion of this.bloqueDefault) {
                defaultNode.pushChild(instruccion.ast(arbol, tabla));
            }
            node.pushChild(defaultNode);
        }

        return node;
    }
}
