window.onload = function () {
    var params = new URLSearchParams(location.search);
    if (params.get("onboard")) {
        var remove = document.getElementsByClassName("removeForOnboard");
        let i = 0;
        while (remove.length > i) {
            var el = remove.item(i);
            if (el.id === `addOnLink-${params.get("browser")}`) {
                i++;
            } else {
                el.parentElement.removeChild(el);
            }
        }
        var thankYou = document.createElement("span");
        thankYou.id = "thankYou";
        thankYou.classList.add("purple");
        thankYou.innerText =
            "Thanks for downloading! Enjoy some clarity in life";
        document
            .getElementById("container1")
            .insertBefore(
                thankYou,
                document.getElementsByTagName("h2")[0].nextElementSibling
            );
        document.getElementById("container1").style.height = "auto!important";
        document.getElementById(`addOnLink-${params.get("browser")}`).innerText =
            "Give us a rating";
    }
};
