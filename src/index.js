import template from 'babel-template';
import serialize from 'babel-literal-to-ast';
import cp from 'child_process';

const buildMetaInsertion = template(`
  FN_NAME.__docz = {
    jsdoc: JSDOC
  };
`);

function parseJSDoc(filename) {
  try {
    return JSON.parse(cp.execSync(`jsdoc -X ${filename}`));
  } catch (e) {
    return [];
  }
}

function findDefinition(nodeName, ast) {
  const def = ast.find(n => n.name === nodeName);
  if (def) {
    return def;
  }
  return null;
}

export default function({ types: t }) {
  return {
    visitor: {
      FunctionDeclaration(path, state) {
        const filename = state.file.opts.filename;
        const jsdocAST = parseJSDoc(filename);

        const fnName = path.node.id.name;
        const newNode = buildMetaInsertion({
          FN_NAME: t.identifier(fnName),
          JSDOC: serialize(findDefinition(fnName, jsdocAST))
        });

        path.insertAfter(newNode);
      }
    }
  };
}
