import fs from 'fs';
import { Workbook } from "exceljs";

export class FileUtils {
    static async readDataFromExcel(filePath: string, fileName: string, sheetName: string, rowNum: number, cellNum: number): Promise<string> {
        try {

            const workbook = new Workbook();
            const fullPath = filePath.endsWith('/') ? filePath + fileName : filePath + '/' + fileName;
            await workbook.xlsx.readFile(fullPath);
            const sheet = workbook.getWorksheet(sheetName);

            if (!sheet) {
                throw new Error(`Sheet "${sheetName}" not found in ${fileName}`);
            }

            const cell = sheet.getRow(rowNum).getCell(cellNum);
            return cell.toString()
        } catch (error) {
            throw new Error(`Error reading data from Excel file: ${error}`);
        }
    }

    static readTextFile(filePath: string): string {
        try {
            return fs.readFileSync(filePath, 'utf8');
        } catch (error) {
            throw new Error(`Failed to read text file at ${filePath}: ${error}`);
        }
    }

    static readJsonFile<T>(filePath: string): T {
        try {
            const content = fs.readFileSync(filePath, 'utf8');
            return JSON.parse(content) as T;
        } catch (error) {
            throw new Error(`Failed to read JSON file at ${filePath}: ${error}`);
        }
    }

    static writeFile(filePath: string, content: string): void {
        try {
            fs.writeFileSync(filePath, content, 'utf8');
        } catch (error) {
            throw new Error(`Failed to write file at ${filePath}: ${error}`);
        }
    }

    static fileExists(filePath: string): boolean {
        return fs.existsSync(filePath);
    }
}