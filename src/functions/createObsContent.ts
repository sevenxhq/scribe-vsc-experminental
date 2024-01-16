import path from "path";
import * as vscode from "vscode";
import OBSData from "../resources/OBSData.json";
// ts-ignore
import OBSFront from "../resources/OBSfront.md";
import md5 from "md5";
import JsonToMd from "../utilities/jsonToMd";
import OBSBack from "../resources/OBSback.md";
import OBSLicense from "../resources/OBSLicense.md";

import moment from "moment";
import { directoryExists } from "../utilities/obs";
interface G<s> {
  id: s;
}

const bookAvailable = <S, T extends G<S>>(list: T[], id: S) =>
  list.some((obj) => obj.id === id);

type F = {
  name: string;
  content: string;
  files: { id: string; content: string }[];
};

const environment = {
  PROJECT_SETTING_FILE: "settings.json",
  AG_SETTING_VERSION: "1.0",
};

// FIXME: This function is too long. It should be broken up into smaller functions. & Should fix the uris just incase

export const createObsContent = async (
  project: { description: any },
  direction: any,
  currentBurrito: {
    project: {
      textStories: {
        starred: any;
        isArchived: any;
        refResources: any;
        bookMarks: any;
      };
    };
    sync: {
      // ts-ignore
      services: { door43: never[] };
    };
  },
  importedFiles: F["files"],
  copyright: { title: any },
  call: "new" | "edit",
  folderUri: vscode.Uri
) => {
  const fs = vscode.workspace.fs;
  const ingredients: Record<string, unknown> = {};
  let ingredientsDirName = "ingredients";

  if (!(await directoryExists(folderUri))) {
    await fs.createDirectory(folderUri);
  }

  if (call === "new") {
    OBSData.forEach(async (storyJson) => {
      const currentFileName = `${storyJson.storyId
        .toString()
        .padStart(2, "0")}.md`;

      const fileUri = folderUri.with({
        path: path.join(folderUri.path, ingredientsDirName, currentFileName),
      });

      if (bookAvailable(importedFiles, currentFileName)) {
        const file = importedFiles.filter((obj) => obj.id === currentFileName);

        await fs.writeFile(fileUri, Buffer.from(file[0].content, "utf-8"));
        const stats = await fs.stat(fileUri);
        ingredients[path.join(ingredientsDirName, currentFileName)] = {
          checksum: {
            md5: md5(file[0].content),
          },
          mimeType: "text/markdown",
          size: stats.size,
          scope: storyJson.scope,
        };
      } else {
        const fileContents = JsonToMd(storyJson, "");

        await fs.writeFile(fileUri, Buffer.from(fileContents));
        const stats = await fs.stat(fileUri);
        ingredients[path.join(ingredientsDirName, currentFileName)] = {
          checksum: {
            md5: md5(fileContents),
          },
          mimeType: "text/markdown",
          size: stats.size,
          scope: storyJson.scope,
        };
        // ingredients[path.join('content', currentFileName)].scope[book] = [];
      }
    });

    let fileFront: F = {
      files: [],
      content: "",
      name: "",
    };
    let fileBack: F = {
      files: [],
      content: "",
      name: "",
    };
    fileFront.files = importedFiles.filter((obj) => obj.id === "front.md");
    fileBack.files = importedFiles.filter((obj) => obj.id === "back.md");
    if (fileFront.files.length > 0) {
      fileFront.name = fileFront.files[0].id;
      fileFront.content = fileFront.files[0].content;
    } else {
      fileFront.name = "front.md";
      fileFront.content = OBSFront;
    }

    const frontFileUri = folderUri.with({
      path: path.join(folderUri.path, ingredientsDirName, fileFront.name),
    });
    await fs.writeFile(frontFileUri, Buffer.from(fileFront.content));
    let obsstat = await fs.stat(frontFileUri);
    ingredients[path.join(ingredientsDirName, fileFront.name)] = {
      checksum: {
        md5: md5(fileFront.content),
      },
      mimeType: "text/markdown",
      size: obsstat.size,
      role: "pubdata",
    };
    // back.md
    if (fileBack.files.length > 0) {
      fileBack.name = fileBack.files[0].id;
      fileBack.content = fileBack.files[0].content;
    } else {
      fileBack.name = "back.md";
      fileBack.content = OBSBack;
    }
    const backFileUri = folderUri.with({
      path: path.join(folderUri.path, ingredientsDirName, fileBack.name),
    });
    await fs.writeFile(backFileUri, Buffer.from(fileBack.content));
    obsstat = await fs.stat(backFileUri);
    ingredients[path.join(ingredientsDirName, fileBack.name)] = {
      checksum: {
        md5: md5(fileBack.content),
      },
      mimeType: "text/plain",
      size: obsstat.size,
      role: "title",
    };
    // OBS License

    const licenseFileUri = folderUri.with({
      path: path.join(folderUri.path, ingredientsDirName, "LICENSE.md"),
    });
    await fs.writeFile(licenseFileUri, Buffer.from(OBSLicense));
    obsstat = await fs.stat(licenseFileUri);
    ingredients[path.join(ingredientsDirName, "LICENSE.md")] = {
      checksum: {
        md5: md5(OBSLicense),
      },
      mimeType: "text/markdown",
      size: obsstat.size,
    };
  }
  // scribe setting creation
  const settings = {
    version: environment.AG_SETTING_VERSION,
    project: {
      textStories: {
        scriptDirection: direction,
        starred:
          call === "edit" ? currentBurrito.project.textStories.starred : false,
        isArchived:
          call === "edit"
            ? currentBurrito.project.textStories.isArchived
            : false,
        description: project.description,
        copyright: copyright.title,
        lastSeen: moment().format(),
        refResources:
          call === "edit"
            ? currentBurrito.project.textStories.refResources
            : [],
        bookMarks:
          call === "edit" ? currentBurrito.project.textStories.bookMarks : [],
        font: "",
      },
    },
    sync: { services: { door43: [] } },
  };
  if (call === "edit") {
    settings.sync = currentBurrito?.sync;
  }

  const projectSettingFileUri = folderUri.with({
    path: path.join(
      folderUri.path,
      ingredientsDirName,
      environment.PROJECT_SETTING_FILE
    ),
  });

  await fs.writeFile(
    projectSettingFileUri,
    Buffer.from(JSON.stringify(settings))
  );
  const stat = await fs.stat(projectSettingFileUri);
  ingredients[path.join(ingredientsDirName, environment.PROJECT_SETTING_FILE)] =
    {
      checksum: {
        md5: md5(JSON.stringify(settings)),
      },
      mimeType: "application/json",
      size: stat.size,
      role: "x-scribe",
    };

  return ingredients;
};
