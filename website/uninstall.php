<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Sideloads Uninstalled</title>
    <link rel="stylesheet" href="css/uninstall.css">
    <script src="js/uninstall.js"></script>
</head>

<body>
    <h1>You've successfully uninstalled Sideloads 😞</h1>
    <h2>Take a second to let us know why you uninstalled:</h2>
    <div id="formDiv">
        <form action="#" onsubmit="submitForm(this);return false">
            <input type="radio" name="reason" id="didntwork" value="didntwork" onchange="reasonChange()"><label for="didntwork">It didn't work</label><br>
            <input type="radio" name="reason" id="didntuseoften" value="didntuseoften" onchange="reasonChange()"><label for="didntuseoften">I didn't use it often enough</label><br>
            <input type="radio" name="reason" id="didntlikelook" value="didntlikelook" onchange="reasonChange()"><label for="didntlikelook">I didn't like how it looked</label><br>
            <input type="radio" name="reason" value="other" id="other" onchange="reasonChange()"><label for="other">Other</label><br>
            <br>
            <textarea name="otherReason" id="otherReasonTextArea"></textarea>
            <br>
            <div class="g-recaptcha noselect" data-sitekey="6LdOuz4UAAAAAKBihCnSs9GiF5woEiPglOpx4pFK" data-callback="captchaDone" data-expired-callback="captchaExpired"></div>
            <button id="btnSubmit" type="submit">
                <i class="fa fa-paper-plane"></i> Submit
            </button>
            <div id="formSubmitSpinner">
                <svg class="spinner" width="50px" height="50px" viewBox="0 0 66 66" xmlns="http://www.w3.org/2000/svg">
                    <circle class="path" fill="none" stroke-width="6" stroke-linecap="round" cx="33" cy="33" r="30"></circle>
                </svg>
            </div>
            <div id="formSubmitDone">
                <svg id="Layer_1" style="enable-background:new 0 0 612 792;" version="1.1" viewBox="0 0 612 792" xml:space="preserve" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
                    <style type="text/css">
                        .st0 {
                            fill: #41AD49;
                        }
                    </style>
                    <g>
                        <path class="st0" d="M562,396c0-141.4-114.6-256-256-256S50,254.6,50,396s114.6,256,256,256S562,537.4,562,396L562,396z    M501.7,296.3l-241,241l0,0l-17.2,17.2L110.3,421.3l58.8-58.8l74.5,74.5l199.4-199.4L501.7,296.3L501.7,296.3z" />
                    </g>
                </svg>
            </div>
        </form>
    </div>
    <div>
        Didn't mean to uninstall? Reinstall for <a href="https://addons.mozilla.org/en-GB/firefox/addon/sideloads/" target="_blank">firefox</a><!-- or <a href="CHROME LINK" target="_blank">chrome</a>-->.
    </div>
</body>

</html>
