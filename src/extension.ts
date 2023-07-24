import * as vscode from "vscode";

export function activate(context: vscode.ExtensionContext) {
  console.log(
    'Congratulations, your extension "r3f-glslautoformat" is now active!'
  );

  const supportedLanguages = [
    "typescript",
    "typescriptreact",
    "javascript",
    "javascriptreact",
  ];

  vscode.workspace.onWillSaveTextDocument((event) => {
    if (!supportedLanguages.includes(event.document.languageId)) {
      return;
    }

    formatDocument(event.document);
  });
}

function formatDocument(document: vscode.TextDocument) {
  let inCommentBlock = false;
  let inShaderBlock = false;
  let bufferLine = "";

  const transformedText = document
    .getText()
    .split("\n")
    .map((line) => {
      bufferLine += line;

      if (
        bufferLine.includes("vertexShader = `") ||
        bufferLine.includes("fragmentShader = `")
      ) {
        inShaderBlock = true;
      }

      if (bufferLine.endsWith("`;")) {
        inShaderBlock = false;
        bufferLine = "";
      }

      if (!inShaderBlock) {
        return line;
      }

      if (line.trim().startsWith("/*")) {
        inCommentBlock = true;
      }

      if (
        inCommentBlock ||
        line.trim().startsWith("//") ||
        line.trim() === "" ||
        line.trim().endsWith(";") ||
        line.trim().endsWith("{") ||
        line.trim().endsWith("}") ||
        line.trim().endsWith(",") ||
        line.trim().endsWith("`")
      ) {
        if (line.trim().endsWith("*/")) {
          inCommentBlock = false;
        }
        return line;
      }

      let regex = /(?<!\.\d*)\b(\d+)\b(?!.\d*\b)/g; // Matches integers that are not part of a word or a float number
      let modifiedLine = line.replace(regex, "$1.0");

      if (!modifiedLine.trim().endsWith(";")) {
        modifiedLine = modifiedLine + ";";
      }

      return modifiedLine;
    })
    .join("\n");

  const editor = vscode.window.activeTextEditor;
  if (editor) {
    editor.edit((editBuilder) => {
      const lastLine = document.lineAt(document.lineCount - 1);
      const textRange = new vscode.Range(
        0,
        0,
        document.lineCount - 1,
        lastLine.text.length
      );
      editBuilder.replace(textRange, transformedText);
    });
  }
}

export function deactivate() {}
