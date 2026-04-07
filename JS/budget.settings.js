var current_guid = '';

(function($){
  $(document).ready(function(){
    initLoad();
  });
})(jQuery);

function initLoad(){
  if($('#settings-company').length > 0){
    loadCompanies();
  }

  loadVesselTypes();
  loadRankList();
  resetSetting();
}

function loadCompanies(){
  $.ajax({
    type: 'POST',
    url: 'function_call.php?f=222',
    data: {'fName': 'loadCompanies', 'mi': {}},
    dataType: 'json',
    cache: false,
    error: function (error) {if (!JSON.stringify(error).includes('Session ended!')) alert(JSON.stringify(error)); else CallPulse();},
    success: function (d) {
      ht = '<option value="">Select company</option>';

      if(d.answer == 'ok'){
        for(let i = 0; i < d.companies.length; i++){
          company = d.companies[i];
          ht += '<option value="'+company.guid+'">'+company.company_name+'</option>';
        }
      }

      $('#settings-company').html(ht).val('');
    }
  });
}

function loadVesselTypes(){
  $.ajax({
    type: 'POST',
    url: 'function_call.php?f=222',
    data: {'fName': 'loadVesselTypes', 'mi': {}},
    dataType: 'json',
    cache: false,
    error: function (error) {if (!JSON.stringify(error).includes('Session ended!')) alert(JSON.stringify(error)); else CallPulse();},
    success: function (d) {
      ht = '<option value="">Select vessel type</option>';

      if(d.answer == 'ok'){
        for(let i = 0; i < d.vessel_types.length; i++){
          vessel_type = d.vessel_types[i];
          ht += '<option value="'+vessel_type.vessel_type+'">'+vessel_type.vessel_type+'</option>';
        }
      }

      $('#settings-vessel-type').html(ht).val('');
    }
  });
}

function loadRankList(){
  $.ajax({
    type: 'POST',
    url: 'function_call.php?f=222',
    data: {'fName': 'loadRankList', 'mi': {}},
    dataType: 'json',
    cache: false,
    error: function (error) {if (!JSON.stringify(error).includes('Session ended!')) alert(JSON.stringify(error)); else CallPulse();},
    success: function (d) {
      ht = '<option value="">Select rank</option>';

      if(d.answer == 'ok'){
        for(let i = 0; i < d.ranks.length; i++){
          rank = d.ranks[i];
          ht += '<option value="'+rank.id+'">'+rank.rank_name+'</option>';
        }
      }

      $('#settings-rank').html(ht).val('');
    }
  });
}

function loadSetting(){
  mi = {};

  if($('#settings-company').length > 0){
    mi['company_guid'] = $('#settings-company').val();
  }

  mi['vessel_type'] = $('#settings-vessel-type').val();
  mi['rank_id'] = $('#settings-rank').val();

  $.ajax({
    type: 'POST',
    url: 'function_call.php?f=222',
    data: {'fName': 'getSetting', 'mi': mi},
    dataType: 'json',
    cache: false,
    error: function (error) {if (!JSON.stringify(error).includes('Session ended!')) alert(JSON.stringify(error)); else CallPulse();},
    success: function (d) {
      resetSalarySettingForm();

      if(d.answer == 'ok'){
        setting = d.setting;
        current_guid = setting.guid;

        $('#required_on_board').val(setting.required_on_board);
        $('#contract_months').val(setting.contract_months);
        $('#base_salary').val(setting.base_salary);
        $('#working_days').val(setting.working_days);
        $('#daily_rate').val(setting.daily_rate);
        $('#leave_pay').val(setting.leave_pay);
        $('#employer_cost').val(setting.employer_cost);
        $('#bonus').val(setting.bonus);
        $('#premium').val(setting.premium);
        $('#overtime').val(setting.overtime);
        $('#other_additions').val(setting.other_amount);
        $('#deductions').val(setting.deductions);
        $('#currency').val(setting.currency);
        $('#is_active').val(setting.is_active);
      }
    }
  });
}

function saveSetting(){
  mi = {};
  mi['setting']={};

  mi.setting.guid = current_guid;

  if($('#settings-company').length > 0){
    mi.setting.company_guid = $('#settings-company').val();
  }

  mi.setting.vessel_type = $('#settings-vessel-type').val();
  mi['rank_id'] = $('#settings-rank').val();

  mi.setting.required_on_board = $('#required_on_board').val();
  mi.setting.contract_months = $('#contract_months').val();
  mi.setting.base_salary = $('#base_salary').val();
  mi.setting.working_days = $('#working_days').val();
  mi.setting.daily_rate = $('#daily_rate').val();
  mi.setting.leave_pay = $('#leave_pay').val();
  mi.setting.employer_cost = $('#employer_cost').val();
  mi.setting.bonus = $('#bonus').val();
  mi.setting.premium = $('#premium').val();
  mi.setting.overtime = $('#overtime').val();
  mi.setting.other_amount = $('#other_additions').val();
  mi.setting.deductions = $('#deductions').val();
  mi.setting.currency = $('#currency').val();
  mi.setting.is_active = $('#is_active').val();

  $.ajax({
    type: 'POST',
    url: 'function_call.php?f=222',
    data: {'fName': 'saveSetting', 'mi': mi},
    dataType: 'json',
    cache: false,
    error: function (error) {if (!JSON.stringify(error).includes('Session ended!')) alert(JSON.stringify(error)); else CallPulse();},
    success: function (d) {
      if(d.answer == 'ok'){
        current_guid = d.guid;
        alert('Saved');
      }
    }
  });
}

function resetSetting(){
  current_guid = '';

  $('#required_on_board').val(0);
  $('#contract_months').val(0);
  $('#base_salary').val(0);
  $('#working_days').val(0);
  $('#daily_rate').val(0);
  $('#leave_pay').val(0);
  $('#employer_cost').val(0);
  $('#bonus').val(0);
  $('#premium').val(0);
  $('#overtime').val(0);
  $('#other_additions').val(0);
  $('#deductions').val(0);
  $('#currency').val('USD');
  $('#is_active').val('1');
}