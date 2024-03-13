document.addEventListener("DOMContentLoaded", () => {
    loadDownloads();
    document.getElementById("reload").addEventListener("click", loadDownloads);
    document.getElementById("folder").addEventListener("click", openFolder);
    document.getElementById("settings").addEventListener("click", () => {
        document.getElementById("settingsWrapper").classList.toggle("hide");
    });
    let missing = document.getElementById("missing");
    missing.addEventListener("change", () => {
        browser.storage.sync.set({ missing: event.currentTarget.checked });
        loadDownloads();
    });
    let mime = document.getElementById("mime");
    mime.addEventListener("change", () => {
        browser.storage.sync.set({ mime: event.currentTarget.checked });
        loadDownloads();
    });
    browser.storage.sync.get(["missing", "mime"], (values) => {
        if (values === undefined) {
            values = {};
        }
        if (values === undefined || values.missing === undefined) {
            browser.storage.sync.set({ missing: true });
            values.missing = true;
        }
        missing.checked = values.missing;
        if (values === undefined || values.mime === undefined) {
            browser.storage.sync.set({ mime: false });
            values.mime = false;
        }
        mime.checked = values.mime;
    });
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

let intervalId = {};

function handleResponse(message) {
    let downloads = JSON.parse(message.downloads).reverse();
    console.log(downloads);
    let table = document.getElementById("table");
    table.innerHTML = "";
    if (downloads.length === 0) {
        let row = document.createElement("tr");
        row.classList.add("noDownloads");
        let cell = document.createElement("td");
        cell.style.textAlign = "center";
        cell.innerHTML = `No downloads`;
        row.appendChild(cell);
        table.appendChild(row);
    } else {
        browser.storage.sync.get(["missing", "mime"], (values) => {
            document.getElementById("table").innerHTML = "";
            if (values === undefined) {
                values = {};
            }
            if (values === undefined || values.missing === undefined) {
                browser.storage.sync.set({ missing: true });
                values.missing = true;
            }
            if (values === undefined || values.mime === undefined) {
                browser.storage.sync.set({ mime: false });
                values.mime = false;
            }
            for (const download of downloads) {
                if (download.exists || values.missing) {
                    let filename = download.filename.substring(
                        download.filename.lastIndexOf("/") + 1
                    );
                    let row = document.createElement("tr");
                    let cell = document.createElement("td");
                    if (
                        download.state === "in_progress" ||
                        (download.state === "interrupted" &&
                            download.paused &&
                            download.canResume)
                    ) {
                        cell.innerHTML = `<span class="name${download.danger === "safe" ? "" : " danger"}">${filename}</span><div class="progressWrapper"><span id="${download.id}BytesProgress" class="bytesProgress">${formatBytes(download.bytesReceived)}/${formatBytes(download.totalBytes)}</span><svg viewBox="0 0 36 36" class="circleWrapper">
  <path class="circle" id="${download.id}Circle"
    d="M18 2.0845
      a 15.9155 15.9155 0 0 1 0 31.831
      a 15.9155 15.9155 0 0 1 0 -31.831"
    stroke-dasharray="${Math.round((download.bytesReceived / download.totalBytes) * 100)}, 100"
  />
</svg></div>`;
                        let btnWrapper = document.createElement("div");
                        btnWrapper.classList.add("btnWrapperDownloading");
                        let btnPause = document.createElement("button");
                        btnPause.classList.add("pause");
                        if (download.state === "interrupted") {
                            btnPause.title = "Resume";
                            btnPause.innerHTML = "&#9654;";
                            btnPause.dataset.state = "resume";
                            btnPause.addEventListener("click", (event) => {
                                browser.downloads.resume(download.id);
                            });
                        } else {
                            btnPause.title = "Pause";
                            btnPause.innerHTML = "&#9208;";
                            btnPause.dataset.state = "pause";
                            btnPause.addEventListener("click", (event) => {
                                table.innerHTML = "";
                                browser.downloads.pause(download.id);
                            });
                        }
                        let btnCancel = document.createElement("button");
                        btnCancel.classList.add("cancel");
                        btnCancel.title = "Cancel";
                        btnCancel.innerHTML = "&#10539;";
                        btnCancel.addEventListener("click", (event) => {
                            browser.downloads.cancel(download.id).then(() => {
                                loadDownloads();
                            });
                        });
                        if (download.state === "in_progress") {
                            intervalId["id" + download.id] = setInterval(() => {
                                browser.runtime
                                    .sendMessage({
                                        type: "get-download",
                                        id: download.id,
                                    })
                                    .then((message) => {
                                        if (!message.download) {
                                            clearInterval(
                                                intervalId["id" + download.id]
                                            );
                                        }
                                        let download = JSON.parse(
                                            message.download
                                        );
                                        if (download.state === "complete") {
                                            clearInterval(
                                                intervalId["id" + download.id]
                                            );
                                        } else {
                                            document.getElementById(
                                                download.id + "BytesProgress"
                                            ).innerHTML =
                                                `${formatBytes(download.bytesReceived)}/${formatBytes(download.totalBytes)}`;
                                            document
                                                .getElementById(
                                                    download.id + "Circle"
                                                )
                                                .setAttribute(
                                                    "stroke-dasharray",
                                                    Math.round(
                                                        (download.bytesReceived /
                                                            download.totalBytes) *
                                                            100
                                                    ) + ", 100"
                                                );
                                        }
                                    });
                            }, 100);
                        }
                        btnWrapper.appendChild(btnCancel);
                        btnWrapper.appendChild(btnPause);
                        cell.appendChild(btnWrapper);
                    } else if (download.state === "interrupted") {
                        cell.innerHTML = `<span class="name${download.danger === "safe" ? "" : " danger"}">${filename}</span><span class="datetime">${formatDate(download.startTime)}</span><br><span class="cancelled">Download Cancelled</span><br>${getURLHTML(download.url)}`;
                        let btnWrapper = document.createElement("div");
                        btnWrapper.classList.add("btnWrapper");
                        let button = document.createElement("button");
                        button.classList.add("retry");
                        button.title = "Retry download";
                        button.innerHTML = "&#8634;";
                        button.addEventListener("click", (event) => {
                            let url = download.url;
                            browser.downloads
                                .erase({
                                    limit: 1,
                                    id: download.id,
                                })
                                .then(() => {
                                    browser.downloads
                                        .download({
                                            url: url,
                                        })
                                        .then(loadDownloads);
                                });
                        });
                        let eraseButton = document.createElement("button");
                        eraseButton.classList.add("erase");
                        eraseButton.title = "Remove from downloads";
                        eraseButton.innerHTML = "&#128465;";
                        eraseButton.addEventListener("click", (event) => {
                            browser.downloads.erase({
                                limit: 1,
                                id: download.id,
                            });
                        });
                        btnWrapper.appendChild(eraseButton);
                        btnWrapper.appendChild(button);
                        cell.appendChild(btnWrapper);
                    } else {
                        cell.innerHTML = `<span class="name${download.danger === "safe" ? "" : " danger"}">${filename}</span><span class="datetime">${formatDate(download.startTime)}</span><br><span class="size">${download.exists ? formatBytes(download.fileSize) : "File missing or moved"}</span>`;
                        if (values.mime) {
                            let mime = getMime(download);
                            if (mime) {
                                cell.innerHTML += `<br><span class="mime">${mime}</span>`;
                            }
                        }
                        cell.innerHTML += `<br>${getURLHTML(download.url)}`;
                        let btnWrapper = document.createElement("div");
                        btnWrapper.classList.add("btnWrapper");
                        let button = document.createElement("button");
                        button.classList.add("open");
                        button.title = "Open file";
                        button.innerHTML = "&#128640;";
                        button.addEventListener("click", (event) => {
                            browser.downloads.open(download.id);
                        });
                        let clearButton = document.createElement("button");
                        clearButton.classList.add("remove");
                        clearButton.title = "Remove from downloads";
                        clearButton.innerHTML = "&#10539;";
                        clearButton.addEventListener("click", (event) => {
                            browser.downloads.erase({
                                limit: 1,
                                id: download.id,
                            });
                        });
                        if (download.exists) {
                            let eraseButton = document.createElement("button");
                            eraseButton.classList.add("delete");
                            eraseButton.title = "Delete file";
                            eraseButton.innerHTML = "&#128465;";
                            eraseButton.addEventListener("click", (event) => {
                                browser.downloads.removeFile(download.id).then(
                                    () => {
                                        browser.downloads.erase({
                                            limit: 1,
                                            id: download.id,
                                        });
                                    },
                                    () => {
                                        browser.downloads.erase({
                                            limit: 1,
                                            id: download.id,
                                        });
                                    }
                                );
                            });
                            btnWrapper.appendChild(eraseButton);
                        }
                        btnWrapper.appendChild(clearButton);
                        btnWrapper.appendChild(button);
                        cell.appendChild(btnWrapper);
                    }
                    row.appendChild(cell);
                    table.appendChild(row);
                }
            }
        });
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

function getMime(download) {
    if (download.mime) return download.mime;
    if (download.filename.includes(".")) {
        return download.filename.split(".").pop();
    } else {
        return undefined;
    }
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
