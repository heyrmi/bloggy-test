import { FileUtils } from "@lib/utils/FileUtils";
import path from "path";

const loginDataPath = path.join(__dirname, 'login.json');
const loginJsonData = FileUtils.readJsonFile<any>(loginDataPath);

export const testData = {
    loginData: loginJsonData
};
