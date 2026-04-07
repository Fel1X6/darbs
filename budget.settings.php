<?php
session_start();
if (!isset($_SESSION['usr']) || $_SESSION['usr'] == '') {
    header('Location: login.php');
    exit;
}
?>
<!DOCTYPE html>
<html translate="no">
<head>
  <?php include 'head.php'; ?>
  <link rel="stylesheet" href="css/budget/seaman_budget.css">
</head>
<body>

<div class="budget-page container-fluid">
  <div class="row">

    <div class="col-12 col-xl-3 mb-4">
      <div class="budget-panel sidebar-panel">
        <div class="panel-header dark-header">
          <span>Salary settings</span>
        </div>

        <div class="panel-body">

          <?php if ($_SESSION['usr_role'] == 'admin'): ?>
          <div class="form-group">
            <label class="budget-label" for="settings-company">Company</label>
            <select id="settings-company" class="form-control budget-select">
              <option value="">Select company</option>
            </select>
          </div>
          <?php endif; ?>

          <div class="form-group">
            <label class="budget-label" for="settings-vessel-type">Vessel type</label>
            <select id="settings-vessel-type" class="form-control budget-select">
              <option value="">Select vessel type</option>
            </select>
          </div>

          <div class="form-group">
            <label class="budget-label" for="settings-rank">Rank</label>
            <select id="settings-rank" class="form-control budget-select">
              <option value="">Select rank</option>
            </select>
          </div>

          <div class="sidebar-actions">
            <button class="btn budget-btn primary-btn" onclick="loadSalarySetting()">Load</button>
            <button class="btn budget-btn success-btn" onclick="saveSalarySetting()">Save</button>
            <button class="btn budget-btn light-btn" onclick="resetSalarySettingForm()">Reset</button>
          </div>
        </div>
      </div>
    </div>

    <div class="col-12 col-xl-9">
      <div class="row">

        <div class="col-12 col-lg-7 mb-4">
          <div class="budget-panel">
            <div class="panel-header blue-header">
              <span>Main salary fields</span>
            </div>

            <div class="panel-body">
              <div class="row">
                <div class="col-md-6 mb-3">
                  <label class="budget-label">Required on board</label>
                  <input type="number" id="required_on_board" class="form-control budget-input" value="1">
                </div>

                <div class="col-md-6 mb-3">
                  <label class="budget-label">Contract months</label>
                  <input type="number" id="contract_months" class="form-control budget-input" value="4">
                </div>

                <div class="col-md-6 mb-3">
                  <label class="budget-label">Base salary</label>
                  <input type="number" id="base_salary" class="form-control budget-input" value="0">
                </div>

                <div class="col-md-6 mb-3">
                  <label class="budget-label">Working days</label>
                  <input type="number" id="working_days" class="form-control budget-input" value="30">
                </div>

                <div class="col-md-6 mb-3">
                  <label class="budget-label">Daily rate</label>
                  <input type="number" id="daily_rate" class="form-control budget-input" value="0">
                </div>

                <div class="col-md-6 mb-3">
                  <label class="budget-label">Leave pay</label>
                  <input type="number" id="leave_pay" class="form-control budget-input" value="0">
                </div>

                <div class="col-md-6 mb-3">
                  <label class="budget-label">Employer cost</label>
                  <input type="number" id="employer_cost" class="form-control budget-input" value="0">
                </div>

                <div class="col-md-6 mb-3">
                  <label class="budget-label">Currency</label>
                  <select id="currency" class="form-control budget-select">
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="col-12 col-lg-5 mb-4">
          <div class="budget-panel">
            <div class="panel-header green-header">
              <span>Bonuses / additions</span>
            </div>

            <div class="panel-body">
              <div class="row">
                <div class="col-md-6 mb-3">
                  <label class="budget-label">Bonus</label>
                  <input type="number" id="bonus" class="form-control budget-input" value="0">
                </div>

                <div class="col-md-6 mb-3">
                  <label class="budget-label">Premium</label>
                  <input type="number" id="premium" class="form-control budget-input" value="0">
                </div>

                <div class="col-md-6 mb-3">
                  <label class="budget-label">Overtime</label>
                  <input type="number" id="overtime" class="form-control budget-input" value="0">
                </div>

                <div class="col-md-6 mb-3">
                  <label class="budget-label">Other additions</label>
                  <input type="number" id="other_additions" class="form-control budget-input" value="0">
                </div>

                <div class="col-md-6 mb-3">
                  <label class="budget-label">Deductions</label>
                  <input type="number" id="deductions" class="form-control budget-input" value="0">
                </div>

                <div class="col-md-6 mb-3">
                  <label class="budget-label">Active</label>
                  <select id="is_active" class="form-control budget-select">
                    <option value="1">Active</option>
                    <option value="0">Inactive</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>

  </div>
</div>

<script src="js/budget/budget.settings.js?v=<?= time(); ?>"></script>
</body>
</html>