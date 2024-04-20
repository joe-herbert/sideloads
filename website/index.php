<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <title>Sideloads</title>
    <link rel="stylesheet" href="css/index.css">
    <script src="js/index.js"></script>
</head>

<body>
    <div id="container1" class="centered">
        <h1>
            <img src="imgs/logo.svg" alt="Sideloads" class="logo">
            <h2>See your downloads in the sidebar.</h2>
        </h1>
        <br>
        <a href="https://addons.mozilla.org/en-GB/firefox/addon/sideloads/" target="_blank" class="removeForOnboard" id="addOnLink-firefox">Get it for Firefox</a>
        <!--<a href="CHROME LINK" target="_blank" class="removeForOnboard" id="addOnLink-chrome">Get it for Chrome</a>--><br>
        <a href="#container2" id="more">More Info</a>
    </div>
    <div id="container2">
        <h3>How to use:</h3>
        <ol>
            <li class="removeForOnboard"><a href="https://addons.mozilla.org/en-GB/firefox/addon/sideloads/" target="_blank">Get it for Firefox</a><!-- or <a href="CHROME LINK" target="_blank">for Chrome</a>--></li>
            <li>Use the shortcut Ctrl+Alt+D or open the sidebar and select Sideloads from the top drop down menu</li>
            <li>Download something from any webpage and you'll see it appear in Sideloads. If you don't, hit the refresh button</li>
            <li>You can use the buttons which appear when the download finishes to open the file, remove it from the downloads list or delete it from your computer</li>
        </ol>
        <h3>Feedback and bug reporting:</h3>
        Please take a moment to leave a review or rating!<br><br>
        <a href="https://addons.mozilla.org/en-GB/firefox/addon/sideloads/" target="_blank" class="addOnLink">Firefox</a>
        <!--<a href="CHROME LINK" target="_blank" class="addOnLink">Chrome</a>--><br>
        If you've found a bug, let me know with an email to <a href="mailto:joe@joeherbert.dev?subject=Sideloads">joe@joeherbert.dev</a> with the subject "Sideloads". Please be descriptive and detailed!<br><br>
        <div class="centered">
            Thanks for visiting!<br>
            <span id="joeHerbertLink">
                <a href="https://joeherbert.dev" target="_blank">
                    <i class="hover-text-indigo">J</i>
                    <i class="hover-text-purple">o</i>
                    <i class="hover-text-yellow">e</i>&#160;
                    <i class="hover-text-red">H</i>
                    <i class="hover-text-light-blue">e</i><i class="hover-text-indigo">r</i>
                    <i class="hover-text-purple">b</i>
                    <i class="hover-text-yellow">e</i>
                    <i class="hover-text-red">r</i>
                    <i class="hover-text-light-blue">t</i>
                </a> &copy; <?php echo date("Y");?>
            </span>
        </div>
    </div>
</body>

</html>
