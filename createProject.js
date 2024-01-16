const createProject = async (call, project, update, projectType) => {
  logger.debug("ProjectContext.js", "In createProject");
  await createProjectCommonUtils();
  // common props pass for all project type
  const projectMetaObj = {
    newProjectFields,
    language,
    copyright,
    importedFiles,
    call,
    project,
    update,
    projectType,
  };
  if (projectType !== "OBS") {
    createProjectTranslationUtils();
    const temp_obj = {
      versificationScheme: versificationScheme.title,
      canonSpecification,
    };
    Object.assign(projectMetaObj, temp_obj);
  }
  logger.debug(
    "ProjectContext.js",
    "Calling saveProjectsMeta with required props"
  );
  const status = isElectron()
    ? await saveProjectsMeta(projectMetaObj)
    : await saveSupabaseProjectsMeta(projectMetaObj);
  return status;
};

const createProjectCommonUtils = async () => {
  logger.debug("ProjectContext.js", "In createProject common utils");
  if (language?.id) {
    // /check lang exist in backend and check any field value changed
    // add language to custom
  }
  // Update Custom licence into current list.
  if (copyright.title === "Custom") {
    isElectron()
      ? await updateJson("copyright")
      : await updateWebJson("copyright");
  } else {
    const myLicence = Array.isArray(licenceList)
      ? licenceList.find((item) => item.title === copyright.title)
      : [];
    const licensefile = require(`../../lib/license/${copyright.title}.md`);
    myLicence.licence = licensefile.default;
    setCopyRight(myLicence);
  }
};
/***
 * Gets current user settings
 * get the copyright settings or create new one.
 * updates the settings of the user
 */
const updateJson = async (currentSettings) => {
  logger.debug("ProjectContext.js", "In updateJson");
  const newpath = await localStorage.getItem("userPath");
  let currentUser;
  await localforage.getItem("userProfile").then((value) => {
    currentUser = value.username;
    setUsername(value.username);
  });
  const fs = window.require("fs");
  const file = path.join(
    newpath,
    packageInfo.name,
    "users",
    currentUser,
    environment.USER_SETTING_FILE
  );
  if (fs.existsSync(file)) {
    const agUserSettings = await fs.readFileSync(file);
    if (agUserSettings) {
      logger.debug("ProjectContext.js", "Successfully read the data from file");
      // Current settings
      const json = JSON.parse(agUserSettings);
      // eslint-disable-next-line no-nested-ternary
      const currentSetting =
        currentSettings === "copyright"
          ? copyright
          : currentSettings === "languages"
          ? {
              title: language.ang,
              id: language.id,
              scriptDirection: language.ld,
              langCode: language.lc,
              custom: true,
            }
          : canonSpecification;
      if (currentSettings === "canonSpecification") {
        json.history?.textTranslation[currentSettings]?.push(currentSetting);
      } else if (
        json.history[currentSettings] &&
        uniqueId(json.history[currentSettings], currentSetting.id)
      ) {
        json.history[currentSettings].forEach((setting) => {
          if (setting.id === currentSetting.id) {
            const keys = Object.keys(setting);
            keys.forEach((key) => {
              setting[key] = currentSetting[key];
            });
          }
        });
      } else {
        // updating the canon or pushing new language
        json.history[currentSettings].push(currentSetting);
      }
      json.version = environment.AG_USER_SETTING_VERSION;
      json.sync.services.door43 = json?.sync?.services?.door43
        ? json?.sync?.services?.door43
        : [];
      logger.debug(
        "ProjectContext.js",
        "Upadting the settings in existing file"
      );
      await fs.writeFileSync(file, JSON.stringify(json));
      logger.debug("ProjectContext.js", "Loading new settings from file");
      await loadSettings();
    } else {
      logger.error("ProjectContext.js", "Failed to read the data from file");
    }
  }
};

const fromContext = {
  language,
  customLanguages,
  copyright,
};

// default advanced settings
lib / advancedSettings.json;
