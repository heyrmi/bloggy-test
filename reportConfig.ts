import logger from '@lib/utils/Logger';
import { Reporter, TestCase, TestResult, TestStep } from '@playwright/test/reporter';

export default class CustomReporterConfig implements Reporter {
    // We can use this to customize the report, or send logs to a different service like a collector 
    // (disabled for now) enable this in playwright.config.ts if needed

    onTestBegin(test: TestCase): void {
        logger.info(`Test started: ${test.title}`);
    }

    onTestEnd(test: TestCase, result: TestResult): void {
        logger.info(`Test ended: ${test.title}, Status: ${result.status}`);
    }

    onStepBegin(test: TestCase, result: TestResult, step: TestStep): void {
        logger.info(`Step started: ${step.title}, Status: ${result.status} for test: ${test.title}`);
    }

    onStepEnd(test: TestCase, result: TestResult, step: TestStep): void {
        logger.info(`Step ended: ${step.title}, Status: ${result.status} for test: ${test.title}`);
    }

    onTestSkip(test: TestCase, result: TestResult): void {
        logger.info(`Test skipped: ${test.title}, Status: ${result.status}`);
    }

    onTestFail(test: TestCase, result: TestResult): void {
        logger.error(`Test failed: ${test.title}, Status: ${result.status}`);
    }

    onTestPass(test: TestCase, result: TestResult): void {
        logger.info(`Test passed: ${test.title}, Status: ${result.status}`);
    }
}