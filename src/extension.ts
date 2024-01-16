// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
import { ObsProvider } from "./Providers/obs";
import { SidebarProvider } from "./Providers/sidebar";
import { fileExists, isProjectObs } from "./utilities/obs";
import { StoryOutlineProvider } from "./Providers/storyOutline";

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  // Use the console to output diagnostic information (console.log) and errors (console.error)
  // This line of code will only be executed once when your extension is activated
  console.log('Congratulations, your extension "scribe-vsc" is now active!');

  const currentProjectURI = vscode.workspace.workspaceFolders?.[0].uri;

  if (!currentProjectURI) {
    vscode.window.showErrorMessage("No workspace opened");
    return;
  }

  const metadataFileUri = currentProjectURI.with({
    path: vscode.Uri.joinPath(currentProjectURI, "metadata.json").path,
  });

  (async () => {
    const isCurrentProject = await isProjectObs(metadataFileUri);

    vscode.commands.executeCommand(
      "setContext",
      "scribe-vsc.isProjectObs",
      isCurrentProject
    );
    if (!isCurrentProject) {
      vscode.window.showWarningMessage(
        "Current project is not an OBS project! Obs features will be disabled!"
      );
      return;
    }
  })();
  context.subscriptions.push(ObsProvider.register(context));
  context.subscriptions.push(SidebarProvider.register(context));
  context.subscriptions.push(StoryOutlineProvider.register(context));
}

// This method is called when your extension is deactivated
export function deactivate() {}
