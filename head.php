<?php
if (!isset($pageTitle)) $pageTitle = 'Budget System';
?>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
<title><?= htmlspecialchars($pageTitle) ?></title>

<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css">
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/twitter-bootstrap/4.6.2/css/bootstrap.min.css">
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/mdbootstrap/4.20.0/css/mdb.min.css">

<style>
  body {
    background: #ffffff;
  }

  .ui-fullscreen-block {
    min-height: calc(100vh - 30px);
    border-radius: 12px;
    border: 1px solid #ddd;
    background: #fff;
  }

  .ui-card {
    background: #ffffff;
    border: 1px solid #bf50e0;
    border-radius: 12px;
  }

  .ui-card__title {
    padding: 12px 16px;
    color: #154ce6;
    border-radius: 12px 12px 0 0;
  }

  .ui-card__title h3 {
    margin: 0;
    font-size: 18px;
    font-weight: 600;
  }

  .left-sidebar__main {
    min-height: 100vh;
  }

  .left-sidebar__container {
    max-width: 100%;
  }

  .no-sidebar__content {
    padding: 15px;
  }

  .navbar-brand {
    font-weight: 600;
  }
</style>