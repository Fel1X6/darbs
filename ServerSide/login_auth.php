<?php
session_start();

if (!isset($_POST['username']) || !isset($_POST['password'])) {
    header('Location: login.php?error=1');
    exit;
}

$username = trim($_POST['username']);
$password = $_POST['password'];

/*
  ВРЕМЕННЫЙ ЛОГИН БЕЗ БАЗЫ
  Потом заменим на проверку из MySQL
*/
$demo_user = 'admin';
$demo_pass = 'admin123';

if ($username === $demo_user && $password === $demo_pass) {
    session_regenerate_id(true);

    $_SESSION['usr'] = 'demo-user';
    $_SESSION['usr_name'] = 'Demo User';
    $_SESSION['username'] = 'admin';

    $_SESSION['sys'] = 'FM';
    $_SESSION['sys_title'] = 'Budget System';
    $_SESSION['usr_set'] = array(
        'lang' => 'en'
    );
    $_SESSION['my_vessel'] = '0';

    header('Location: budget.seaman.php');
    exit;
}

header('Location: login.php?error=1');
exit;