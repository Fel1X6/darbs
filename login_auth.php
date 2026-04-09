<?php
session_start();
include('ServerSide/cnf.php');
include('ServerSide/core.php');

$username = trim($_POST['username'] ?? '');
$password = $_POST['password'] ?? '';

if($username == '' || $password == ''){
  header('Location: login.php?error=1');
  exit;
}

$user = checkLoginPassword($username, $password);

if($user == false){
  header('Location: login.php?error=1');
  exit;
}

loginUser($user);

header('Location: budget.seaman.php');
exit;