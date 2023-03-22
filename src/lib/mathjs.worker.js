import * as math from 'mathjs';

onmessage = async (message) => {
  try {
    const parsed = math.parse(message.data.formula);
    // const compiled = parsed.compile();
    // const latex = katex.renderToString(parsed.toTex(), {
    //   throwOnError: false,
    //   displayMode: true,
    //   output: 'html',
    // });
    const symbols = parsed
      .filter((node) => node.isSymbolNode && node.name.length === 1)
      .map((node) => node.name)
      .filter((value, index, self) => self.indexOf(value) === index);
    const glsl = parsed.toString({
      handler(node, options) {
        if (node.type === 'ConstantNode') {
          //   return `float(${node.value})`;
          console.log(node.value.toString());
          return node.value.toString().replace(/(\d+)(\.(\d+))?/g, '$1.$3');
        } else if (node.type === 'OperatorNode') {
          if (node.op === '^') {
            return `pow(${node.args[0].toString(options)}, ${node.args[1].toString(options)})`;
          } else if (node.op === '-' && !node.args[1]) {
            return `-${node.args[0].toString(options)}`;
          } else {
            return `${node.args[0].toString(options)} ${node.op} ${node.args[1].toString(options)}`;
          }
        } else if (node.type === 'FunctionNode') {
          return `${node.name}(${node.args.map((arg) => arg.toString(options)).join(', ')})`;
        } else if (node.type === 'ParenthesisNode') {
          return `(${node.content.toString(options)})`;
        } else if (node.type === 'SymbolNode') {
          if (node.name === 'pi' || node.name === 'PI') {
            return 3.141592653589793;
          } else if (node.name === 'e' || node.name === 'E') {
            return 2.718281828459045;
          } else if (node.name === 'phi') {
            return 1.618033988749895;
          } else {
            return node.name;
          }
        } else {
          return node.toString();
        }
        // TODO: handle other node types not supported by GLSL
      },
    });

    postMessage({
      glsl,
      symbols,
    });
  } catch (error) {
    postMessage({ error });
    console.error(error);
  }
};
