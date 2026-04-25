import { Instruccion } from "../Abstract/Instruccion";
import { Node } from "../Abstract/Node";
import { Errores } from "../Excepciones/Errores";
import { Arbol, CampoStruct } from "../Simbolo/Arbol";
import { TablaSimbolos } from "../Simbolo/TablaSimbolos";
import { Tipo } from "../Simbolo/Tipo";
import { tipoInstruccion } from "../Simbolo/tipoInstruccion";

export class StructDefinicion extends Instruccion {
    public id: string;
    private campos: CampoStruct[];

    constructor(id: string, campos: CampoStruct[], linea: number, columna: number) {
        super(new Tipo(tipoInstruccion.DECLARACION, false), linea, columna);
        this.id = id;
        this.campos = campos;
    }

    interpretar(arbol: Arbol, _tabla: TablaSimbolos): any {
        if (this.campos.length === 0) {
            return new Errores("Semantico", `El struct ${this.id} debe tener al menos un atributo`, this.linea, this.col);
        }

        if (arbol.structs.has(this.id)) {
            return new Errores("Semantico", `El struct ${this.id} ya existe`, this.linea, this.col);
        }

        const nombres = new Set<string>();
        for (const campo of this.campos) {
            if (nombres.has(campo.id)) {
                return new Errores("Semantico", `El atributo ${campo.id} ya existe en ${this.id}`, this.linea, this.col);
            }
            nombres.add(campo.id);
        }

        arbol.structs.set(this.id, this.campos);
        return null;
    }

    public ast(_arbol: Arbol, _tabla: TablaSimbolos): Node {
        const node = new Node("STRUCT_DEF");
        node.pushChild(new Node(this.id));
        for (const campo of this.campos) {
            const campoNode = new Node("CAMPO");
            campoNode.pushChild(new Node(campo.id));
            campoNode.pushChild(new Node(campo.tipoStruct ?? String(campo.tipo)));
            node.pushChild(campoNode);
        }
        return node;
    }
}
