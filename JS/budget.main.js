var vessels = [];
var ranks = [];

(function($){
  $(document).ready(function(){
    initBudgetSeaman();
  });
})(jQuery);


function initBudgetSeaman(){
  initLoadBudget();
  calculateBudget();

  $('#budget-vessel').change(function(){
    loadRanks();
  });

  $('#budget-rank').change(function(){
    loadRankData();
  });

  $('.calc-input').on('input', function(){
    calculateBudget();
  });
}

function initLoadBudget(){
  $.ajax({
    type: 'POST',
    url: 'ServerSide/budgetJSON.php',
    data: {'fName': 'loadVessels', 'mi': {}},
    dataType: 'json',
    cache: false,
    error: function (error) {if (!JSON.stringify(error).includes('Session ended!')) alert(JSON.stringify(error)); else CallPulse();},
    success: function (d) {

      ht = '<option value="">Select vessel</option>';
      if(d.answer == 'ok'){
        for(let i = 0; i < d.vessels.length; i++){
          let vessel = d.vessels[i];
          ht += '<option value="'+vessel.guid+'">'+vessel.vessel_name+'</option>';
        }
      }
      $('#budget-vessel').html(ht).val('');
    }
  });
}

function loadRanks(){
   mi = {};
  mi['vessel_guid'] = $('#budget-vessel').val();

  $('#budget-rank').html('<option value="">Select rank</option>').val('');

  $('#selected-rank-label').text('Not selected');

  $('#required_on_board').val(1);
  $('#already_on_board').val(1);
  $('#contract_months').val(4);

  $('#rank-required-preview').text('1');
  $('#rank-onboard-preview').text('1');
  $('#rank-contract-preview').text('4');

  if(mi['vessel_guid'] == ''){
    calculateBudget();
    return;
  }

  $.ajax({
    type: 'POST',
    url: 'ServerSide/budgetJSON.php',
    data: {'fName': 'loadRanks', 'mi': mi},
    dataType: 'json',
    cache: false,
    error: function (error) {if (!JSON.stringify(error).includes('Session ended!')) alert(JSON.stringify(error)); else CallPulse();},
    success: function (d) {
       ht = '<option value="">Select rank</option>';

      if(d.answer == 'ok'){
        ranks = d.ranks;

        for( i = 0; i < d.ranks.length; i++){
           rank = d.ranks[i];
          ht += '<option value="'+rank.guid+'">'+rank.rank_name+'</option>';
        }
      }

      $('#budget-rank').html(ht).val('');
      calculateBudget();
    }
  });
}


function loadRankData(){
  mi = {};
  mi['guid'] = $('#budget-rank').val();

  $.ajax({
    type: 'POST',
    url: 'ServerSide/budgetJSON.php',
    data: {'fName': 'loadRankData', 'mi': mi},
    dataType: 'json',
    cache: false,
    error: function (error) {if (!JSON.stringify(error).includes('Session ended!')) alert(JSON.stringify(error)); else CallPulse();},
    success: function (d) {
      if(d.answer == 'ok') {
        rank = d.rank;

        $('#required_on_board').val(rank.required_on_board);
        $('#contract_months').val(rank.contract_months);
        $('#base_salary').val(rank.base_salary);
        $('#working_days').val(rank.working_days);
        $('#daily_rate').val(rank.daily_rate);
        $('#leave_pay').val(rank.leave_pay);
        $('#employer_cost').val(rank.employer_cost);
        $('#bonus').val(rank.bonus);
        $('#premium').val(rank.premium);
        $('#overtime').val(rank.overtime);
        $('#other_additions').val(rank.other_additions);
        $('#deductions').val(rank.deductions);
        $('#currency').val(rank.currency);

        $('#selected-rank-label').text(rank.rank_name);
        calculateBudget();
      }
    }
  });
}

function num(id){
  return parseFloat($(id).val()) || 0;
}

function calculateBudget(){
  required = num('#required_on_board');
  onboard = num('#already_on_board');
  months = num('#contract_months');

  baseSalary = num('#base_salary');
  dailyRate = num('#daily_rate');
  workingDays = num('#working_days');
  leavePay = num('#leave_pay');
  employerCost = num('#employer_cost');

  bonus = num('#bonus');
  premium = num('#premium');
  overtime = num('#overtime');
  otherAdditions = num('#other_additions');

  deductions = num('#deductions');
  currency = $('#currency').val();

  totalWage = baseSalary + (dailyRate * workingDays) + leavePay + employerCost;
  grossWage = totalWage + bonus + premium + overtime + otherAdditions - deductions;
  contractTotal = grossWage * months;
  crewTotal = grossWage * required;

  $('#total-additions').text((bonus + premium + overtime + otherAdditions).toFixed(2));
  $('#total-deductions').text(deductions.toFixed(2));

  $('#preview-monthly').text(grossWage.toFixed(2) + ' ' + currency);
  $('#preview-contract').text(contractTotal.toFixed(2) + ' ' + currency);
  $('#preview-crew').text(crewTotal.toFixed(2) + ' ' + currency);
  $('#preview-currency').text(currency);

  $('#rank-required-preview').text(required);
  $('#rank-onboard-preview').text(onboard);
  $('#rank-contract-preview').text(months);
}


function resetBudgetForm(){
  $('#budget-vessel').val('');
  $('#budget-rank').html('<option value="">Select rank</option>');

  $('#required_on_board').val(1);
  $('#already_on_board').val(1);
  $('#contract_months').val(4);

  $('#base_salary').val(3500);
  $('#working_days').val(30);
  $('#daily_rate').val(0);
  $('#leave_pay').val(0);
  $('#employer_cost').val(0);

  $('#bonus').val(0);
  $('#premium').val(0);
  $('#overtime').val(0);
  $('#other_additions').val(0);

  $('#deductions').val(0);
  $('#currency').val('USD');

  $('#selected-rank-label').text('Not selected');
  $('#rank-required-preview').text('0');
  $('#rank-onboard-preview').text($('#already_on_board').val());
  $('#rank-contract-preview').text('0');

  calculateBudget();
}
