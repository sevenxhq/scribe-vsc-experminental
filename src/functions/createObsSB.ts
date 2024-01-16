import moment from "moment";
import burrito from "../resources/OBSTemplate.json";
import packageInfo from "../../package.json";

const createObsSB = (
  username: any,
  projectFields: { projectName: any; abbreviation: any },
  language: any,
  langCode: any,
  direction: string,
  copyright: { licence: string | any[] },
  id: any
): Record<string, any> => {
  let json: Record<string, any> = {};
  json = burrito;

  json.meta.generator.userName = username;
  json.meta.generator.softwareVersion = packageInfo.version;
  json.meta.dateCreated = moment().format();
  json.identification.primary = {
    scribe: {
      [id]: {
        revision: "1",
        timestamp: moment().format(),
      },
    },
  };
  json.languages[0].tag = langCode;
  json.languages[0].scriptDirection = direction?.toLowerCase();
  json.identification.name.en = projectFields.projectName;
  json.identification.abbreviation.en = projectFields.abbreviation;
  json.languages[0].name.en = language;
  json.copyright.licenses[0].ingredient = "license.md";
  return json;
};
export default createObsSB;
