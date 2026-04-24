%{
// Instrucciones
const Print = require("../Instrucciones/Print").Print;
const Declaracion = require("../Instrucciones/Declaracion").Declaracion;
const DeclaracionInferida = require("../Instrucciones/DeclaracionInferida").DeclaracionInferida;
const Bloque = require("../Instrucciones/Bloque").Bloque;
const For = require("../Instrucciones/For").For;
const Asignacion = require("../Instrucciones/Asignacion").Asignacion;
const Continue = require("../Instrucciones/Continue").Continue;
const Break = require("../Instrucciones/Break").Break;
const Return = require("../Instrucciones/Return").Return;
const If = require("../Instrucciones/If").If;
const Switch = require("../Instrucciones/Switch").Switch;
const Case = require("../Instrucciones/Case").Case;
const AsignacionCompuesta = require("../Instrucciones/AsignacionCompuesta").AsignacionCompuesta;
const OperadorAsignacionCompuesta = require("../Instrucciones/AsignacionCompuesta").OperadorAsignacionCompuesta;
const ActualizacionUnaria = require("../Instrucciones/ActualizacionUnaria").ActualizacionUnaria;
const OperadorUnario = require("../Instrucciones/ActualizacionUnaria").OperadorUnario;
const Funcion = require("../Instrucciones/Funcion").Funcion;
const LlamadaFuncion = require("../Expresiones/LlamadaFuncion").LlamadaFuncion;
const SliceLiteral = require("../Expresiones/SliceLiteral").SliceLiteral;
const SliceAccess = require("../Expresiones/SliceAccess").SliceAccess;
const SliceSet = require("../Instrucciones/SliceSet").SliceSet;
const BuiltinCall = require("../Expresiones/BuiltinCall").BuiltinCall;
const BuiltinName = require("../Expresiones/BuiltinCall").BuiltinName;



// Expresiones
const Suma = require("../Expresiones/Suma").Suma;
const Resta = require("../Expresiones/Resta").Resta;
const Multiplicacion = require("../Expresiones/Multiplicacion").Multiplicacion;
const Division = require("../Expresiones/Division").Division;
const Modulo = require("../Expresiones/Modulo").Modulo;
const NegacionUnaria = require("../Expresiones/NegacionUnaria").NegacionUnaria;
const Nativo = require("../Expresiones/Nativo").Nativo;
const Identificador = require("../Expresiones/Identificador").Identificador;
const And = require("../Expresiones/And").And;
const Or = require("../Expresiones/Or").Or;
const Not = require("../Expresiones/Not").Not;
const MenorQue = require("../Expresiones/MenorQue").MenorQue;
const MayorQue = require("../Expresiones/MayorQue").MayorQue;
const MenorIgual = require("../Expresiones/MenorIgual").MenorIgual;
const MayorIgual = require("../Expresiones/MayorIgual").MayorIgual;
const Igual = require("../Expresiones/Igual").Igual;
const Distinto = require("../Expresiones/Distinto").Distinto;


// Importaciones terceras
const Tipo = require("../Simbolo/Tipo").Tipo;
const tipoDato = require("../Simbolo/tipoDato").tipoDato;
const OperadoresAritmeticos = require("../Expresiones/OperadoresAritmeticos").OperadoresAritmeticos;
const OperadoresRelacionales = require("../Expresiones/OperadoresRelacionales").OperadoresRelacionales;



%}

%lex

%%

\/\/[^\n\r]*                 /* comentario de una linea */
\/\*[\s\S]*?\*\/             /* comentario multilinea */

"func"                      return 'FUNC';
"main"                      return 'MAIN';
"fmt.Println"               return 'PRINT';
"int"                       return 'INT_TYPE';
"float64"                   return 'DOUBLE_TYPE';
"string"                    return 'STRING_TYPE';
"bool"                      return 'BOOL_TYPE';
"rune"                      return 'RUNE_TYPE';
"true"                      return 'TRUE';
"false"                     return 'FALSE';
"for"                       return 'FOR';
"continue"                  return 'CONTINUE';
"break"                     return 'BREAK';
"return"                    return 'RETURN';
"if"                        return 'IF';
"else"                      return 'ELSE';
"switch"                    return 'SWITCH';
"case"                      return 'CASE';
"default"                   return 'DEFAULT';
"len"                       return 'LEN';
"append"                    return 'APPEND';
"slices.Index"              return 'SLICES_INDEX';
"strings.Join"              return 'STRINGS_JOIN';

"<="                        return 'MENORIGUAL';
">="                        return 'MAYORIGUAL';
"=="                        return 'IGUALIGUAL';
"!="                        return 'DIFERENTE';
"&&"                        return 'AND';
"||"                        return 'OR';
"<"                         return 'MENORQUE';
">"                         return 'MAYORQUE';

"("                         return 'LPAREN';
")"                         return 'RPAREN';
"["                         return 'LBRACKET';
"]"                         return 'RBRACKET';
";"                         return 'SEMICOLON';
":"                         return 'COLON';
","                         return 'COMA';
"="                         return 'IGUAL';

"++"                        return 'INCREMENTO';
"+="                        return 'MAS_IGUAL';
"+"                         return 'MAS';
"--"                        return 'DECREMENTO';
"-="                        return 'MENOS_IGUAL';
"-"                         return 'MENOS';
"*"                         return 'POR';
"/"                         return 'DIV';
"%"                         return 'MOD';
[!]                         return 'NOT';


"{" return 'LBRACE';
"}" return 'RBRACE';

[0-9]+"."[0-9]+             return 'DECIMAL';
[0-9]+                      return 'INT';
\'([^\'\\]|\\[btnfr\"\'\\])\' return 'RUNE';

\"([^\"\\]|\\[btnfr\"\'\\])*\"    return 'CADENA';

[a-zA-Z_][a-zA-Z0-9_]*      return 'ID';


[ \t\r\n]+                  /* ignorar espacios */

<<EOF>>                     return 'EOF';

.                           return 'INVALIDO';

/lex

%left OR
%left AND
%left IGUALIGUAL DIFERENTE MENORQUE MAYORQUE MENORIGUAL MAYORIGUAL
%left MAS MENOS
%left POR DIV MOD
%right NOT UMENOS


%start START

%%

START
    : FUNCIONES EOF
        {
            return $1;
        }
    | INSTRUCCIONES EOF
        {
            return $1;
        }
;

FUNCIONES
    : FUNCIONES FUNCION
        {
            $1.push($2);
            $$ = $1;
        }
    | FUNCION
        {
            $$ = [$1];
        }
;

FUNCION
    : FUNC NOMBRE_FUNCION LPAREN PARAMETROS_DEF_OPT RPAREN TIPO_RETORNO_OPT LBRACE INSTRUCCIONES RBRACE
        {
            $$ = new Funcion(
                $2,
                $4,
                $6,
                $8,
                @1.first_line,
                @1.first_column
            );
        }
;

NOMBRE_FUNCION
    : ID
        {
            $$ = $1;
        }
    | MAIN
        {
            $$ = "main";
        }
;

PARAMETROS_DEF_OPT
    : PARAMETROS_DEF
        {
            $$ = $1;
        }
    |
        {
            $$ = [];
        }
;

PARAMETROS_DEF
    : PARAMETROS_DEF COMA PARAMETRO_DEF
        {
            $1.push($3);
            $$ = $1;
        }
    | PARAMETRO_DEF
        {
            $$ = [$1];
        }
;

PARAMETRO_DEF
    : ID TIPO
        {
            $$ = {
                id: $1,
                tipo: $2,
                linea: @1.first_line,
                columna: @1.first_column
            };
        }
;

TIPO_RETORNO_OPT
    : TIPO
        {
            $$ = $1;
        }
    |
        {
            $$ = null;
        }
;

INSTRUCCIONES
    : INSTRUCCIONES INSTRUCCION
        {
            $1.push($2);
            $$ = $1;
        }

    | INSTRUCCION
        {
            $$ = [];
            $$.push($1);
        }
;

INSTRUCCION
    : PRINT LPAREN LISTA_EXPRESIONES RPAREN TERMINADOR
        {
            $$ = new Print(
                $3,
                @1.first_line,
                @1.first_column
            );
        }
    | TIPO ID IGUAL EXPRESION TERMINADOR
        {
            $$ = new Declaracion(
                $1,
                $2,
                $4,
                @1.first_line,
                @1.first_column
            );
        }
    | TIPO ID TERMINADOR
        {
            $$ = new Declaracion(
                $1,
                $2,
                null,
                @1.first_line,
                @1.first_column
            );
        }
    | ID COLON IGUAL EXPRESION TERMINADOR
        {
            $$ = new DeclaracionInferida(
                $1,
                $4,
                @1.first_line,
                @1.first_column
            );
        }
    | ID IGUAL EXPRESION TERMINADOR
        {
            $$ = new Asignacion(
                $1,
                $3,
                @1.first_line,
                @1.first_column
            );
        }
    | ID LBRACKET EXPRESION RBRACKET IGUAL EXPRESION TERMINADOR
        {
            $$ = new SliceSet(
                $1,
                $3,
                $6,
                @1.first_line,
                @1.first_column
            );
        }
    | CONTINUE TERMINADOR
        {
            $$ = new Continue(
                @1.first_line,
                @1.first_column
            );
        }
    | BREAK TERMINADOR
        {
            $$ = new Break(
                @1.first_line,
                @1.first_column
            );
        }
    | RETURN EXPRESION TERMINADOR
        {
            $$ = new Return(
                $2,
                @1.first_line,
                @1.first_column
            );
        }
    | FOR TIPO ID IGUAL EXPRESION SEMICOLON EXPRESION SEMICOLON ID IGUAL EXPRESION LBRACE INSTRUCCIONES RBRACE
        {
            $$ = new For(
                new Declaracion(
                    $2,
                    $3,
                    $5,
                    @2.first_line,
                    @2.first_column
                ),
                $7,
                new Asignacion(
                    $9,
                    $11,
                    @9.first_line,
                    @9.first_column
                ),
                new Bloque(
                    $13,
                    @12.first_line,
                    @12.first_column
                ),
                @1.first_line,
                @1.first_column
            );
        }
    | LBRACE INSTRUCCIONES RBRACE
        {
            $$ = new Bloque(
                $2,
                @1.first_line,
                @1.first_column
            );
        }
    | SWITCH EXPRESION LBRACE CASE_LISTA DEFAULT_BLOQUE_OPT RBRACE
        {
            $$ = new Switch(
                $2,
                $4,
                $5,
                @1.first_line,
                @1.first_column
            );
        }
    | IF EXPRESION LBRACE INSTRUCCIONES RBRACE ELSE LBRACE INSTRUCCIONES RBRACE
        {
            $$ = new If(
                $2,
                new Bloque(
                    $4,
                    @3.first_line,
                    @3.first_column
                ),
                new Bloque(
                    $8,
                    @7.first_line,
                    @7.first_column
                ),
                @1.first_line,
                @1.first_column
            );
        }
    | IF EXPRESION LBRACE INSTRUCCIONES RBRACE
        {
            $$ = new If(
                $2,
                new Bloque(
                    $4,
                    @3.first_line,
                    @3.first_column
                ),
                null,
                @1.first_line,
                @1.first_column
            );
        }
    | ID MAS_IGUAL EXPRESION TERMINADOR
        {
            $$ = new AsignacionCompuesta(
                $1,
                OperadorAsignacionCompuesta.SUMA,
                $3,
                @1.first_line,
                @1.first_column
            );
        }
    | ID MENOS_IGUAL EXPRESION TERMINADOR
        {
            $$ = new AsignacionCompuesta(
                $1,
                OperadorAsignacionCompuesta.RESTA,
                $3,
                @1.first_line,
                @1.first_column
            );
        }
    | ID INCREMENTO TERMINADOR
        {
            $$ = new ActualizacionUnaria(
                $1,
                OperadorUnario.INCREMENTO,
                @1.first_line,
                @1.first_column
            );
        }
    | ID DECREMENTO TERMINADOR
        {
            $$ = new ActualizacionUnaria(
                $1,
                OperadorUnario.DECREMENTO,
                @1.first_line,
                @1.first_column
            );
        }
;

CASE_LISTA
    : CASE_LISTA CASE_ITEM
        {
            $1.push($2);
            $$ = $1;
        }
    | CASE_ITEM
        {
            $$ = [$1];
        }
;

CASE_ITEM
    : CASE EXPRESION COLON INSTRUCCIONES
        {
            $$ = new Case(
                $2,
                $4,
                @1.first_line,
                @1.first_column
            );
        }
;

DEFAULT_BLOQUE_OPT
    : DEFAULT COLON INSTRUCCIONES
        {
            $$ = $3;
        }
    |
        {
            $$ = null;
        }
;

LISTA_EXPRESIONES
    : LISTA_EXPRESIONES COMA EXPRESION
        {
            $1.push($3);
            $$ = $1;
        }
    | EXPRESION
        {
            $$ = [$1];
        }
;

TERMINADOR
    : SEMICOLON
    |
;



EXPRESION
    : EXPRESION OR EXPRESION
        {
            $$ = new Or(
                $1,
                $3,
                @1.first_line,
                @1.first_column
            );
        }
    | EXPRESION AND EXPRESION
        {
            $$ = new And(
                $1,
                $3,
                @1.first_line,
                @1.first_column
            );
        }
    | NOT EXPRESION %prec NOT
        {
            $$ = new Not(
                $2,
                @1.first_line,
                @1.first_column
            );
        }
    | MENOS EXPRESION %prec UMENOS
        {
            $$ = new NegacionUnaria(
                $2,
                @1.first_line,
                @1.first_column
            );
        }
    | EXPRESION MENORQUE EXPRESION
        {
            $$ = new MenorQue(
                $1,
                $3,
                OperadoresRelacionales.MENORQUE,
                @1.first_line,
                @1.first_column
            );
        }
    | EXPRESION MAYORQUE EXPRESION
        {
            $$ = new MayorQue(
                $1,
                $3,
                OperadoresRelacionales.MAYORQUE,
                @1.first_line,
                @1.first_column
            );
        }
    | EXPRESION MENORIGUAL EXPRESION
        {
            $$ = new MenorIgual(
                $1,
                $3,
                OperadoresRelacionales.MENORIGUAL,
                @1.first_line,
                @1.first_column
            );
        }
    | EXPRESION MAYORIGUAL EXPRESION
        {
            $$ = new MayorIgual(
                $1,
                $3,
                OperadoresRelacionales.MAYORIGUAL,
                @1.first_line,
                @1.first_column
            );
        }
    | EXPRESION IGUALIGUAL EXPRESION
        {
            $$ = new Igual(
                $1,
                $3,
                OperadoresRelacionales.IGUAL,
                @1.first_line,
                @1.first_column
            );
        }
    | EXPRESION DIFERENTE EXPRESION
        {
            $$ = new Distinto(
                $1,
                $3,
                OperadoresRelacionales.DISTINTO,
                @1.first_line,
                @1.first_column
            );
        }
    | EXPRESION MAS EXPRESION
        {
            $$ = new Suma(
                $1,
                $3,
                OperadoresAritmeticos.SUMA,
                @1.first_line,
                @1.first_column
            );
        }

    | EXPRESION MENOS EXPRESION
        {
            $$ = new Resta(
                $1,
                $3,
                OperadoresAritmeticos.RESTA,
                @1.first_line,
                @1.first_column
            );
        }

    | EXPRESION POR EXPRESION
        {
            $$ = new Multiplicacion(
                $1,
                $3,
                OperadoresAritmeticos.MULTIPLICACION,
                @1.first_line,
                @1.first_column
            );
        }

    | EXPRESION DIV EXPRESION
        {
            $$ = new Division(
                $1,
                $3,
                OperadoresAritmeticos.DIVISION,
                @1.first_line,
                @1.first_column
            );
        }
    | EXPRESION MOD EXPRESION
        {
            $$ = new Modulo(
                $1,
                $3,
                @1.first_line,
                @1.first_column
            );
        }

    | INT
        {
            $$ = new Nativo(
                Number(yytext),
                new Tipo(tipoDato.ENTERO, true),
                @1.first_line,
                @1.first_column
            );
        }

    | DECIMAL
        {
            $$ = new Nativo(
                Number(yytext),
                new Tipo(tipoDato.DECIMAL, true),
                @1.first_line,
                @1.first_column
            );
        }

    | CADENA
        {
            $$ = new Nativo(
                yytext.substring(1, yytext.length - 1),
                new Tipo(tipoDato.CADENA, true),
                @1.first_line,
                @1.first_column
            );
        }
    | RUNE
        {
            $$ = new Nativo(
                yytext.substring(1, yytext.length - 1),
                new Tipo(tipoDato.CARACTER, true),
                @1.first_line,
                @1.first_column
            );
        }
    | TRUE
        {
            $$ = new Nativo(
                true, 
                new Tipo(tipoDato.BOOLEANO, true), 
                @1.first_line, 
                @1.first_column);
        }
    | FALSE
        {
            $$ = new Nativo(
                false, 
                new Tipo(tipoDato.BOOLEANO, true), 
                @1.first_line, 
                @1.first_column);
        }
    
    | LPAREN EXPRESION RPAREN
        {
            $$ = $2;
        }
        
    | ID
    {
        $$ = new Identificador(
            yytext,
            @1.first_line,
            @1.first_column
        );
    }
    | ID LBRACKET EXPRESION RBRACKET
    {
        $$ = new SliceAccess(
            $1,
            $3,
            @1.first_line,
            @1.first_column
        );
    }
    | ID LPAREN LISTA_EXPRESIONES_OPT RPAREN
    {
        $$ = new LlamadaFuncion(
            $1,
            $3,
            @1.first_line,
            @1.first_column
        );
    }
    | LBRACKET RBRACKET TIPO LBRACE LISTA_EXPRESIONES_OPT RBRACE
    {
        $$ = new SliceLiteral(
            $3,
            $5,
            @1.first_line,
            @1.first_column
        );
    }
    | LEN LPAREN LISTA_EXPRESIONES_OPT RPAREN
    {
        $$ = new BuiltinCall(
            BuiltinName.LEN,
            $3,
            @1.first_line,
            @1.first_column
        );
    }
    | APPEND LPAREN LISTA_EXPRESIONES_OPT RPAREN
    {
        $$ = new BuiltinCall(
            BuiltinName.APPEND,
            $3,
            @1.first_line,
            @1.first_column
        );
    }
    | SLICES_INDEX LPAREN LISTA_EXPRESIONES_OPT RPAREN
    {
        $$ = new BuiltinCall(
            BuiltinName.SLICE_INDEX,
            $3,
            @1.first_line,
            @1.first_column
        );
    }
    | STRINGS_JOIN LPAREN LISTA_EXPRESIONES_OPT RPAREN
    {
        $$ = new BuiltinCall(
            BuiltinName.STRINGS_JOIN,
            $3,
            @1.first_line,
            @1.first_column
        );
    }
;

LISTA_EXPRESIONES_OPT
    : LISTA_EXPRESIONES
        {
            $$ = $1;
        }
    |
        {
            $$ = [];
        }
;

TIPO
    : INT_TYPE
        {
            $$ = tipoDato.ENTERO;
        }
    | DOUBLE_TYPE
        {
            $$ = tipoDato.DECIMAL;
        }
    | STRING_TYPE
        {
            $$ = tipoDato.CADENA;
        }
    | BOOL_TYPE
        {
            $$ = tipoDato.BOOLEANO;
        }
    | RUNE_TYPE
        {
            $$ = tipoDato.CARACTER;
        }
;

%%