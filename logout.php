<?php
session_start();
include('ServerSide/cnf.php');
include('ServerSide/core.php');

logoutUser();
header('Location: login.php');
exit;