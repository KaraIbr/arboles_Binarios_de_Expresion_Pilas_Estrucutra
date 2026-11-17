import { formatInfo } from './format';
import { Lexer } from './Lexer';
import type { TreeNode } from './Node';
import { Parser } from './Parser';
import type { Token } from './Token';
import { altura, inorden, inordenParentizado, posorden, preorden } from './traversals';

/**
 * Árbol Binario de Expresión.
 *
 * Encapsula el pipeline   cadena → Lexer → tokens → Parser → árbol
 * y expone los tres recorridos recursivos.
 */
export class ExpressionTree {
  readonly source: string;
  readonly tokens: readonly Token[];
  readonly root: TreeNode;

  private constructor(source: string, tokens: readonly Token[], root: TreeNode) {
    this.source = source;
    this.tokens = tokens;
    this.root = root;
  }

  /** Construye el árbol. Lanza `ExpressionError` si la expresión es inválida. */
  static fromExpression(source: string): ExpressionTree {
    const tokens = new Lexer(source).tokenize();
    const root = new Parser(tokens).parse();
    return new ExpressionTree(source, tokens, root);
  }

  preorden(): TreeNode[] {
    return preorden(this.root);
  }

  inorden(): TreeNode[] {
    return inorden(this.root);
  }

  posorden(): TreeNode[] {
    return posorden(this.root);
  }

  inordenParentizado(): string {
    return inordenParentizado(this.root, (n) => formatInfo(n.info));
  }

  altura(): number {
    return altura(this.root);
  }

  size(): number {
    return this.preorden().length;
  }
}
