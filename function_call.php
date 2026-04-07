<?php
if(isset($_GET['f'])){
  if($_GET['f']=='111')require_once("ServerSide/budgetJSON.php");
  if($_GET['f']=='222')require_once("ServerSide/budgetSettingJSON.php");

 
}

?>