## Programa
```bnf
<programa> ::= <elementos>
<elementos> ::= <elemento> <elementos> | epsilon

<elemento> ::= <funcion>
             | <struct>
             | <instruccion>
```

## Structs
```bnf
<struct> ::= "struct" id "{" <campos_struct> "}"
           | "type" id "struct" "{" <campos_struct> "}"

<campos_struct> ::= <campo_struct> <campos_struct> | epsilon

<campo_struct> ::= <tipo> id <terminador>
                 | id <tipo> <terminador>
                 | id id <terminador>
```

## Funciones
```bnf
<funcion> ::= "func" <nombre_funcion> "(" <parametros_opc> ")" <retorno_opc> "{" <instrucciones> "}"
<nombre_funcion> ::= id | "main"

<parametros_opc> ::= <parametros> | epsilon
<parametros> ::= <parametro> "," <parametros> | <parametro>

<parametro> ::= id <tipo>
              | id "[" "]" <tipo>
              | id id

<retorno_opc> ::= <tipo>
                | "[" "]" <tipo>
                | id
                | epsilon
```

## Instrucciones
```bnf
<instrucciones> ::= <instruccion> <instrucciones> | epsilon

<instruccion> ::= <impresion>
                | <declaracion>
                | <asignacion>
                | <control>
                | <transferencia>
                | <bloque>

<bloque> ::= "{" <instrucciones> "}"
```

## Impresion
```bnf
<impresion> ::= "fmt.Println" "(" <expresiones_opc> ")" <terminador>
```

## Declaraciones
```bnf
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
```

## Asignaciones
```bnf
<asignacion> ::= id "=" <expresion> <terminador>
               | id "+=" <expresion> <terminador>
               | id "-=" <expresion> <terminador>
               | id "++" <terminador>
               | id "--" <terminador>
               | id "[" <expresion> "]" "=" <expresion> <terminador>
               | id "[" <expresion> "]" "[" <expresion> "]" "=" <expresion> <terminador>
               | id "." id "=" <expresion> <terminador>
               | <expresion> "." id "=" <expresion> <terminador>
```

## Control de Flujo
```bnf
<control> ::= <if> | <switch> | <for>

<if> ::= "if" <expresion> "{" <instrucciones> "}"
       | "if" <expresion> "{" <instrucciones> "}" "else" "{" <instrucciones> "}"
       | "if" <expresion> "{" <instrucciones> "}" "else" <if>

<switch> ::= "switch" <expresion> "{" <casos> <default_opc> "}"
<casos> ::= <caso> <casos> | epsilon
<caso> ::= "case" <expresion> ":" <instrucciones>
<default_opc> ::= "default" ":" <instrucciones> | epsilon
```

## Ciclos
```bnf
<for> ::= "for" <expresion> "{" <instrucciones> "}"
        | "for" <declaracion_for> ";" <expresion> ";" <actualizacion_for> "{" <instrucciones> "}"
        | "for" id "," id ":=" "range" <expresion> "{" <instrucciones> "}"

<declaracion_for> ::= <tipo> id "=" <expresion>
                    | id ":=" <expresion>

<actualizacion_for> ::= id "=" <expresion>
                      | id "++"
                      | id "--"
```

## Sentencias de Transferencia
```bnf
<transferencia> ::= "continue" <terminador>
                  | "break" <terminador>
                  | "return" <expresion> <terminador>
                  | "return" <terminador>
```

## Lista de Expresiones
```bnf
<expresiones_opc> ::= <expresiones> | epsilon
<expresiones> ::= <expresion> "," <expresiones> | <expresion>
```

## Expresiones
```bnf
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
```

## Funciones Nativas
```bnf
<builtin> ::= "len" "(" <expresiones_opc> ")"
            | "append" "(" <expresiones_opc> ")"
            | "slices.Index" "(" <expresiones_opc> ")"
            | "strings.Join" "(" <expresiones_opc> ")"
            | "strconv.Atoi" "(" <expresiones_opc> ")"
            | "strconv.ParseFloat" "(" <expresiones_opc> ")"
            | "reflect.TypeOf" "(" <expresiones_opc> ")"
```

## Slices y Matrices
```bnf
<filas_matriz> ::= <fila_matriz> "," <filas_matriz>
                 | <fila_matriz> ","
                 | <fila_matriz>

<fila_matriz> ::= "{" <expresiones_opc> "}"
```

## Literales de Struct
```bnf
<campos_literal_opc> ::= <campos_literal> | epsilon

<campos_literal> ::= <campo_literal> "," <campos_literal>
                   | <campo_literal> ","
                   | <campo_literal>

<campo_literal> ::= id ":" <expresion>
```

## Literales
```bnf
<literal> ::= entero
            | decimal
            | cadena
            | rune
            | "true"
            | "false"
            | "nil"
```

## Tipos
```bnf
<tipo> ::= "int"
         | "float64"
         | "string"
         | "bool"
         | "rune"
```

## Terminador
```bnf
<terminador> ::= ";"
               | epsilon
```
