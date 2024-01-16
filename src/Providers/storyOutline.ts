import * as vscode from "vscode";
import { getUri } from "../utilities/getUri";
import { getNonce } from "../utilities/getNonce";
import { MessageType } from "../shared/messageTypes";
import { createObsProject } from "../functions/createObsProject";

export class StoryOutlineProvider implements vscode.WebviewViewProvider {
  private _webviewView: vscode.WebviewView | undefined;
  private _context: vscode.ExtensionContext | undefined;
  public static register(context: vscode.ExtensionContext): vscode.Disposable {
    const provider = new StoryOutlineProvider(context);
    const providerRegistration = vscode.window.registerWebviewViewProvider(
      StoryOutlineProvider.viewType,
      provider
    );
    return providerRegistration;
  }

  private static readonly viewType = "scribe-vsc.obs-sidebar-outline";

  constructor(private readonly context: vscode.ExtensionContext) {
    this._context = context;
    this._registerCommands();
  }

  public async resolveWebviewView(
    webviewPanel: vscode.WebviewView,
    ctx: vscode.WebviewViewResolveContext,
    _token: vscode.CancellationToken
  ): Promise<void> {
    webviewPanel.webview.options = {
      enableScripts: true,
    };
    webviewPanel.webview.html = this._getWebviewContent(
      webviewPanel.webview,
      this.context.extensionUri
    );

    // Receive message from the webview.
    webviewPanel.webview.onDidReceiveMessage(
      async (e: { type: MessageType; payload: unknown }) => {
        switch (e.type) {
          case MessageType.openStory:
            if (!vscode.workspace.workspaceFolders?.length) {
              return vscode.window.showErrorMessage("No workspace opened");
            }

            if (!(e.payload as Record<string, any>).storyNumber) {
              return vscode.window.showErrorMessage("No story number provided");
            }
            const storyURI = vscode.Uri.joinPath(
              vscode.workspace.workspaceFolders?.[0].uri,
              "ingredients",
              `${(e.payload as Record<string, any>).storyNumber}.md`
            );
            await vscode.commands.executeCommand("vscode.open", storyURI);
            break;
          default:
            break;
        }
      }
    );

    this._webviewView = webviewPanel;
  }

  public revive(panel: vscode.WebviewView) {
    this._webviewView = panel;
  }

  private async _registerCommands() {
    const commands: {
      command: string;
      title: string;
      handler: (...args: any[]) => any;
    }[] = [];

    const registeredCommands = await vscode.commands.getCommands();

    commands.forEach((command) => {
      if (!registeredCommands.includes(command.command)) {
        this._context?.subscriptions.push(
          vscode.commands.registerCommand(command.command, command.handler)
        );
      }
    });
  }

  private _getWebviewContent(
    webview: vscode.Webview,
    extensionUri: vscode.Uri
  ) {
    // The CSS file from the React build output
    const stylesUri = getUri(webview, extensionUri, [
      "webview-ui",
      "build",
      "assets",
      "index.css",
    ]);
    // The View JS file from the React build output
    const scriptUri = getUri(webview, extensionUri, [
      "webview-ui",
      "build",
      "assets",
      "views",
      "StoriesOutline.js",
    ]);

    const nonce = getNonce();

    // Tip: Install the es6-string-html VS Code extension to enable code highlighting below
    return /*html*/ `
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <!-- <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${webview.cspSource}; script-src 'nonce-${nonce}';"> -->
          <link rel="stylesheet" type="text/css" href="${stylesUri}">
          <title>Sidebar vscode obs extension</title>
        </head>
        <body>
          <div id="root"></div>
          <script type="module" nonce="${nonce}" src="${scriptUri}"></script>
        </body>
      </html>
    `;
  }
}
