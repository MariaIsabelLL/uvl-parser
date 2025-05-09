
import UVLJavaScriptCustomLexer from './UVLJavaScriptCustomLexer.js';
import UVLJavaScriptParser from './lib/UVLJavaScriptParser.js';
import ErrorListener from "./errors/ErrorListener.js";
import antlr4 from 'antlr4';
import fs from 'fs';

export { UVLJavaScriptParser };

export default class FeatureModel {

  constructor(param) {
    this.featureModel = '';
    let chars = '';
    if (this.isFile(param)) {
      chars = new antlr4.FileStream(param);
    } else {
      chars = antlr4.CharStreams.fromString(param);
    }
    this.getTree(chars);
  }

  isFile(str) {
    try {
      return fs.statSync(str);
    } catch (e) {
      console.error('Error: ' + e);
      return false;
    }
  }

  getTree(chars) {
    const lexer = new UVLJavaScriptCustomLexer(chars);
    const tokens = new antlr4.CommonTokenStream(lexer);
    const errorListener = new ErrorListener();
    let parser = new UVLJavaScriptParser(tokens);
    parser.removeErrorListeners();
    parser.addErrorListener(errorListener);
    const tree = parser.featureModel();
    this.featureModel = tree;
  }

  getImports(deep=false){
    let paths = [];
    const protocols = ['git', 'npm', 'file'];              
    const tree = this.getFeatureModel();
    const namespace = this.getNamespace(tree);
    const listImports = tree.imports();

    if (listImports !== null) {          
      listImports.children.forEach((childImport) => {
        if (childImport instanceof UVLJavaScriptParser.ImportLineContext) {
          childImport.children.forEach((childImportLine) => {
            let nameChildImport = childImportLine.ns.getText().trim();
            let aliasChildImport = this.getAliasImport(childImportLine);
            let nameProtocol = null;
            let importType = null;
            if (childImportLine instanceof UVLJavaScriptParser.ImportLineExtendedContext) {
              nameProtocol = childImportLine.pp.getText().trim();
              for (const protocol of protocols) {
                if (nameProtocol.startsWith(protocol)) {
                  importType = protocol;
                  nameProtocol = nameProtocol.slice(protocol.length+1);
                  break;
                }
              }
            }
            const importDetail = {
                  "namespace": namespace,
                  "name": nameChildImport,
                  "importType": importType,
                  "importPath": nameProtocol,
                  "alias": aliasChildImport
              };
            paths.push(importDetail);
          });
        }
      });
    }          
    return paths;
  }

  getNamespace(tree) {
    const namespace = tree.namespace();
    let name = null;
    if (namespace instanceof UVLJavaScriptParser.NamespaceContext) {
        namespace.children.forEach((child) => {
          if (child instanceof UVLJavaScriptParser.ReferenceContext) {
              name = child.getText();
              return true;
          }
        });
    }
    return name;
  }

  getAliasImport(childImport){
    if (childImport.alias!== null){
      return childImport.alias.getText().trim()
    }
  }

  getFeatureModel() {
    return this.featureModel;
  }

  toString() {
    return this.featureModel.getText();
  }
}



