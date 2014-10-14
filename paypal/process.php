<?php
session_start();
include_once("config_paypal.php");
include_once("MyPayPal.php");
header('Access-Control-Allow-Origin: *');

header('Access-Control-Allow-Methods: GET, POST');

header("Access-Control-Allow-Headers: X-Requested-With");

if($_POST) //Post Data received from product list page.
{
    
	  	
		   
		$ItemTotalPrice = $_POST["amount"]; //(Item Price x Quantity = Total) Get total amount of product;		
	  
    //Data to be sent to paypal
    $padata =   '&CURRENCYCODE='.urlencode($PayPalCurrencyCode).
                '&PAYMENTACTION=Sale'.
                '&ALLOWNOTE=1'.
                '&PAYMENTREQUEST_0_CURRENCYCODE='.urlencode($PayPalCurrencyCode).
                '&PAYMENTREQUEST_0_AMT='.urlencode($ItemTotalPrice).
                '&PAYMENTREQUEST_0_ITEMAMT='.urlencode($ItemTotalPrice).
                //'&L_PAYMENTREQUEST_0_QTY0=1'.
                '&L_PAYMENTREQUEST_0_AMT0='.urlencode($ItemTotalPrice).//'&L_PAYMENTREQUEST_0_AMT0='.urlencode($ItemPrice).
                '&L_PAYMENTREQUEST_0_NAME0='.urlencode("Servicio de Estacionamiento Urbano").
                //'&L_PAYMENTREQUEST_0_NUMBER0='.urlencode($numberOfCopies).
                '&AMT='.urlencode($ItemTotalPrice).
                '&RETURNURL='.urlencode($PayPalReturnURL ).
                '&CANCELURL='.urlencode($PayPalCancelURL);

        //We need to execute the "SetExpressCheckOut" method to obtain paypal token
        $paypal= new MyPayPal();
        $httpParsedResponseAr = $paypal->PPHttpPost('SetExpressCheckout', $padata, $PayPalApiUsername, $PayPalApiPassword, $PayPalApiSignature, $PayPalMode);

        //Respond according to message we receive from Paypal
        if("SUCCESS" == strtoupper($httpParsedResponseAr["ACK"]) || "SUCCESSWITHWARNING" == strtoupper($httpParsedResponseAr["ACK"]))
        {

                // If successful set some session variable we need later when user is redirected back to page from paypal.
                //$_SESSION['itemprice'] =  $ItemPrice;
                //$_SESSION['totalamount'] = $ItemTotalPrice;
                //$_SESSION['itemName'] =  $ItemName;
                //$_SESSION['itemNo'] =  $ItemNumber;
                //$_SESSION['itemQTY'] =  $ItemQty;

                if($PayPalMode=='sandbox')
                {
                    $paypalmode     =   '.sandbox';
                }
                else
                {
                    $paypalmode     =   '';
                }
                //Redirect user to PayPal store with Token received.
                //$paypalurl ='https://www'.$paypalmode.'.paypal.com/cgi-bin/webscr?cmd=_express-checkout-mobile&token='.$httpParsedResponseAr["TOKEN"].'';
                //header('Location: '.$paypalurl);
                echo $httpParsedResponseAr["TOKEN"];

        }else{
            //Show error message
            echo '<div style="color:red"><b>Error : </b>'.urldecode($httpParsedResponseAr["L_LONGMESSAGE0"]).'</div>';
            echo '<pre>';
            print_r($httpParsedResponseAr);
            echo '</pre>';
        }

}


//Paypal redirects back to this page using ReturnURL, We should receive TOKEN and Payer ID
if(isset($_GET["token"]) )
{
    //we will be using these two variables to execute the "DoExpressCheckoutPayment"
    //Note: we haven't received any payment yet.

    $token = $_GET["token"];
	//echo "el token es = " . $token;
    $playerid = $_GET["PayerID"];
	//echo "el payID es = " . $playerid ;
    $padata =   '&TOKEN='.urlencode($token);
    
    $paypal_object = new MyPayPal();
    $httpParsedResponseGetDetails = $paypal_object->PPHttpPost('GetExpressCheckoutDetails', $padata, $PayPalApiUsername, $PayPalApiPassword, $PayPalApiSignature, $PayPalMode);
      
	//print_r($httpParsedResponseGetDetails);
	//echo " "$httpParsedResponseGetDetails['PAYMENTREQUEST_0_AMT'];
	$payment_request = urldecode($httpParsedResponseGetDetails['PAYMENTREQUEST_0_AMT']);
	//echo "el resultado de amount  es: ".$payment_request ;
	
	
	//$paypal_transactionid = urldecode($httpParsedResponseGetDetails['PAYMENTINFO_0_TRANSACTIONID']);
	//echo "el resultado de transaction  es: ".$paypal_transactionid ;
	

    //if("SUCCESS" == strtoupper($httpParsedResponseGetDetails["ACK"]) 
     //   || "SUCCESSWITHWARNING" == strtoupper($httpParsedResponseGetDetails["ACK"])
        //&&  ( "" !== $httpParsedResponseGetDetails["PAYMENTREQUEST_0_SHIPTOSTREET"] || 
         //      "" !== $httpParsedResponseGetDetails["PAYMENTREQUEST_0_SHIPTOSTREET2"] ) 
       // )
    //{
    
      //$playerid = $httpParsedResponseGetDetails["PAYERID"];
  
      $padata =   '&TOKEN='.urlencode($token).
                  '&PAYMENTACTION='.urlencode("SALE").
                  '&PAYERID='.urlencode($playerid).
				  '&PAYMENTREQUEST_0_AMT='.urlencode($payment_request).
				  '&PAYMENTREQUEST_0_CURRENCYCODE=EUR';
                          
                         
      //We need to execute the "DoExpressCheckoutPayment" at this point to Receive payment from user.
      $paypal= new MyPayPal();
      $httpParsedResponseAr = $paypal->PPHttpPost('DoExpressCheckoutPayment', $padata, $PayPalApiUsername, $PayPalApiPassword, $PayPalApiSignature, $PayPalMode);                  

		
	 //print_r ($httpParsedResponseAr);
		
      //Check if everything went ok..
      if("SUCCESS" == strtoupper($httpParsedResponseAr["ACK"]) || "SUCCESSWITHWARNING" == strtoupper($httpParsedResponseAr["ACK"]))
      {
              //echo '<h2>Success</h2>';
              //echo 'Your Transaction ID :'.urldecode($httpParsedResponseAr['PAYMENTINFO_0_TRANSACTIONID']);
  
                  /*
                  //Sometimes Payment are kept pending even when transaction is complete.
                  //because of Currency change, user choose other payment option or its pending review etc.
                  //hence we need to notify user about it and ask him manually approve the transiction
                  
  
                  if('Completed' == $httpParsedResponseAr["PAYMENTSTATUS"])
                  {
                      echo '<div style="color:green">Payment Received! Your product will be sent to you very soon!</div>';
                  }
                  elseif('Pending' == $httpParsedResponseAr["PAYMENTSTATUS"])
                  {
                      echo '<div style="color:red">Transaction Complete, but payment is still pending! You need to manually authorize this payment in your <a target="_new" href="http://www.paypal.com">Paypal Account</a></div>';
                  }
  					*/
             
			  echo "
								 	
					<html>
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
                  $transactionID = urlencode($httpParsedResponseAr['PAYMENTINFO_0_TRANSACTIONID']);
                  $nvpStr = "&TRANSACTIONID=".$transactionID;
                  $paypal= new MyPayPal();
                  $httpParsedResponseAr = $paypal->PPHttpPost('GetTransactionDetails', $nvpStr, $PayPalApiUsername, $PayPalApiPassword, $PayPalApiSignature, $PayPalMode);
  
                  if("SUCCESS" == strtoupper($httpParsedResponseAr["ACK"]) || "SUCCESSWITHWARNING" == strtoupper($httpParsedResponseAr["ACK"])) {
  
                      /*
                      #### SAVE BUYER INFORMATION IN DATABASE ###
                      $buyerName = $httpParsedResponseAr["FIRSTNAME"].' '.$httpParsedResponseAr["LASTNAME"];
                      $buyerEmail = $httpParsedResponseAr["EMAIL"];
                      $paymentStatus = $httpParsedResponseAr["PAYMENTSTATUS"];
  
                      $conn = mysql_connect("localhost","MySQLUsername","MySQLPassword");
                      if (!$conn)
                      {
                       die('Could not connect: ' . mysql_error());
                      }
  
                      mysql_select_db("Database_Name", $conn);
  
                      mysql_query("INSERT INTO BuyerTable
                      (BuyerName,BuyerEmail,TransactionID,ItemName,ItemNumber, ItemAmount,ItemQTY,PaymentStatus)
                      VALUES
                      ('$buyerName','$buyerEmail','$transactionID','$ItemName',$ItemNumber, $ItemTotalPrice,$ItemQTY,$paymentStatus)");
  
                      mysql_close($con);
                      */
  
                      //echo '<pre>';
                      //print_r($httpParsedResponseAr);
                      //echo '</pre>';
                  } else  {
                      echo '<div style="color:red"><b>GetTransactionDetails failed:</b>'.urldecode($httpParsedResponseAr["L_LONGMESSAGE0"]).'</div>';
                      echo '<pre>';
                      print_r($httpParsedResponseAr);
                      echo '</pre>';
  
                  }
        
    }else{
            echo '<div style="color:red"><b>Error : </b>'.urldecode($httpParsedResponseAr["L_LONGMESSAGE0"]).'</div>';
            echo '<pre>';
            print_r($httpParsedResponseAr);
            echo '</pre>';
    }
}
?>