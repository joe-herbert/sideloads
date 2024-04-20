function submitForm(form) {
    document.getElementById("btnSubmit").style.display = "none";
    document.getElementById("formSubmitSpinner").style.display = "block";
    var checkedRadio = form.querySelector("input[type='radio'][name='reason']:checked");
    if (checkedRadio) {
        var str = "reason=" + (checkedRadio.value == "other" ? form.otherReason.value : checkedRadio.value) + "&browser=" + encodeURIComponent(navigator.userAgent);
        var xhttp;
        if (window.XMLHttpRequest) {
            xhttp = new XMLHttpRequest();
        } else {
            xhttp = new ActiveXObject("Microsoft.XMLHTTP");
        }
        xhttp.onreadystatechange = function() {
            if (this.readyState == 4 && this.status == 200) {
                document.getElementById("btnSubmit").style.display = "inline-block";
                document.getElementById("formSubmitSpinner").style.display = "none";
                if (this.responseText == "Success") {
                    console.log(this.responseText);
                    //success
                } else {
                    console.error(this.responseText);
                    //error
                }
            } else {
                console.log(this.readyState + ", " + this.status);
            }
        };
        xhttp.open("POST", "./php/submitForm.php", true);
        xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
        xhttp.send(str);
    } else {
        //no radio selected when submit pressed
    }
}


function reasonChange() {
    if (document.getElementById("other").checked) {
        document.getElementById("otherReasonTextArea").style.display = "block";
    } else {
        document.getElementById("otherReasonTextArea").style.display = "none";
    }
}