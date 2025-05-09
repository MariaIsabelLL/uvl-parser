grammar UVLJavaScript;
import UVLBase;

@lexer::members {
  // Una cola donde se empujan los tokens adicionales (ver la regla del lexer NEWLINE).
  let tokens = [];
  // La pila que lleva un registro del nivel de indentación.
  let indents = [];
  // La cantidad de paréntesis, corchetes y llaves abiertos.
  let opened = 0;
  // El token más recientemente producido.
  let lastToken = null;
}

importLine: importLineBasic | importLineExtended;
importLineBasic: ns=reference ('as' alias=reference)? NEWLINE;
importLineExtended: ns=reference 'from' pp=protocolPath ('as' alias=reference)? NEWLINE;

protocolPath: route | GIT | npm;

route: 'file:' (ABS_PATH | REL_PATH);
npm: 'npm:' NPM (VERSION_NUMBER | ID_STRICT);

ABS_PATH: (QUOTE)? [a-zA-Z] ':'  (SLASH [a-zA-Z0-9_.-]+)+ (QUOTE)?;
REL_PATH: (QUOTE)? ('.' | '..')? (SLASH [a-zA-Z0-9_.-]+)+ (QUOTE)?;
GIT: 'git:' [:/a-zA-Z0-9_.-]+ '.git' ('#' [a-zA-Z0-9_.-]+)?;
NPM: [a-zA-Z0-9_.-]+ ':';
VERSION_NUMBER: ('^' | '~')? [0-9]+ ('.' [0-9]+)* ;

QUOTE: '"' | '\'';
SLASH: '\\' | DIV;

OPEN_PAREN : '(' {this.opened += 1;};
CLOSE_PAREN : ')' {this.opened -= 1;};
OPEN_BRACK : '[' {this.opened += 1;};
CLOSE_BRACK : ']' {this.opened -= 1;};
OPEN_BRACE : '{' {this.opened += 1;};
CLOSE_BRACE : '}' {this.opened -= 1;};
OPEN_COMMENT: '/*' {this.opened += 1;};
CLOSE_COMMENT: '*/' {this.opened -= 1;};

NEWLINE
 : ( {this.atStartOfInput()}? SPACES
   | ( '\r'? '\n' | '\r' ) SPACES?
   ){this.handleNewline();};
