import { useState } from "react";
import { renderToPage } from "../utilities/main-vscode";
import {
  VSCodeButton,
  VSCodeTextArea,
  VSCodeTextField,
  VSCodeDropdown,
  VSCodeOption,
} from "@vscode/webview-ui-toolkit/react";
import { Copyright, Language } from "../../../src/shared/projectTypes";
import { MessageType } from "../../../src/shared/messageTypes";
import { vscode } from "../utilities/vscode";
import staticLangs from "../../../src/resources/langNames.json";
import advancedSettings from "../../../src/resources/AdvanceSettings.json";

const Sidebar = () => {
  const [projectName, setProjectName] = useState("");
  const [description, setDescription] = useState("");
  const [abbreviation, setAbbreviation] = useState("");
  const languagesList = staticLangs;
  const licenseList = advancedSettings.copyright;
  const [copyright, setCopyright] = useState<Copyright>();
  const [language, setLanguage] = useState<Language>();

  const handleSubmit = () => {
    vscode.postMessage({
      type: MessageType.createProject,
      payload: {
        projectName,
        description,
        abbreviation,
        language,
        copyright,
      },
    });
  };

  return (
    <div className="rounded-md border shadow-sm mt-4 ml-5 mr-5 mb-5">
      <div className="space-y-2 m-10">
        <span className="text-xs font-base mb-2 text-primary leading-4 tracking-wide  font-light">
          Project Type
        </span>
        OBS
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 m-10 gap-5">
        <div className="lg:col-span-1">
          <h4 className="text-xs font-base mb-2 text-primary  tracking-wide leading-4  font-light">
            Project Name
            <span className="text-error">*</span>
          </h4>
          <VSCodeTextField
            type="text"
            name="project_name"
            id="project_name"
            value={projectName}
            onChange={(e) => {
              setProjectName((e.target as HTMLInputElement).value);
            }}
            className={
              "bg-gray-200 w-48 lg:w-full rounded shadow-sm sm:text-sm focus:border-primary border-gray-300"
            }
          />
          {/* <span className="text-error">
            {error.projectName[0]?.message || error.projectName[1]?.message}
          </span> */}
          <h4 className="mt-5 text-xs font-base mb-2 text-primary leading-4 tracking-wide  font-light">
            {/* {t("label-description")} */}
            Description
          </h4>
          <VSCodeTextArea
            name="Description"
            id="project_description"
            value={description}
            onChange={(e) => {
              setDescription((e.target as HTMLTextAreaElement).value);
            }}
            className="w-48 lg:w-full h-28 block rounded shadow-sm sm:text-sm focus:border-primary"
          />
          {/* <span className="text-error">{error.description[0]?.message}</span> */}
        </div>
        <div className="lg:col-span-2">
          <div className="flex gap-5">
            <div>
              <h4 className="text-xs font-base mb-2 text-primary  tracking-wide leading-4  font-light">
                {/* {t("label-abbreviation")} */}
                Abbreviation
                <span className="text-error">*</span>
              </h4>
              <VSCodeTextField
                type="text"
                name="version_abbreviated"
                id="version_abbreviated"
                value={abbreviation}
                onInput={(e) => {
                  setAbbreviation((e.target as HTMLInputElement).value);
                }}
                className="w-24 block rounded  sm:text-sm focus:border-primary border-gray-300"
              />
              {/* <span className="text-error">
                {error.abbr[0]?.message || error.abbr[1]?.message}
              </span> */}
            </div>
          </div>
          <div className="flex gap-5 mt-5 items-center">
            <div>
              <div className="flex gap-4 items-center mb-2">
                <h4 className="text-xs font-base  text-primary  tracking-wide leading-4  font-light">
                  Target Language <span className="text-error">*</span>
                </h4>
              </div>

              <VSCodeDropdown
                position="below"
                className="w-48 lg:w-full"
                value={language ? language?.ang : "Select Language"}
                onChange={(e) => {
                  setLanguage(
                    languagesList.find(
                      (lang) =>
                        lang.ang === (e.target as HTMLInputElement).value
                    )
                  );
                }}
              >
                {languagesList.slice(0, 100).map((lang) => (
                  <VSCodeOption value={lang.ang} key={lang.pk}>
                    {lang.ang} {""}
                    <span className="text-green-600">({lang.lc})</span>
                  </VSCodeOption>
                ))}
              </VSCodeDropdown>
            </div>
            {/* <button
              type="button"
              className="mt-6 -ml-2"
              title={t("msg-min-three-letter")}
            >
              <InformationCircleIcon className="h-5 w-5" aria-hidden="true" />
            </button>
            <div className="mt-5">
              <TargetLanguagePopover projectType={headerDropDown} />
            </div> */}
          </div>
          {/* <div className="mt-5">
            <button
              type="button"
              className="rounded-full px-3 py-1 bg-primary hover:bg-black
                      text-white text-xs uppercase font-semibold"
              onClick={openImportPopUp}
            >
              {t("btn-import-books")}
            </button>
            <ImportPopUp
              open={openPopUp}
              closePopUp={closeImportPopUp}
              projectType={headerDropDown}
              replaceConformation={callReplace}
            />
          </div> */}
          <div className="flex gap-5 mt-5 items-center">
            <div>
              <div className="flex gap-4 items-center mb-2">
                <h4 className="text-xs font-base text-primary tracking-wide leading-4 font-light">
                  Licence <span className="text-error">*</span>
                </h4>
              </div>

              <VSCodeDropdown
                position="below"
                className="w-48 lg:w-full"
                value={copyright ? copyright.title : "Select License"}
                onChange={(e) => {
                  setCopyright(
                    licenseList.find(
                      (license) =>
                        license.title === (e.target as HTMLInputElement).value
                    )
                  );
                }}
              >
                {licenseList.map((licence) => (
                  <VSCodeOption value={licence.title} key={licence.id}>
                    {licence.title}
                  </VSCodeOption>
                ))}
              </VSCodeDropdown>
            </div>
          </div>
        </div>

        <div>
          <div>
            <VSCodeButton
              type="button"
              aria-label="create"
              className="w-40 h-10 my-5 bg-success leading-loose rounded shadow text-xs font-bas tracking-wide font-light uppercase"
              onClick={handleSubmit}
            >
              {/* {t("btn-create-project")} */}
              Create Project
            </VSCodeButton>
          </div>
        </div>
      </div>
    </div>
  );
};

renderToPage(<Sidebar />);
