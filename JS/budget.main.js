var exchangeRate = 1;
var exchangeRateReady = true;
var exchangeRateDate = '';

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
  $('#currency').change(function(){
  updateExchangeRate();
  });

  $('#display_currency').change(function(){
  updateExchangeRate();
  });

}

function initLoadBudget(){
  $.ajax({
    type: 'POST',
    url: 'function_call.php?f=111',
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
    url: 'function_call.php?f=111',
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
    url: 'function_call.php?f=111',
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
        $('#display_currency').val(rank.currency);
        updateExchangeRate();
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

  baseCurrency = $('#currency').val();
  displayCurrency = $('#display_currency').val();
  if(baseCurrency == ''){
    baseCurrency = 'USD';
  }
  if(displayCurrency == ''){
    displayCurrency = baseCurrency;
  }

  totalWage = baseSalary + (dailyRate * workingDays) + leavePay + employerCost;
  grossWage = totalWage + bonus + premium + overtime + otherAdditions - deductions;
  contractTotal = grossWage * months;
  crewTotal = grossWage * required;

  $('#total-additions').text((bonus + premium + overtime + otherAdditions).toFixed(2));
  $('#total-deductions').text(deductions.toFixed(2));

  if(exchangeRateReady){
    previewMonthly = grossWage * exchangeRate;
    previewContract = contractTotal * exchangeRate;
    previewCrew = crewTotal * exchangeRate;

    $('#preview-monthly').text(previewMonthly.toFixed(2) + ' ' + displayCurrency);
    $('#preview-contract').text(previewContract.toFixed(2) + ' ' + displayCurrency);
    $('#preview-crew').text(previewCrew.toFixed(2) + '' + displayCurrency);
    $('#preview-currency').text(displayCurrency);
  } else {
    $('#preview-monthly').text('—');
    $('#preview-contract').text('—');
    $('#preview-crew').text('—');
    $('#preview-currency').text(displayCurrency);
  }

  $('#rank-required-preview').text(required);
  $('#rank-onboard-preview').text(onboard);
  $('#rank-contract-preview').text(months);

  renderExchangeInfo();
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
  $('#display_currency').val('USD');
  exchangeRate = 1;
  exchangeRateReady = true;
  exchangeRateDate = '';
  renderExchangeInfo();

  calculateBudget();
}

function resetBudget(){
  Swal.fire({
    title: 'Reset form?',
    text: 'All current values will be returned to default.',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Yes, reset',
    cancelButtonText: 'Cancel',
    reverseButtons: true
  }).then((result) => {
    if(result.isConfirmed){
      resetBudgetForm();

      Swal.fire({
        title: 'Success',
        text: 'The form has been restored.',
        icon: 'success',
        timer: 1400,
        showConfirmButton: false
      });
    }
  });
}



function updateExchangeRate(){
  baseCurrency = $('#currency').val();
  displayCurrency = $('#display_currency').val();

  if(baseCurrency == ''){
    baseCurrency = 'USD';
    $('#currency').val('USD');
  }

  if(displayCurrency == ''){
    displayCurrency = baseCurrency;
    $('#display_currency').val(baseCurrency);
  }

  if(baseCurrency == displayCurrency){
    exchangeRate = 1;
    exchangeRateReady = true;
    exchangeRateDate = '';
    calculateBudget();
    return;
  }

  $.ajax({
    type: 'POST',
    url: 'function_call.php?f=111',
    data: {
      'fName': 'loadExchangeRate',
      'mi': {
        'base_currency': baseCurrency,
        'quote_currency': displayCurrency
      }
    },
    dataType: 'json',
    cache: false,
    error: function(error){
      exchangeRate = 1;
      exchangeRateReady = false;
      exchangeRateDate = '';
      calculateBudget();

      if(!JSON.stringify(error).includes('Session ended!')){
        alert(JSON.stringify(error));
      } else {
        CallPulse();
      }
    },
    success: function(d){
      if(d.answer == 'ok'){
        exchangeRate = parseFloat(d.rate);
        if(!exchangeRate){
          exchangeRate = 1;
        }

        exchangeRateReady = true;
        exchangeRateDate = d.rate_date;
      } else {
        exchangeRate = 1;
        exchangeRateReady = false;
        exchangeRateDate = '';
      }

      calculateBudget();
    }
  });
}

function renderExchangeInfo(){
  baseCurrency = $('#currency').val();
  displayCurrency = $('#display_currency').val();

  if(baseCurrency == ''){
    baseCurrency = 'USD';
  }

  if(displayCurrency == ''){
    displayCurrency = baseCurrency;
  }

  if(baseCurrency == displayCurrency){
    $('#exchange-rate').text('1 ' + baseCurrency + ' = 1 ' + displayCurrency);
    $('#exchange-rate-date').text('Same currency');
    return;
  }

  if(exchangeRateReady){
    $('#exchange-rate').text('1 ' + baseCurrency + ' = ' + parseFloat(exchangeRate).toFixed(4) + ' ' + displayCurrency);
    $('#exchange-rate-date').text(exchangeRateDate);
  } else {
    $('#exchange-rate').text('Rate unavailable');
    $('#exchange-rate-date').text('—');
  }
}