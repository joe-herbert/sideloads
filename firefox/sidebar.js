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
        document.getElementById("infoMime").classList.toggle("hide");
    });
    let fontSize = document.getElementById("fontSize");
    fontSize.addEventListener("change", () => {
        let size = parseInt(event.currentTarget.value) || 16;
        browser.storage.sync.set({ fontSize: size });
        document.body.style.fontSize = size + "px";
    });
    let titleLines = document.getElementById("titleLines");
    titleLines.addEventListener("change", () => {
        let lines = parseInt(event.currentTarget.value) || 2;
        browser.storage.sync.set({ titleLines: lines });
        document.querySelector(":root").style.setProperty("--titleLines", lines);
    });
    browser.storage.sync.get(["missing", "mime", "fontSize", "titleLines"], (values) => {
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
        if (values === undefined || values.fontSize === undefined) {
            browser.storage.sync.set({ fontSize: 16 });
            values.fontSize = 16;
        }
        fontSize.value = values.fontSize;
        document.body.style.fontSize = values.fontSize + "px";
        if (values === undefined || values.titleLines === undefined) {
            browser.storage.sync.set({ titleLines: 2 });
            values.titleLines = 2;
        }
        titleLines.value = values.titleLines;
        document.querySelector(":root").style.setProperty("--titleLines", values.titleLines);
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
                    let filename = download.filename.substring(download.filename.lastIndexOf("/") + 1);
                    let row = document.createElement("tr");
                    let cell = document.createElement("td");
                    cell.dataset.id = download.id;
                    if (download.state === "in_progress" || (download.state === "interrupted" && download.paused && download.canResume)) {
                        let btnWrapper = document.createElement("div");
                        btnWrapper.classList.add("btnWrapperDownloading");
                        let btnPause = document.createElement("button");
                        btnPause.classList.add("pause");
                        if (download.state === "interrupted") {
                            btnPause.title = "Resume";
                            btnPause.innerHTML = "&#9654;";
                            btnPause.dataset.state = "resume";
                            btnPause.addEventListener("click", (event) => {
                                event.stopPropagation();
                                browser.downloads.resume(download.id);
                                if (parseInt(document.getElementById("infoWrapper").dataset.id) === download.id) {
                                    clearInterval(intervalId["id" + download.id]);
                                    setTimeout(() => {
                                        cellClicked(cell, true);
                                    }, 100);
                                }
                            });
                        } else {
                            btnPause.title = "Pause";
                            btnPause.innerHTML = "&#9208;";
                            btnPause.dataset.state = "pause";
                            btnPause.addEventListener("click", (event) => {
                                event.stopPropagation();
                                table.innerHTML = "";
                                browser.downloads.pause(download.id);
                                if (parseInt(document.getElementById("infoWrapper").dataset.id) === download.id) {
                                    clearInterval(intervalId["id" + download.id]);
                                    setTimeout(() => {
                                        cellClicked(cell, true);
                                    }, 100);
                                }
                            });
                        }
                        let btnCancel = document.createElement("button");
                        btnCancel.classList.add("cancel");
                        btnCancel.title = "Cancel";
                        btnCancel.innerHTML = "&#10539;";
                        btnCancel.addEventListener("click", (event) => {
                            event.stopPropagation();
                            browser.downloads.cancel(download.id).then(() => {
                                loadDownloads();
                            });
                            if (parseInt(document.getElementById("infoWrapper").dataset.id) === download.id) {
                                clearInterval(intervalId["id" + download.id]);
                                setTimeout(() => {
                                    cellClicked(cell, true);
                                }, 100);
                            }
                        });
                        cell.innerHTML += `<span class="name${download.danger === "safe" ? "" : " cancelled"}">${filename}</span><div class="progressWrapper"><span id="bytesProgress${download.id}" class="bytesProgress">${formatBytes(download.bytesReceived)}/${formatBytes(download.totalBytes)}</span><svg viewBox="0 0 36 36" class="circleWrapper">
  <path class="circle" id="${download.id}Circle"
    d="M18 2.0845
      a 15.9155 15.9155 0 0 1 0 31.831
      a 15.9155 15.9155 0 0 1 0 -31.831"
    stroke-dasharray="${Math.round((download.bytesReceived / download.totalBytes) * 100)}, 100"
  />
</svg></div>`;
                        btnWrapper.appendChild(btnCancel);
                        btnWrapper.appendChild(btnPause);
                        cell.appendChild(btnWrapper);
                        cell.addEventListener("click", (event) => {
                            cellClicked(event.currentTarget);
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
                                            clearInterval(intervalId["id" + download.id]);
                                        }
                                        let download = JSON.parse(message.download);
                                        if (download.state === "complete") {
                                            clearInterval(intervalId["id" + download.id]);
                                        } else {
                                            document.getElementById("bytesProgress" + download.id).innerHTML = `${formatBytes(download.bytesReceived)}/${formatBytes(download.totalBytes)}`;
                                            document
                                                .getElementById(download.id + "Circle")
                                                .setAttribute("stroke-dasharray", Math.round((download.bytesReceived / download.totalBytes) * 100) + ", 100");
                                        }
                                    });
                            }, 100);
                        }
                    } else if (download.state === "interrupted") {
                        cell.innerHTML = `<span class="datetime cancelled">Interrupted</span>`;
                        let btnWrapper = document.createElement("div");
                        btnWrapper.classList.add("btnWrapper");
                        let button = document.createElement("button");
                        button.classList.add("retry");
                        button.title = "Retry download";
                        button.innerHTML = "&#8634;";
                        button.addEventListener("click", (event) => {
                            event.stopPropagation();
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
                            if (parseInt(document.getElementById("infoWrapper").dataset.id) === download.id) {
                                clearInterval(intervalId["id" + download.id]);
                                setTimeout(() => {
                                    cellClicked(cell, true);
                                }, 100);
                            }
                        });
                        let eraseButton = document.createElement("button");
                        eraseButton.classList.add("erase");
                        eraseButton.title = "Remove from downloads";
                        eraseButton.innerHTML = "&#128465;";
                        eraseButton.addEventListener("click", (event) => {
                            event.stopPropagation();
                            browser.downloads.erase({
                                limit: 1,
                                id: download.id,
                            });
                            document.getElementById("infoWrapper").classList.add("hide");
                        });
                        cell.innerHTML += `<span class="name${download.danger === "safe" ? "" : " cancelled"}">${filename}</span>`;
                        btnWrapper.appendChild(eraseButton);
                        btnWrapper.appendChild(button);
                        cell.appendChild(btnWrapper);
                        cell.addEventListener("click", (event) => {
                            cellClicked(event.currentTarget);
                        });
                    } else {
                        cell.innerHTML = `<span class="datetime${download.exists ? "" : " cancelled"}">${download.exists ? formatDate(download.startTime) : "Missing"}</span>`;
                        let btnWrapper = document.createElement("div");
                        btnWrapper.classList.add("btnWrapper");
                        let button = document.createElement("button");
                        button.classList.add("open");
                        button.title = "Open file";
                        button.innerHTML = "&#128640;";
                        button.addEventListener("click", (event) => {
                            event.stopPropagation();
                            browser.downloads.open(download.id).catch((err) => {
                                let span = cell.querySelector(".datetime");
                                span.innerText = "Missing";
                                span.title = "Likely moved or deleted";
                                span.classList.add("cancelled");
                                btnWrapper.removeChild(button);
                            });
                        });
                        let clearButton = document.createElement("button");
                        clearButton.classList.add("remove");
                        clearButton.title = "Remove from downloads";
                        clearButton.innerHTML = "&#10539;";
                        clearButton.addEventListener("click", (event) => {
                            event.stopPropagation();
                            browser.downloads.erase({
                                limit: 1,
                                id: download.id,
                            });
                            document.getElementById("infoWrapper").classList.add("hide");
                        });
                        cell.innerHTML += `<span class="name${download.danger === "safe" ? "" : " cancelled"}">${filename}</span>`;
                        btnWrapper.appendChild(clearButton);
                        btnWrapper.appendChild(button);
                        cell.appendChild(btnWrapper);
                        cell.addEventListener("click", (event) => {
                            cellClicked(event.currentTarget);
                        });
                    }
                    row.appendChild(cell);
                    table.appendChild(row);
                }
            }
        });
    }
}

function cellClicked(cell, forceShow, id) {
    if (id) {
        cell = document.querySelector(`#tableWrapper td[data-id='${id}']`);
    }
    document.getElementById("infoName").classList.remove("cancelled");
    document.getElementById("infoInterrupted").classList.add("hide");
    if (cell && cell.dataset.id) {
        browser.runtime
            .sendMessage({
                type: "get-download",
                id: parseInt(cell.dataset.id),
            })
            .then((message) => {
                if (message.download) {
                    clearInterval(intervalId.info);
                    let download = JSON.parse(message.download);
                    let infoWrapper = document.getElementById("infoWrapper");
                    if (parseInt(infoWrapper.dataset.id) === download.id && !forceShow) {
                        infoWrapper.classList.add("hide");
                        infoWrapper.dataset.id = "";
                    } else {
                        let liveCell = document.querySelector(`#tableWrapper td[data-id='${cell.dataset.id}']`);
                        let nextSiblingId = liveCell
                            ? liveCell.parentElement.nextElementSibling
                                ? liveCell.parentElement.nextElementSibling.children[0].dataset.id
                                : liveCell.parentElement.previousElementSibling
                                  ? liveCell.parentElement.previousElementSibling.children[0].dataset.id
                                  : null
                            : null;
                        infoWrapper.dataset.id = download.id;
                        if (download.state === "in_progress" || (download.state === "interrupted" && download.paused && download.canResume)) {
                            //download in progress or paused
                            let name = document.getElementById("infoName");
                            if (download.danger !== "safe") name.classList.add("cancelled");
                            name.innerText = download.filename.substring(download.filename.lastIndexOf("/") + 1);
                            let infoPath = document.getElementById("infoPath");
                            infoPath.innerText = download.filename.substring(0, download.filename.lastIndexOf("/") + 1);
                            infoPath.title = undefined;
                            infoPath.classList.remove("cancelled");
                            document.getElementById("infoTime").innerText = formatDate(download.estimatedEndTime || download.startTime, true);
                            document.getElementById("infoSize").innerText = "";
                            let m = document.getElementById("infoMime");
                            m.innerText = getMime(download);
                            browser.storage.sync.get(["mime"], (values) => {
                                if (values === undefined || values.mime === undefined) {
                                    browser.storage.sync.set({ mime: false });
                                    values = {
                                        mime: false,
                                    };
                                }
                                if (values.mime) {
                                    m.classList.remove("hide");
                                } else {
                                    m.classList.add("hide");
                                }
                            });
                            let url = document.getElementById("infoURL");
                            let urlData = getURL(download.url);
                            if (urlData) {
                                url.classList.remove("hide");
                                url.href = urlData.href;
                                url.innerText = urlData.text;
                            } else {
                                url.classList.add("hide");
                            }
                            document.getElementById("infoProgressWrapper").innerHTML =
                                `<span id="infoBytesProgress" class="bytesProgress">${formatBytes(download.bytesReceived)}/${formatBytes(download.totalBytes)}</span><svg viewBox="0 0 36 36" class="circleWrapper">
  <path class="circle" id="infoCircle"
    d="M18 2.0845
      a 15.9155 15.9155 0 0 1 0 31.831
      a 15.9155 15.9155 0 0 1 0 -31.831"
    stroke-dasharray="${Math.round((download.bytesReceived / download.totalBytes) * 100)}, 100"
  />
</svg>`;
                            if (download.state === "in_progress") {
                                intervalId.info = setInterval(() => {
                                    browser.runtime
                                        .sendMessage({
                                            type: "get-download",
                                            id: download.id,
                                        })
                                        .then((message) => {
                                            if (!message.download) {
                                                clearInterval(intervalId.info);
                                            }
                                            let download = JSON.parse(message.download);
                                            if (download.state === "complete") {
                                                clearInterval(intervalId.info);
                                                cellClicked(cell, true);
                                            } else {
                                                document.getElementById("infoBytesProgress").innerHTML = `${formatBytes(download.bytesReceived)}/${formatBytes(download.totalBytes)}`;
                                                document.getElementById("infoCircle").setAttribute("stroke-dasharray", Math.round((download.bytesReceived / download.totalBytes) * 100) + ", 100");
                                            }
                                        });
                                }, 100);
                            }
                            let btnWrapper = document.getElementById("infoButtons");
                            btnWrapper.innerHTML = "";
                            let btnPause = document.createElement("button");
                            btnPause.classList.add("pause");
                            if (download.state === "interrupted") {
                                btnPause.title = "Resume";
                                btnPause.innerHTML = "&#9654;";
                                btnPause.dataset.state = "resume";
                                btnPause.addEventListener("click", (event) => {
                                    event.stopPropagation();
                                    browser.downloads.resume(download.id);
                                    clearInterval(intervalId["id" + download.id]);
                                    setTimeout(() => {
                                        cellClicked(cell, true);
                                    }, 100);
                                });
                            } else {
                                btnPause.title = "Pause";
                                btnPause.innerHTML = "&#9208;";
                                btnPause.dataset.state = "pause";
                                btnPause.addEventListener("click", (event) => {
                                    event.stopPropagation();
                                    table.innerHTML = "";
                                    browser.downloads.pause(download.id);
                                    clearInterval(intervalId["id" + download.id]);
                                    setTimeout(() => {
                                        cellClicked(cell, true);
                                    }, 100);
                                });
                            }
                            let btnCancel = document.createElement("button");
                            btnCancel.classList.add("cancel");
                            btnCancel.title = "Cancel";
                            btnCancel.innerHTML = "&#10539;";
                            btnCancel.addEventListener("click", (event) => {
                                event.stopPropagation();
                                browser.downloads.cancel(download.id).then(() => {
                                    loadDownloads();
                                });
                                clearInterval(intervalId["id" + download.id]);
                                setTimeout(() => {
                                    cellClicked(cell, true);
                                }, 100);
                            });
                            btnWrapper.appendChild(btnCancel);
                            btnWrapper.appendChild(btnPause);
                        } else if (download.state === "interrupted") {
                            //download failed
                            let name = document.getElementById("infoName");
                            name.innerText = download.filename.substring(download.filename.lastIndexOf("/") + 1);
                            document.getElementById("infoInterrupted").classList.remove("hide");
                            document.getElementById("infoTime").innerText = formatDate(download.startTime, true);
                            let m = document.getElementById("infoMime");
                            m.innerText = getMime(download);
                            browser.storage.sync.get(["mime"], (values) => {
                                if (values === undefined || values.mime === undefined) {
                                    browser.storage.sync.set({ mime: false });
                                    values = {
                                        mime: false,
                                    };
                                }
                                if (values.mime) {
                                    m.classList.remove("hide");
                                } else {
                                    m.classList.add("hide");
                                }
                            });
                            let url = document.getElementById("infoURL");
                            let urlData = getURL(download.url);
                            if (urlData) {
                                url.classList.remove("hide");
                                url.href = urlData.href;
                                url.innerText = urlData.text;
                            } else {
                                url.classList.add("hide");
                            }
                            document.getElementById("infoProgressWrapper").innerHTML = "";
                            let btnWrapper = document.getElementById("infoButtons");
                            btnWrapper.innerHTML = "";
                            let button = document.createElement("button");
                            button.classList.add("retry");
                            button.title = "Retry download";
                            button.innerHTML = "&#8634;";
                            button.addEventListener("click", (event) => {
                                event.stopPropagation();
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
                                clearInterval(intervalId["id" + download.id]);
                                setTimeout(() => {
                                    cellClicked(cell, true);
                                }, 100);
                            });
                            let eraseButton = document.createElement("button");
                            eraseButton.classList.add("erase");
                            eraseButton.title = "Remove from downloads";
                            eraseButton.innerHTML = "&#128465;";
                            eraseButton.addEventListener("click", (event) => {
                                event.stopPropagation();
                                browser.downloads.erase({
                                    limit: 1,
                                    id: download.id,
                                });
                                document.getElementById("infoWrapper").classList.add("hide");
                            });
                            btnWrapper.appendChild(eraseButton);
                            btnWrapper.appendChild(button);
                        } else {
                            //download complete
                            let name = document.getElementById("infoName");
                            if (download.danger !== "safe") name.classList.add("cancelled");
                            name.innerText = download.filename.substring(download.filename.lastIndexOf("/") + 1);
                            let infoPath = document.getElementById("infoPath");
                            infoPath.innerText = download.filename.substring(0, download.filename.lastIndexOf("/") + 1);
                            infoPath.title = undefined;
                            infoPath.classList.remove("cancelled");
                            document.getElementById("infoTime").innerText = formatDate(download.startTime, true);
                            document.getElementById("infoSize").innerText = formatBytes(download.fileSize);
                            let m = document.getElementById("infoMime");
                            m.innerText = getMime(download);
                            browser.storage.sync.get(["mime"], (values) => {
                                if (values === undefined || values.mime === undefined) {
                                    browser.storage.sync.set({ mime: false });
                                    values = {
                                        mime: false,
                                    };
                                }
                                if (values.mime) {
                                    m.classList.remove("hide");
                                } else {
                                    m.classList.add("hide");
                                }
                            });
                            let url = document.getElementById("infoURL");
                            let urlData = getURL(download.url);
                            if (urlData) {
                                url.classList.remove("hide");
                                url.href = urlData.href;
                                url.innerText = urlData.text;
                            } else {
                                url.classList.add("hide");
                            }
                            document.getElementById("infoProgressWrapper").innerHTML = "";
                            let btnWrapper = document.getElementById("infoButtons");
                            btnWrapper.innerHTML = "";
                            let button = document.createElement("button");
                            button.classList.add("open");
                            button.title = "Open file";
                            button.innerHTML = "&#128640;";
                            button.addEventListener("click", (event) => {
                                browser.downloads.open(download.id).catch((err) => {
                                    let infoPath = document.getElementById("infoPath");
                                    infoPath.innerText = "Missing";
                                    infoPath.title = "Likely moved or deleted";
                                    infoPath.classList.add("cancelled");
                                    btnWrapper.removeChild(button);
                                });
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
                                setTimeout(() => {
                                    cellClicked(null, false, nextSiblingId);
                                }, 100);
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
                                            setTimeout(() => {
                                                cellClicked(null, false, nextSiblingId);
                                            }, 100);
                                        },
                                        () => {
                                            browser.downloads.erase({
                                                limit: 1,
                                                id: download.id,
                                            });
                                            setTimeout(() => {
                                                cellClicked(null, false, nextSiblingId);
                                            }, 100);
                                        }
                                    );
                                });
                                btnWrapper.appendChild(eraseButton);
                            }
                            btnWrapper.appendChild(clearButton);
                            btnWrapper.appendChild(button);
                        }
                        infoWrapper.classList.remove("hide");
                    }
                }
            });
    } else {
        document.getElementById("infoWrapper").classList.add("hide");
    }
}

function formatBytes(bytes, decimals = 2) {
    if (!+bytes) return "0 Bytes";

    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ["Bytes", "KiB", "MiB", "GiB", "TiB", "PiB", "EiB", "ZiB", "YiB"];

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

function formatDate(date, full = false) {
    let today = new Date();
    let d = new Date(date);
    if (today.getDate() === d.getDate() && today.getMonth() === d.getMonth() && today.getFullYear() === d.getFullYear()) {
        return `${full ? "Today " : ""}${("0" + d.getHours()).substr(-2)}:${("0" + d.getMinutes()).substr(-2)}`;
    } else if (browser.i18n.getUILanguage() === "en-US") {
        return `${d.getMonth() + 1}/${d.getDate()}/${d.getFullYear()}${full ? " " + ("0" + d.getHours()).substr(-2) + ":" + ("0" + d.getMinutes()).substr(-2) : ""}`;
    } else {
        return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}${full ? " " + ("0" + d.getHours()).substr(-2) + ":" + ("0" + d.getMinutes()).substr(-2) : ""}`;
    }
}

function getURL(url) {
    let u = new URL(url);
    if (url.substring(0, 5) === "blob:") {
        if (u.origin) {
            u = new URL(u.origin);
            return { href: u.href, text: u.hostname };
        } else {
            return null;
        }
    } else {
        return { href: url, text: u.hostname };
    }
}

function handleError(error) {
    console.error("Error: ", error);
}
