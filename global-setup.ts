import {rimraf} from 'rimraf';

async function globalSetup(): Promise<void> {
    // remove logs, html-reports, allure-results folders
    await rimraf('./logs');
    await rimraf('./html-reports');
    await rimraf('./allure-results');

    // Add global setup code here, if needed
}

export default globalSetup;