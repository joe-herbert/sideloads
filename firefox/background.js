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
