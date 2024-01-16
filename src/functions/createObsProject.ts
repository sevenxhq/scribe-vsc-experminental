import { saveObsProjectMeta } from "./saveObsProjectMeta";
import * as vscode from "vscode";

export const createObsProject = async (
  projectFields: Record<string, string>
) => {
  console.log(createObsProject.name, projectFields);
  const newProjectData = {
    newProjectFields: {
      projectName: projectFields.projectName,
      description: projectFields.description,
      abbreviation: projectFields.abbreviation,
    },
    language: projectFields.language,
    copyright: projectFields.copyright,
    importedFiles: [],
    call: "new",
    update: false,
    projectType: "OBS",
  };

  const res = await saveObsProjectMeta(newProjectData as any);

  console.log(res);
  vscode.window.showInformationMessage("Project created successfully!");
};
