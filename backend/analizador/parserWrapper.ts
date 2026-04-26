// @ts-ignore
const parser = require("./parser");

const normalizarEntrada = (entrada: string): string => {
    // Evita que una expresion que termina en ID se fusione con un bloque en la siguiente linea.
    // Ejemplo: `x = y` seguido de `{ ... }` no debe leerse como literal `y{...}`.
    return entrada.replace(/([A-Za-z_][A-Za-z0-9_]*|[0-9]+(?:\.[0-9]+)?|"[^"\n]*"|'[^'\n]*')([ \t]*)(\r?\n[ \t]*\{)/g, "$1;$2$3");
};

export default {
    ...parser,
    parse(entrada: string) {
        if (entrada.trim().length === 0) return [];
        return parser.parse(normalizarEntrada(entrada));
    }
};