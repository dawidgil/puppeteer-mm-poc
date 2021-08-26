const puppeteer = require('puppeteer');
const dappeteer = require('@chainsafe/dappeteer');
async function getMetamaskWindow(browser) {
    const metamaskPage = await new Promise((resolve) => {
        browser.pages().then((pages) => {
            for (const page of pages) {
                if (page.url().includes('chrome-extension')) resolve(page);
            }
        });
    });

    return metamaskPage;
}
async function main() {
    const browser = await dappeteer.launch(puppeteer);
    try {

        const metamask = await dappeteer.setupMetamask(browser, {
            seed: 'allow special exercise item pretty cliff fitness foam acquire about truth bone',
            password: '123456789'
        })
        await metamask.addNetwork({
            networkName: 'Volta',
            rpc: 'https://volta-rpc.energyweb.org',
            chainId: 73799,
            symbol: 'VT',
            explorer: 'http://volta-explorer.energyweb.org/'
        })

        const page = await browser.newPage()
        await page.goto('https://switchboard-dev.energyweb.org');
        await page.waitForSelector('.top-layer');
        await page.waitForTimeout(2000);

        const btn = await page.$('.btn-connect-metamask');
        await btn.focus();
        await btn.click();

        await metamask.approve();
        const metamaskWindow = await getMetamaskWindow(browser);
        await metamaskWindow.bringToFront();
        await metamaskWindow.reload();

        const popover = await metamaskWindow.waitForSelector('[data-testid="popover-close"]');
        await popover.click();

        const button2 = await metamaskWindow.waitForSelector('[data-testid="home__activity-tab"]');
        await button2.click();

        const unconfirmed = await metamaskWindow.waitForSelector('.transaction-list-item--unconfirmed');
        await unconfirmed.click();

        const sign = await metamaskWindow.waitForSelector('[data-testid="request-signature__sign"]');
        await sign.click();

        await page.bringToFront();
        await page.waitForTimeout(10000);

    } catch (e) {
        console.log(e);
    } finally {
        await browser.close();
    }


    // 🏌
    // await metamask.confirmTransaction()
}

main()
