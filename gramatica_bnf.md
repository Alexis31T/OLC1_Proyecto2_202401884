Programa
<programa> ::= <elementos>

<elementos> ::= <elemento> <elementos>
              | epsilon

<elemento> ::= <funcion>
             | <struct>
             | <instruccion>


Structs
<struct> ::= "struct" id "{" <campos_struct> "}"
           | "type" id "struct" "{" <campos_struct> "}"

<campos_struct> ::= <campo_struct> <campos_struct>
                  | epsilon

<campo_struct> ::= <tipo> id <terminador>
                 | id <tipo> <terminador>
                 | id id <terminador>


Funciones
<funcion> ::= "func" <nombre_funcion> "(" <parametros_opc> ")" <retorno_opc> "{" <instrucciones> "}"

<nombre_funcion> ::= id
                   | "main"

<parametros_opc> ::= <parametros>
                   | epsilon

<parametros> ::= <parametro> "," <parametros>
               | <parametro>

<parametro> ::= id <tipo>
              | id "[" "]" <tipo>
              | id id

<retorno_opc> ::= <tipo>
                | "[" "]" <tipo>
                | id
                | epsilon


Instrucciones
<instrucciones> ::= <instruccion> <instrucciones>
                  | epsilon

<instruccion> ::= <impresion>
                | <declaracion>
                | <asignacion>
                | <control>
                | <transferencia>
                | <bloque>

<bloque> ::= "{" <instrucciones> "}"


Impresion
<impresion> ::= "fmt.Println" "(" <expresiones_opc> ")" <terminador>


Declaraciones
<declaracion> ::= "var" id <tipo> "=" <expresion> <terminador>
                | "var" id <tipo> <terminador>
                | "var" id "[" "]" <tipo> "=" <expresion> <terminador>
                | "var" id "[" "]" <tipo> <terminador>
                | <tipo> id "=" <expresion> <terminador>
                | <tipo> id <terminador>
                | id id "=" "{" <campos_literal_opc> "}" <terminador>
                | id id "=" id "{" <campos_literal_opc> "}" <terminador>
                | id id "=" <expresion> <terminador>
                | id id <terminador>
                | id ":=" <expresion> <terminador>
                | id ":=" id "{" <campos_literal_opc> "}" <terminador>


Asignaciones
<asignacion> ::= id "=" <expresion> <terminador>
               | id "+=" <expresion> <terminador>
               | id "-=" <expresion> <terminador>
               | id "++" <terminador>
               | id "--" <terminador>
               | id "[" <expresion> "]" "=" <expresion> <terminador>
               | id "[" <expresion> "]" "[" <expresion> "]" "=" <expresion> <terminador>
               | id "." id "=" <expresion> <terminador>
               | <expresion> "." id "=" <expresion> <terminador>


Control de Flujo
<control> ::= <if>
            | <switch>
            | <for>

<if> ::= "if" <expresion> "{" <instrucciones> "}"
       | "if" <expresion> "{" <instrucciones> "}" "else" "{" <instrucciones> "}"
       | "if" <expresion> "{" <instrucciones> "}" "else" <if>

<switch> ::= "switch" <expresion> "{" <casos> <default_opc> "}"

<casos> ::= <caso> <casos>
          | epsilon

<caso> ::= "case" <expresion> ":" <instrucciones>

<default_opc> ::= "default" ":" <instrucciones>
                | epsilon


Ciclos
<for> ::= "for" <expresion> "{" <instrucciones> "}"
        | "for" <declaracion_for> ";" <expresion> ";" <actualizacion_for> "{" <instrucciones> "}"
        | "for" id "," id ":=" "range" <expresion> "{" <instrucciones> "}"

<declaracion_for> ::= <tipo> id "=" <expresion>
                    | id ":=" <expresion>

<actualizacion_for> ::= id "=" <expresion>
                      | id "++"
                      | id "--"


Sentencias de Transferencia
<transferencia> ::= "continue" <terminador>
                  | "break" <terminador>
                  | "return" <expresion> <terminador>
                  | "return" <terminador>


Lista de Expresiones
<expresiones_opc> ::= <expresiones>
                    | epsilon

<expresiones> ::= <expresion> "," <expresiones>
                | <expresion>


Expresiones
<expresion> ::= <expresion> "||" <expresion>
              | <expresion> "&&" <expresion>
              | "!" <expresion>
              | "-" <expresion>
              | <expresion> "==" <expresion>
              | <expresion> "!=" <expresion>
              | <expresion> "<" <expresion>
              | <expresion> ">" <expresion>
              | <expresion> "<=" <expresion>
              | <expresion> ">=" <expresion>
              | <expresion> "+" <expresion>
              | <expresion> "-" <expresion>
              | <expresion> "*" <expresion>
              | <expresion> "/" <expresion>
              | <expresion> "%" <expresion>
              | "(" <expresion> ")"
              | <tipo> "(" <expresion> ")"
              | <literal>
              | id
              | id "(" <expresiones_opc> ")"
              | id "[" <expresion> "]"
              | <expresion> "[" <expresion> "]"
              | id "." id
              | id "." "string"
              | <expresion> "." id
              | <expresion> "." "string"
              | "[" "]" <tipo> "{" <expresiones_opc> "}"
              | "[" "]" "[" "]" <tipo> "{" <filas_matriz> "}"
              | id "{" <campos_literal_opc> "}"
              | <builtin>


Funciones Nativas
<builtin> ::= "len" "(" <expresiones_opc> ")"
            | "append" "(" <expresiones_opc> ")"
            | "slices.Index" "(" <expresiones_opc> ")"
            | "strings.Join" "(" <expresiones_opc> ")"
            | "strconv.Atoi" "(" <expresiones_opc> ")"
            | "strconv.ParseFloat" "(" <expresiones_opc> ")"
            | "reflect.TypeOf" "(" <expresiones_opc> ")"


Slices y Matrices
<filas_matriz> ::= <fila_matriz> "," <filas_matriz>
                 | <fila_matriz> ","
                 | <fila_matriz>

<fila_matriz> ::= "{" <expresiones_opc> "}"


Literales de Struct
<campos_literal_opc> ::= <campos_literal>
                       | epsilon

<campos_literal> ::= <campo_literal> "," <campos_literal>
                   | <campo_literal> ","
                   | <campo_literal>

<campo_literal> ::= id ":" <expresion>


Literales
<literal> ::= entero
            | decimal
            | cadena
            | rune
            | "true"
            | "false"
            | "nil"


Tipos
<tipo> ::= "int"
         | "float64"
         | "string"
         | "bool"
         | "rune"


Terminador
<terminador> ::= ";"
               | epsilon
```bnf
<programa> ::= <elementos>

<elementos> ::= <elemento> <elementos>
              | epsilon

<elemento> ::= <funcion>
             | <struct>
             | <instruccion>

<struct> ::= "struct" id "{" <campos-struct> "}"
           | "type" id "struct" "{" <campos-struct> "}"

<campos-struct> ::= <campo-struct> <campos-struct>
                  | epsilon

<campo-struct> ::= <tipo> id <terminador>
                 | id <tipo> <terminador>
                 | id id <terminador>

<funcion> ::= "func" <nombre-funcion> "(" <parametros-opc> ")" <retorno-opc> "{" <instrucciones> "}"

<nombre-funcion> ::= id
                   | "main"

<parametros-opc> ::= <parametros>
                   | epsilon

<parametros> ::= <parametro> "," <parametros>
               | <parametro>

<parametro> ::= id <tipo>
              | id "[" "]" <tipo>
              | id id

<retorno-opc> ::= <tipo>
                | "[" "]" <tipo>
                | id
                | epsilon

<instrucciones> ::= <instruccion> <instrucciones>
                  | epsilon

<instruccion> ::= <impresion>
                | <declaracion>
                | <asignacion>
                | <control>
                | <transferencia>
                | <bloque>

<impresion> ::= "fmt.Println" "(" <expresiones-opc> ")" <terminador>

<declaracion> ::= "var" id <tipo> "=" <expresion> <terminador>
                | "var" id <tipo> <terminador>
                | "var" id "[" "]" <tipo> "=" <expresion> <terminador>
                | "var" id "[" "]" <tipo> <terminador>
                | <tipo> id "=" <expresion> <terminador>
                | <tipo> id <terminador>
                | id id "=" "{" <campos-literal-opc> "}" <terminador>
                | id id "=" id "{" <campos-literal-opc> "}" <terminador>
                | id id "=" <expresion> <terminador>
                | id id <terminador>
                | id ":=" <expresion> <terminador>
                | id ":=" id "{" <campos-literal-opc> "}" <terminador>

<asignacion> ::= id "=" <expresion> <terminador>
               | id "+=" <expresion> <terminador>
               | id "-=" <expresion> <terminador>
               | id "++" <terminador>
               | id "--" <terminador>
               | id "[" <expresion> "]" "=" <expresion> <terminador>
               | id "[" <expresion> "]" "[" <expresion> "]" "=" <expresion> <terminador>
               | id "." id "=" <expresion> <terminador>
               | <expresion> "." id "=" <expresion> <terminador>

<control> ::= <if>
            | <switch>
            | <for>

<if> ::= "if" <expresion> "{" <instrucciones> "}"
       | "if" <expresion> "{" <instrucciones> "}" "else" "{" <instrucciones> "}"
       | "if" <expresion> "{" <instrucciones> "}" "else" <if>

<switch> ::= "switch" <expresion> "{" <casos> <default-opc> "}"

<casos> ::= <caso> <casos>
          | epsilon

<caso> ::= "case" <expresion> ":" <instrucciones>

<default-opc> ::= "default" ":" <instrucciones>
                | epsilon

<for> ::= "for" <expresion> "{" <instrucciones> "}"
        | "for" <declaracion-for> ";" <expresion> ";" <actualizacion-for> "{" <instrucciones> "}"
        | "for" id "," id ":=" "range" <expresion> "{" <instrucciones> "}"

<declaracion-for> ::= <tipo> id "=" <expresion>
                    | id ":=" <expresion>

<actualizacion-for> ::= id "=" <expresion>
                      | id "++"
                      | id "--"

<transferencia> ::= "continue" <terminador>
                  | "break" <terminador>
                  | "return" <expresion> <terminador>
                  | "return" <terminador>

<bloque> ::= "{" <instrucciones> "}"

<expresiones-opc> ::= <expresiones>
                    | epsilon

<expresiones> ::= <expresion> "," <expresiones>
                | <expresion>

<expresion> ::= <expresion> "||" <expresion>
              | <expresion> "&&" <expresion>
              | "!" <expresion>
              | "-" <expresion>
              | <expresion> "==" <expresion>
              | <expresion> "!=" <expresion>
              | <expresion> "<" <expresion>
              | <expresion> ">" <expresion>
              | <expresion> "<=" <expresion>
              | <expresion> ">=" <expresion>
              | <expresion> "+" <expresion>
              | <expresion> "-" <expresion>
              | <expresion> "*" <expresion>
              | <expresion> "/" <expresion>
              | <expresion> "%" <expresion>
              | "(" <expresion> ")"
              | <tipo> "(" <expresion> ")"
              | <literal>
              | id
              | id "(" <expresiones-opc> ")"
              | id "[" <expresion> "]"
              | <expresion> "[" <expresion> "]"
              | id "." id
              | id "." "string"
              | <expresion> "." id
              | <expresion> "." "string"
              | "[" "]" <tipo> "{" <expresiones-opc> "}"
              | "[" "]" "[" "]" <tipo> "{" <filas-matriz> "}"
              | id "{" <campos-literal-opc> "}"
              | <builtin>

<builtin> ::= "len" "(" <expresiones-opc> ")"
            | "append" "(" <expresiones-opc> ")"
            | "slices.Index" "(" <expresiones-opc> ")"
            | "strings.Join" "(" <expresiones-opc> ")"
            | "strconv.Atoi" "(" <expresiones-opc> ")"
            | "strconv.ParseFloat" "(" <expresiones-opc> ")"
            | "reflect.TypeOf" "(" <expresiones-opc> ")"

<filas-matriz> ::= <fila-matriz> "," <filas-matriz>
                 | <fila-matriz> ","
                 | <fila-matriz>

<fila-matriz> ::= "{" <expresiones-opc> "}"

<campos-literal-opc> ::= <campos-literal>
                       | epsilon

<campos-literal> ::= <campo-literal> "," <campos-literal>
                   | <campo-literal> ","
                   | <campo-literal>

<campo-literal> ::= id ":" <expresion>

<literal> ::= entero
            | decimal
            | cadena
            | rune
            | "true"
            | "false"
            | "nil"

<tipo> ::= "int"
         | "float64"
         | "string"
         | "bool"
         | "rune"

<terminador> ::= ";"
               | epsilon
```
