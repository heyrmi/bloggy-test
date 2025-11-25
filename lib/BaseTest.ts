import { AdminPage } from "@/pageFactory/AdminPage";
import { CreateBlogPage } from "@/pageFactory/CreateBlogPage";
import { HomePage } from "@/pageFactory/HomePage";
import { LoginPage } from "@/pageFactory/LoginPage";
import { PublishedBlogPage } from "@/pageFactory/PublishedBlogPage";
import { ApiActions } from "@lib/ApiActions";
import { test as baseTest } from '@playwright/test';

type TestFixtures = {
    apiActions: ApiActions;
    homePage: HomePage;
    loginPage: LoginPage;
    adminPage: AdminPage;
    createBlogPage: CreateBlogPage;
    publishedBlogPage: PublishedBlogPage;
};

const test = baseTest.extend<TestFixtures>({
    apiActions: async ({ request }, use) => {
        await use(new ApiActions(request));
    },

    homePage: async ({ page, context }, use) => {
        const homePage = new HomePage(page, context);
        await use(homePage);
    },

    loginPage: async ({ page, context }, use) => {
        const loginPage = new LoginPage(page, context);
        await use(loginPage);
    },

    adminPage: async ({ page, context }, use) => {
        const adminPage = new AdminPage(page, context);
        await use(adminPage);
    },

    createBlogPage: async ({ page, context }, use) => {
        const createBlogPage = new CreateBlogPage(page, context);
        await use(createBlogPage);
    },

    publishedBlogPage: async ({ page, context }, use) => {
        const publishedBlogPage = new PublishedBlogPage(page, context);
        await use(publishedBlogPage);
    }
});

export default test;