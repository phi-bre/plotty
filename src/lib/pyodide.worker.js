import { loadPyodide } from 'pyodide';

let pyodide;

onmessage = async (message) => {
  if (!pyodide) {
    pyodide = await loadPyodide({
      indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.22.1/full/',
      stdout: (msg) => console.log(msg),
      stderr: (msg) => console.log(msg),
    });

    await pyodide.loadPackagesFromImports(`import sympy`);

    pyodide.runPython(`
      from sympy import *
      from sympy.printing.c import C89CodePrinter
      from sympy.abc import a, b, c, d, e, f, g, h, i, j, k, l, m, n, o, p, q, r, s, t, u, v, w, x, y, z
    `);
  }

  try {
    const proxy = pyodide.runPython(message.data.formula);
    pyodide.globals.set('_', proxy);
    const output = pyodide.runPython(`C89CodePrinter().doprint(_)`);
    const compiled = output
      ?.toString()
      .replace(/(\d+)(\.(\d+))?/g, '$1.$3')
      .replace(/fabs/g, 'abs')
      .replace('I', '1.0');

    if (compiled.includes('/* Not supported in C: */')) {
      throw new Error('Not supported in C');
    }

    const symbols = pyodide
      .runPython(
        `
      list(map(lambda x: str(x), _.free_symbols))
    `,
      )
      .toJs();

    console.log(symbols);

    postMessage({
      compiled,
      symbols,
    });
  } catch (error) {
    postMessage({ error });
    console.error(error);
  }
};
