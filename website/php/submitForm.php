<?php
$config = include('config.php');

// Create connection
$conn = new mysqli($config['host'], $config['username'], $config['password']);

// Check connection
if ($conn->connect_error) {
	die("Connection failed: " . $conn->connect_error);
}

$reason = trim($_REQUEST["reason"]);
$browser = urldecode($_REQUEST["browser"]);

$sql = "INSERT INTO `joeherbe_extensions`.`uninstallFeedback` (`reason`, `browser`, `extension`) VALUES ('$reason', '$browser', 'sideloads')";
if ($conn->query($sql) === TRUE) {
	echo "Success";
} else {
	echo "Error: " . $sql . "<br>" . $conn->error;
}
?>
