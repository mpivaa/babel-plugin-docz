"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = _default;

var _babelTemplate = _interopRequireDefault(require("babel-template"));

var _babelLiteralToAst = _interopRequireDefault(require("babel-literal-to-ast"));

var _child_process = _interopRequireDefault(require("child_process"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const buildMetaInsertion = (0, _babelTemplate.default)(`
  FN_NAME.__docz = {
    jsdoc: JSDOC
  };
`);

function parseJSDoc(filename) {
  try {
    return JSON.parse(_child_process.default.execSync(`jsdoc -X ${filename}`));
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

function _default({
  types: t
}) {
  return {
    visitor: {
      FunctionDeclaration(path, state) {
        const filename = state.file.opts.filename;
        const jsdocAST = parseJSDoc(filename);
        const fnName = path.node.id.name;
        const newNode = buildMetaInsertion({
          FN_NAME: t.identifier(fnName),
          JSDOC: (0, _babelLiteralToAst.default)(findDefinition(fnName, jsdocAST))
        });
        path.insertAfter(newNode);
      }

    }
  };
}
