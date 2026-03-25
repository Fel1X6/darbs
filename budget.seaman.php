<!DOCTYPE html>
<html translate="no">
<head>

   <?php 
   include 'head.php'; ?>
  <link rel="stylesheet" href="css/budget/seaman_budget.css">
</head>
<body>

<?php include 'nav.php'; ?>

<div class="budget-page container-fluid">
  <div class="row">

    <!-- LEFT SIDEBAR -->
    <div class="col-12 col-xl-3 mb-4">
      <div class="budget-panel sidebar-panel">
        <div class="panel-header dark-header">
          <span>Rank selection</span>
        </div>
          <div class="form-group">
            <label class="budget-label" for="budget-vessel">Vessel</label>
            <select id="budget-vessel" class="form-control budget-select">
              <option value="">Select vessel type</option>
              </select>
          </div>

        <div class="panel-body">
          <div class="form-group">
            <label class="budget-label" for="budget-rank">Rank</label>
            <select id="budget-rank" class="form-control budget-select">
              <option value="">Select rank</option>
            </select>
          </div>

          <div class="rank-info-box">
            <div class="info-row">
              <span class="info-name">Selected rank</span>
              <span class="info-value" id="selected-rank-label">—</span>
            </div>
            <div class="info-row">
              <span class="info-name">Required on board</span>
              <span class="info-value" id="rank-required-preview">0</span>
            </div>
            <div class="info-row">
              <span class="info-name">Already on board</span>
              <span class="info-value" id="rank-onboard-preview">0</span>
            </div>
            <div class="info-row">
              <span class="info-name">Contract months</span>
              <span class="info-value" id="rank-contract-preview">0</span>
            </div>
          </div>

          <div class="sidebar-actions">
            <button class="btn budget-btn primary-btn" onclick="calculateBudget()">Calculate</button>
            <button class="btn budget-btn success-btn">Save</button>
            <button class="btn budget-btn light-btn" onclick="resetBudgetForm()">Reset</button>
          </div>
        </div>
      </div>
    </div>

    <!-- MAIN -->
    <div class="col-12 col-xl-9">
      <div class="row">

        <!-- MAIN FIELDS -->
        <div class="col-12 col-lg-7 mb-4">
          <div class="budget-panel">
            <div class="panel-header blue-header">
              <span>Main calculation fields</span>
            </div>

            <div class="panel-body">
              <div class="row">
                <div class="col-md-6 mb-3">
                  <label class="budget-label">Required on board</label>
                  <input type="number" id="required_on_board" class="form-control budget-input calc-input" value="1">
                </div>

                <div class="col-md-6 mb-3">
                  <label class="budget-label">Already on board</label>
                  <input type="number" id="already_on_board" class="form-control budget-input calc-input" value="1">
                </div>

                <div class="col-md-6 mb-3">
                  <label class="budget-label">Contract months</label>
                  <input type="number" id="contract_months" class="form-control budget-input calc-input" value="4">
                </div>

                <div class="col-md-6 mb-3">
                  <label class="budget-label">Base salary</label>
                  <input type="number" id="base_salary" class="form-control budget-input calc-input" value="3500">
                </div>

                <div class="col-md-6 mb-3">
                  <label class="budget-label">Working days</label>
                  <input type="number" id="working_days" class="form-control budget-input calc-input" value="30">
                </div>

                <div class="col-md-6 mb-3">
                  <label class="budget-label">Daily rate</label>
                  <input type="number" id="daily_rate" class="form-control budget-input calc-input" value="0">
                </div>

                <div class="col-md-6 mb-3">
                  <label class="budget-label">Leave pay</label>
                  <input type="number" id="leave_pay" class="form-control budget-input calc-input" value="0">
                </div>

                <div class="col-md-6 mb-3">
                  <label class="budget-label">Employer cost</label>
                  <input type="number" id="employer_cost" class="form-control budget-input calc-input" value="0">
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- BONUS -->
        <div class="col-12 col-lg-5 mb-4">
          <div class="budget-panel">
            <div class="panel-header green-header">
              <span>Bonuses / premium / currency</span>
            </div>

            <div class="panel-body">
              <div class="row">
                <div class="col-md-6 mb-3">
                  <label class="budget-label">Bonus</label>
                  <input type="number" id="bonus" class="form-control budget-input calc-input" value="0">
                </div>

                <div class="col-md-6 mb-3">
                  <label class="budget-label">Premium</label>
                  <input type="number" id="premium" class="form-control budget-input calc-input" value="0">
                </div>

                <div class="col-md-6 mb-3">
                  <label class="budget-label">Overtime</label>
                  <input type="number" id="overtime" class="form-control budget-input calc-input" value="0">
                </div>

                <div class="col-md-6 mb-3">
                  <label class="budget-label">Other additions</label>
                  <input type="number" id="other_additions" class="form-control budget-input calc-input" value="0">
                </div>

                <div class="col-md-6 mb-3">
                  <label class="budget-label">Deductions</label>
                  <input type="number" id="deductions" class="form-control budget-input calc-input" value="0">
                </div>

                <div class="col-md-6 mb-3">
                  <label class="budget-label">Currency</label>
                  <select id="currency" class="form-control budget-select">
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                    <option value="GBP">GBP</option>
                  </select>
                </div>
              </div>

              <div class="totals-card">
                <div class="info-row">
                  <span class="info-name">Total additions</span>
                  <span class="info-value" id="total-additions">0.00</span>
                </div>
                <div class="info-row">
                  <span class="info-name">Total deductions</span>
                  <span class="info-value" id="total-deductions">0.00</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- PREVIEW -->
        <div class="col-12 mb-4">
          <div class="budget-panel">
            <div class="panel-header purple-header">
              <span>Calculation preview</span>
            </div>

            <div class="panel-body">
              <div class="preview-grid">
                <div class="preview-card">
                  <div class="preview-title">Monthly total</div>
                  <div class="preview-value" id="preview-monthly">0.00</div>
                  <div class="preview-note">Per one seaman</div>
                </div>

                <div class="preview-card">
                  <div class="preview-title">Contract total</div>
                  <div class="preview-value" id="preview-contract">0.00</div>
                  <div class="preview-note">For selected period</div>
                </div>

                <div class="preview-card">
                  <div class="preview-title">Crew total</div>
                  <div class="preview-value" id="preview-crew">0.00</div>
                  <div class="preview-note">For required crew count</div>
                </div>

                <div class="preview-card">
                  <div class="preview-title">Currency</div>
                  <div class="preview-value" id="preview-currency">USD</div>
                  <div class="preview-note">Selected currency</div>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>

  </div>
</div>

<script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
<script src="JS/budget.main.js"></script>

</body>
</html>