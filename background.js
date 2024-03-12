function handleMessage(request, sender, sendResponse) {
    switch (request.type) {
        case "list-downloads":
            browser.downloads.search({}).then((downloads) => {
                sendResponse({ downloads: JSON.stringify(downloads) });
            });
            return true;
    }
}

browser.runtime.onMessage.addListener(handleMessage);
