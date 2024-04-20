function handleMessage(request, sender, sendResponse) {
    switch (request.type) {
        case "list-downloads":
            browser.downloads.search({}).then((downloads) => {
                sendResponse({ downloads: JSON.stringify(downloads) });
            });
            return true;
        case "get-download":
            browser.downloads
                .search({ id: request.id, limit: 1 })
                .then((downloads) => {
                    sendResponse({ download: JSON.stringify(downloads[0]) });
                });
            return true;
    }
}

browser.runtime.onMessage.addListener(handleMessage);

browser.runtime.onInstalled.addListener(async ({ reason, temporary }) => {
    if (temporary) return;
    var url;
    switch (reason) {
        case "install":
            await browser.tabs.create({
                url: "https://sideloads.joeherbert.dev/?onboard=true&browser=firefox",
            });
            break;
        case "update":
            await browser.tabs.create({
                url: browser.runtime.getURL("updated.html"),
            });
            break;
    }
});

browser.runtime.setUninstallURL("https://sideloads.joeherbert.dev/uninstall");
