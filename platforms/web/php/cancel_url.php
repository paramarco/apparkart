<?php
session_start();
include_once("config_paypal.php");
include_once("MyPayPal.php");
header('Access-Control-Allow-Origin: *');

header('Access-Control-Allow-Methods: GET, POST');

header("Access-Control-Allow-Headers: X-Requested-With");

 echo "			<html>
					<head>
					<script>
					function closeBrowser(){
						window.location.href = '/mobile/close';
					}
					</script>
					</head>
					 <body onload='closeBrowser();'>
					 		
					 </body>
					</html>
  				";
?>