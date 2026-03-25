<?php
session_start();
if (!isset($pageTitle)) $pageTitle = 'Budget System';
?>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
<title><?= htmlspecialchars($pageTitle) ?></title>

<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css">
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/twitter-bootstrap/4.6.2/css/bootstrap.min.css">
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/mdbootstrap/4.20.0/css/mdb.min.css">
<link rel="stylesheet" href="css/nav.css?v=<?= time(); ?>">


<!-- js Plugins -->
 <script src="Assets/Functionality/sweetalert2.min.js"></script>

<style>
 
</style>