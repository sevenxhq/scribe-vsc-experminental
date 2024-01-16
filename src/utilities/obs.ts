import * as vscode from "vscode";

export const directoryExists = async (uri: vscode.Uri) => {
  try {
    await vscode.workspace.fs.readDirectory(uri);
    return true;
  } catch (error) {
    return false;
  }
};
