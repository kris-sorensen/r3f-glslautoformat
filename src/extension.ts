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
  const transformedText = document
    .getText()
    .split("\n")
    .map((line) => {
      let trimmedLine = line.trim();

      if (trimmedLine.startsWith("/*")) {
        inCommentBlock = true;
      }

      if (
        inCommentBlock ||
        trimmedLine.startsWith("//") ||
        trimmedLine === "" ||
        trimmedLine.endsWith(";") ||
        trimmedLine.endsWith("{") ||
        trimmedLine.endsWith("`")
      ) {
        if (trimmedLine.endsWith("*/")) {
          inCommentBlock = false;
        }
        return line;
      }

      let regex = /(?<!\.\d*)\b(\d+)\b(?!.\d*\b)/g; // Matches integers that are not part of a word or a float number
      let modifiedLine = line.replace(regex, "$1.0");

      if (!modifiedLine.trim().endsWith(";")) {
        modifiedLine = modifiedLine + ";";
      }

      if (trimmedLine.endsWith("*/")) {
        inCommentBlock = false;
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
