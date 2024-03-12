document.addEventListener("DOMContentLoaded", () => {
    loadDownloads();
    document.getElementById("reload").addEventListener("click", loadDownloads);
    document.getElementById("folder").addEventListener("click", openFolder);
});

browser.downloads.onChanged.addListener(loadDownloads);
browser.downloads.onCreated.addListener(loadDownloads);
browser.downloads.onErased.addListener(loadDownloads);

function loadDownloads() {
    browser.runtime
        .sendMessage({
            type: "list-downloads",
        })
        .then(handleResponse, handleError);
}

function openFolder() {
    browser.downloads.showDefaultFolder();
}

function handleResponse(message) {
    let downloads = JSON.parse(message.downloads).reverse();
    console.log(downloads);
    let table = document.getElementById("table");
    table.innerHTML = "";
    for (const download of downloads) {
        let filename = download.filename.substring(
            download.filename.lastIndexOf("/") + 1
        );
        let row = document.createElement("tr");
        let cell = document.createElement("td");
        if (download.state === "in_progress") {
            cell.innerHTML = `<span class="name${download.danger === "safe" ? "" : " danger"}">${filename}</span><br>`;
            //TODO: finish this - need buttons for pause (switches to resume) and cancel, and need percentage and bytes downloaded/total bites
        } else if (download.state === "interrupted") {
            //TODO: finish this
        } else {
            cell.innerHTML = `<span class="name${download.danger === "safe" ? "" : " danger"}">${filename}</span><br><span class="datetime">${formatDate(download.startTime)}</span><br><span class="size">${download.exists ? formatBytes(download.fileSize) : "File missing or moved"}</span><br>${getURLHTML(download.url)}`;
            let button = document.createElement("button");
            button.classList.add("open");
            button.innerHTML = "&#128640;";
            button.addEventListener("click", (event) => {
                browser.downloads.open(download.id);
            });
            cell.appendChild(button);
        }
        row.appendChild(cell);
        table.appendChild(row);
    }
}

function formatBytes(bytes, decimals = 2) {
    if (!+bytes) return "0 Bytes";

    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = [
        "Bytes",
        "KiB",
        "MiB",
        "GiB",
        "TiB",
        "PiB",
        "EiB",
        "ZiB",
        "YiB",
    ];

    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

function formatDate(date) {
    let today = new Date();
    let d = new Date(date);
    if (
        today.getDate() === d.getDate() &&
        today.getMonth() === d.getMonth() &&
        today.getFullYear() === d.getFullYear()
    ) {
        return `${("0" + d.getHours()).substr(-2)}:${("0" + d.getMinutes()).substr(-2)}`;
    } else if (browser.i18n.getUILanguage() === "en-US") {
        return `${d.getMonth() + 1}/${d.getDate()}/${d.getFullYear()} ${("0" + d.getHours()).substr(-2)}:${("0" + d.getMinutes()).substr(-2)}`;
    } else {
        return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()} ${("0" + d.getHours()).substr(-2)}:${("0" + d.getMinutes()).substr(-2)}`;
    }
}

function getURLHTML(url) {
    let u = new URL(url);
    if (url.substring(0, 5) === "blob:") {
        if (u.origin) {
            u = new URL(u.origin);
            return `<a href="${u.href}" class="link">${u.hostname}</a>`;
        } else {
            return "";
        }
    } else {
        return `<a href="${url}" class="link">${u.hostname}</a>`;
    }
}

function handleError(error) {
    console.error("Error: ", error);
}
