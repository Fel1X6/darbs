<?php
include('cnf.php');
include('core.php');

$conn = ConnectDB();

if($conn){
  echo 'ok';
}else{
  echo 'error';
}
?>