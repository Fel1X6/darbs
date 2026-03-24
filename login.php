<?php
session_start();

if (isset($_SESSION['usr']) && $_SESSION['usr'] != '') {
    header('Location: budget.seaman.php');
    exit;
}

$errorText = '';
if (isset($_GET['error']) && $_GET['error'] == '1') {
    $errorText = 'Incorrect username or password';
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, shrink-to-fit=no">
  <meta name="robots" content="noindex">
  <title>Budget System - Login</title>

  <link rel="stylesheet" href="Design/MDB/bootstrap/bootstrap-custom.min.css">
  <link rel="stylesheet" href="Design/MDB/css/mdb-custom.min.css">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css">
  <link rel="stylesheet" href="Css/login/login.css?v=<?= time(); ?>">
</head>
<body class="login-page">

  <div class="login-background">
    <div class="bg-circle bg-circle-1"></div>
    <div class="bg-circle bg-circle-2"></div>
    <div class="bg-circle bg-circle-3"></div>
  </div>

  <div class="login-wrapper">
    <div class="login-box">

      <div class="login-left">
        <div class="login-brand">
          <div class="login-brand-icon">
            <i class="fas fa-ship"></i>
          </div>
          <div>
            <div class="login-brand-title">Budget System</div>
            <div class="login-brand-subtitle">Crew Planning Platform</div>
          </div>
        </div>

        <div class="login-left-content">
          <h1 class="login-title">Crew budget planning and calculation</h1>
          <p class="login-description">
            Manage vessel crew budgeting, salaries, bonuses and
            calculation preview in one clear and convenient web system.
          </p>

          <div class="login-info-list">
            <div class="login-info-item">
              <i class="fas fa-check-circle"></i>
              <span>Simple and clear calculations</span>
            </div>
            <div class="login-info-item">
              <i class="fas fa-check-circle"></i>
              <span>Convenient structure for daily work</span>
            </div>
            <div class="login-info-item">
              <i class="fas fa-check-circle"></i>
              <span>Prepared for future database integration</span>
            </div>
          </div>
        </div>
      </div>

      <div class="login-right">
        <div class="login-card">
          <div class="login-card-icon">
            <i class="fas fa-user-circle"></i>
          </div>

          <h2 class="login-card-title">Sign in</h2>
          <p class="login-card-text">Enter your account details to continue</p>

          <?php if ($errorText != ''): ?>
            <div class="alert alert-danger py-2 px-3 mb-4">
              <?= htmlspecialchars($errorText) ?>
            </div>
          <?php endif; ?>

          <form action="login_auth.php" method="post" autocomplete="off">
            <div class="form-group mb-3">
              <label class="login-label" for="login-username">Username</label>
              <div class="login-input-wrap">
                <i class="fas fa-user"></i>
                <input
                  type="text"
                  class="form-control login-input"
                  id="login-username"
                  name="username"
                  placeholder="Enter username"
                  required
                >
              </div>
            </div>

            <div class="form-group mb-4">
              <label class="login-label" for="login-password">Password</label>
              <div class="login-input-wrap">
                <i class="fas fa-lock"></i>
                <input
                  type="password"
                  class="form-control login-input"
                  id="login-password"
                  name="password"
                  placeholder="Enter password"
                  required
                >
              </div>
            </div>

            <button type="submit" class="btn login-btn btn-block">
              Log in
            </button>
          </form>

          <div class="login-footer-text">
            Budget System • Qualification project by Antons Sivacevs
          </div>
        </div>
      </div>

    </div>
  </div>

</body>
</html>