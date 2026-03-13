var dynamic_to_remove=[];
var templates = [];
var preview_template = null;

(function($){
    $(document).ready(function(){

      budget_loadRanks();
      form_state("disabled");
      $('#budget-seaman-edit').prop('disabled',true);
      initSalaryControls();
    })
})(jQuery);


function budget_loadRanks(){
  $.ajax({
    type:'POST',
    url:'function_call.php?f=132',
    data:{'fName':'loadRanks'},
    cache:false,
    error:function(error){if(!JSON.stringify(error).includes('Session ended!'))alert(JSON.stringify(error)); else CallPulse();},
    beforeSend:function(){ShowLoader();},
    complete:function(){HideLoader();},
    success:function(d){
      templates=d.templates;

      tr='';
      for(i=0;i<d.ranks.length;i++){
        tr+="<tr class='rank-item cursor-hand'>";
        tr+="<td hidden class='rank-item-id'>"+d['ranks'][i].id+"</td>";
        tr+="<td class='rank-item-rank'>"+d['ranks'][i].rank+"</td>";
        tr+="</tr>";
      }
      $('#budget-seaman-available-ranks-list').html(tr);

      tr='';
      for(i=0;i<d.budget.length;i++){
        tr+=rowBudget(d['budget'][i]);
      }
      $('#budget-seaman-edited-ranks-list').html(tr);

      opt='<option value="-1">'+dict.not_selected+'</option>';
      for(i=0;i<templates.length;i++){
        opt+='<option value="'+templates[i].template_id+'">'+templates[i].template_title+'</option>';
      }
      mdbUpdateSelectContent('budget-seaman-template',opt);


      initRanksControl();
      countTotalCrews();

    }
  });
}
function rowBudget(values){
  r="<tr class='budget-item cursor-hand'>";
  r+="<td hidden class='budget-item-id'>"+values['id']+"</td>";
  r+="<td hidden class='budget-item-rank-id'>"+values['rank_id']+"</td>";
  r+="<td class='budget-item-rank'>"+values['rank']+"</td>";
  r+="<td class='budget-item-rob'>"+values['rob']+"</td>";
  r+="<td class='budget-item-on-board'>"+values['count']+"</td>";
  r+="<td class='budget-item-crew-list ui-hover text-center text-middle' ><i class=\"bi bi-people\"></i></td>";
  r+="</tr>";

  return r;
}
function initRanksControl(){
  $('.rank-item').unbind().click(function(){
    selectedItem($(this));
    budget_loadRankBudget($(this).find('.rank-item-id').text(),$(this).find('.rank-item-rank').text());
  });

  $('.budget-item td').not('.budget-item-crew-list').unbind().dblclick(function(){
    selectedItem($(this).closest('tr'));
    budget_loadRankBudget($(this).closest('tr').find('.budget-item-rank-id').text(),$(this).closest('tr').find('.budget-item-rank').text());
  });

  $('.budget-item-crew-list').unbind().click(function(){
    rank=$(this).closest('tr').find(".budget-item-rank").text();
    $.ajax({
      type:'POST',
      url:'function_call.php?f=132',
      data:{'fName':'loadRankCrewList','rank_id':$(this).closest('tr').find('.budget-item-rank-id').text()},
      cache:false,
      error:function(error){if(!JSON.stringify(error).includes('Session ended!'))alert(JSON.stringify(error)); else CallPulse();},
      beforeSend:function(){ShowLoader();},
      complete:function(){HideLoader();},
      success:function(d){
        tr='';
        for(i=0;i<d.length;i++){
          tr+="<tr>";
          tr+="<td>"+d[i].name_surname+"</td>";
          tr+="</tr>";
        }
        $('#budget-seaman-crew-list-list').html(tr);
        $('#budget-seaman-crew-list-title').html(rank);
        $('#budget-seaman-crew-list-modal').modal("show");
      }
    });
  });
}

function budget_loadRankBudget(rank_id,rank){
  $.ajax({
    type:'POST',
    url:'function_call.php?f=132',
    data:{'fName':'loadRankBudget','rank_id':rank_id},
    cache:false,
    error:function(error){if(!JSON.stringify(error).includes('Session ended!'))alert(JSON.stringify(error)); else CallPulse();},
    beforeSend:function(){ShowLoader();},
    complete:function(){HideLoader();},
    success:function(d){
      form_state('disabled');
      dynamic_to_remove=[];
      if(d['id']=='new'){
        $('#budget-seaman-title').html(dict['add_new_rank_position_value'].replace('@value',rank));
      }
      else
        $('#budget-seaman-title').html(dict['rank_position_value'].replace('@value',rank));

      $('#budget-seaman-save').val(d['id']);
      $('#budget-seaman-save').attr('data-current-rank-id',rank_id);
      $('#budget-seaman-save').attr('data-current-rank',rank);

      $('#budget-seaman-required-on-board').val(d['rob']);
      $('#budget-seaman-already-on-board').val(d['count']);
      $('#budget-seaman-contract-duration').val(d['contract_duration']);

      $('#budget-seaman-salary-basic').val(d['basic']);
      $('#budget-seaman-salary-sick-wage').val(d['sick_wage']);
      $('#budget-seaman-salary-leave-sub').val(d['leave_sub']);
      $('#budget-seaman-salary-leave-days').val(d['leave_day_pay_d']);
      $('#budget-seaman-salary-leave-pay').val(d['leave_day_pay']);
      $('#budget-seaman-salary-ot-fixed').val(d['ot_fixed']);
      $('#budget-seaman-salary-ot-guaranted').val(d['ot_guaranted']);
      $('#budget-seaman-salary-ot-rate').val(d['ot_rate_hrs']);

      $('#budget-seaman-bonus-non-recharge').val(d['non_recharge']);
      $('#budget-seaman-bonus-fleet').val(d['fleet']);
      $('#budget-seaman-bonus-loyalty').val(d['loyalty']);
      $('#budget-seaman-bonus-recharge').val(d['recharge']);
      $('#budget-seaman-bonus-tanker').val(d['tanker']);
      $('#budget-seaman-bonus-rejoining').val(d['rejoin_bonus']);
      $('#budget-seaman-bonus-seniority').val(d['seniority']);
      if(d.fees != '1') d.fees='0';
      $('#budget-seaman-fees').prop('checked',cIntToBool(d.fees));

      income_list='';deduction_list='';
      for(i=0;i<d.dynamic.length;i++){
        if(d.dynamic[i].inc_ded == '1')
          income_list+=rowDynamicSalary(d.dynamic[i]);
        else deduction_list+=rowDynamicSalary(d.dynamic[i]);
      }
      $('#income-list').html(income_list);
      $('#deduction-list').html(deduction_list);

      calculateTotal();
    }
  });
}

function budget_saveRankBudget(){
  error=0;
  mi={};
  mi['id']=$('#budget-seaman-save').val();
  mi['rank_id']=$('#budget-seaman-save').attr('data-current-rank-id');
  mi['rob']=$('#budget-seaman-required-on-board').val();
  mi['contract_duration']=$('#budget-seaman-contract-duration').val();
  mi['basic']=$('#budget-seaman-salary-basic').val();
  mi['sick_wage']=$('#budget-seaman-salary-sick-wage').val();
  mi['leave_sub']=$('#budget-seaman-salary-leave-sub').val();
  mi['leave_day_pay_d']=$('#budget-seaman-salary-leave-days').val();
  mi['leave_day_pay']=$('#budget-seaman-salary-leave-pay').val();
  mi['ot_fixed']=$('#budget-seaman-salary-ot-fixed').val();
  mi['ot_guaranted']=$('#budget-seaman-salary-ot-guaranted').val();
  mi['ot_rate_hrs']=$('#budget-seaman-salary-ot-rate').val();
  mi['total_wage']=$('#budget-seaman-salary-total-wage').val();

  mi['non_recharge']=$('#budget-seaman-bonus-non-recharge').val();
  mi['fleet']=$('#budget-seaman-bonus-fleet').val();
  mi['loyalty']=$('#budget-seaman-bonus-loyalty').val();
  mi['recharge']=$('#budget-seaman-bonus-recharge').val();
  mi['tanker']=$('#budget-seaman-bonus-tanker').val();
  mi['rejoin_bonus']=$('#budget-seaman-bonus-rejoining').val();
  mi['seniority']=$('#budget-seaman-bonus-seniority').val();
  mi['fees']=cBoolToInt($('#budget-seaman-fees').prop('checked'));
  mi['gross_wage']=$('#budget-seaman-bonus-gross-wage').val();

  mi.income=[];
  mi.deduction=[];
  mi.to_remove=dynamic_to_remove;
  $('#income-list tr').each(function(){
    item={};
    item.id=$(this).attr('data-id');
    item.title=$(this).find('.title').text();
    if(item.title.length == 0)error++;
    item.perc=$(this).find('.perc').val();
    item.value=decimal($(this).find('.value').text().replace('%',''));
    item.print='0';
    if($(this).find('.print-control').html().length>0){
      item.print='1';
    }
    mi.income.push(item);
  });

  $('#deduction-list tr').each(function(){
    item={};
    item.id=$(this).attr('data-id');
    item.title=$(this).find('.title').text();
    if(item.title.length == 0)error++;
    item.perc=$(this).find('.perc').val();
    item.value=decimal($(this).find('.value').text().replace('%',''));
    item.print='0';
    if($(this).find('.print-control').html().length>0){
      item.print='1';
    }
    mi.deduction.push(item);
  });



  if(error==0){
    $.ajax({
      type:'POST',
      url:'function_call.php?f=132',
      data:{'fName':'saveRankBudget','mi':mi},
      cache:false,
      error:function(error){if(!JSON.stringify(error).includes('Session ended!'))alert(JSON.stringify(error)); else CallPulse();},
      beforeSend:function(){ShowLoader();},
      complete:function(){HideLoader();},
      success:function(d){
        if(d['answer']=='ok'){
          dynamic_to_remove=[];
          values={};
          values['id']=d['id'];
          values['rank_id']=mi['rank_id'];
          values['rank']=$('#budget-seaman-save').attr('data-current-rank');
          values['rob']=mi['rob'];
          values['count']=d['count'];

          budget_row=$('.budget-item td:nth-child(2):text("'+mi['rank_id']+'")').closest('tr');
          if(budget_row.length>0){
            if(budget_row.hasClass('selected-item'))add_selected_item=true;
            else add_selected_item=false;

            budget_row.replaceWith(rowBudget(values));

            if(add_selected_item)
              $('.budget-item td:nth-child(2):text("'+mi['rank_id']+'")').closest('tr').addClass('selected-item');
          }
          else
            $('#budget-seaman-edited-ranks-list').append(rowBudget(values));


          initRanksControl();
          $('#budget-seaman-save').val(d['id']);
          form_state("disabled");
          $('#budget-seaman-title').html(dict['rank_position_value'].replace('@value',$('#budget-seaman-save').attr('data-current-rank')));
          toastr.success(dict['budget_details_saved']);
          countTotalCrews();
        }
        else{
          toastr.error(dict['error_occurred']);
        }
      }
    });
  }
  else toastr.error(dict['title_is_empty']);


}
function budget_removeRankBudget(){
  Swal.fire({
  heightAuto: false,
  title: dict['delete_budget_record'],
  icon: 'warning',
  showCancelButton: true,
  confirmButtonColor: '#3085d6',
  cancelButtonColor: '#d33',
  cancelButtonText: dict['no'],
  confirmButtonText:dict['yes']
}).then((result) => {
  if (result.value) {
    $.ajax({
      type:'POST',
      url:'function_call.php?f=132',
      data:{'fName':'removeRankBudget','budget_id':$('#budget-seaman-save').val()},
      cache:false,
      error:function(error){if(!JSON.stringify(error).includes('Session ended!'))alert(JSON.stringify(error)); else CallPulse();},
      beforeSend:function(){ShowLoader();},
      complete:function(){HideLoader();},
      success:function(d){
        if(d['answer']=='ok'){
          $('.budget-item td:nth-child(1):text("'+$('#budget-seaman-save').val()+'")').closest('tr').remove();
          toastr.info(dict['budget_record_removed']);
          countTotalCrews();

          $('.salary-item, #budget-seaman-required-on-board, #budget-seaman-salary-leave-days').each(function(){$(this).val('');});
          $('#budget-seaman-contract-duration').val('0');
          $('#income-list, #deduction-list').empty();
          calculateTotal();
          checkInputFill();
        }
        else
          toastr.error(dict['error_occurred']);
      }
    });
  }
});
}


function createTemplate(){
  Swal.fire({
    title: dict.enter_template_title,
    input: 'text',
    showCancelButton: true
  }).then((result) => {
    if (result.value) {
      mi={};
      mi.template_title = result.value;
      mi.template_id = uuidv4();
      if(mi.template_title.length > 0){
        $.ajax({
          type:'POST',
          url:'function_call.php?f=132',
          data:{'fName':'createTemplate','mi':mi},
          cache:false,
          error:function(error){if(!JSON.stringify(error).includes('Session ended!'))alert(JSON.stringify(error)); else CallPulse();},
          beforeSend:function(){ShowLoader();},
          complete:function(){HideLoader();},
          success:function(d){
            if(d.answer == 'ok'){
              templates.push(mi);
              opt='<option value="-1">'+dict.not_selected+'</option>';
              for(i=0;i<templates.length;i++){
                opt = "<option value = '"+templates[i].template_id+"'>"+templates[i].template_title+"</option>";
              }
              mdbUpdateSelectContent('budget-seaman-template',opt);
              toastr.info(dict.template_created);
            }
            else toastr.error(dict['error_occurred']);
          }
        });
      }
    }
  });
}


function saveTemplate(){
  if($('#budget-seaman-template').val() != '-1'){
    Swal.fire({
      title: dict.update_selected_template+'?',
      icon: 'info',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      cancelButtonText: dict['no'],
      confirmButtonText:dict['yes']
    }).then((result) => {
      if (result.value) {
        mi={}
        mi.template_id=$('#budget-seaman-template').val();
        mi.template_title = $('#budget-seaman-template option:selected').text();
        $.ajax({
          type:'POST',
          url:'function_call.php?f=132',
          data:{'fName':'saveTemplate', 'mi':mi},
          cache:false,
          error:function(error){if(!JSON.stringify(error).includes('Session ended!'))alert(JSON.stringify(error)); else CallPulse();},
          beforeSend:function(){ ShowLoader();},
          complete:function(){HideLoader();},
          success:function(d){
            if(d.answer=='ok'){
              toastr.info(dict.template_updated);
            }
            else toastr.error(dict['error_occurred']+": "+JSON.stringify(d));

          }
        });
      }
    });
  }

}




function applyTemplate(){
  if($('#budget-seaman-template').val() != '-1'){
    Swal.fire({
      title: dict.apply_selected_template_to_vessel+'?',
      icon: 'info',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      cancelButtonText: dict['no'],
      confirmButtonText:dict['yes']
    }).then((result) => {
      if (result.value) {
        mi={}
        mi.template_id=$('#budget-seaman-template').val();
        mi.template_title = $('#budget-seaman-template option:selected').text();
        $.ajax({
          type:'POST',
          url:'function_call.php?f=132',
          data:{'fName':'applyTemplate', 'mi':mi},
          cache:false,
          error:function(error){if(!JSON.stringify(error).includes('Session ended!'))alert(JSON.stringify(error)); else CallPulse();},
          beforeSend:function(){ ShowLoader();},
          complete:function(){HideLoader();},
          success:function(d){
            if(d.answer=='ok'){
              toastr.info(dict.template_applied);
              if($('#budget-seaman-available-ranks-list tr.selected-item').length > 0){
                $('#budget-seaman-available-ranks-list tr.selected-item').click();
              }
            }
            else toastr.error(dict['error_occurred']+": "+JSON.stringify(d));

          }
        });
      }
    });
  }
}


function initTemplatePreview(){
  opt = '<option value="-1">'+dict.not_selected+'</option>';
  for(i=0;i<templates.length;i++){
    opt+='<option value="'+templates[i].template_id+'">'+templates[i].template_title+'</option>';
  }
  mdbUpdateSelectContent('budget-seaman-preview-template',opt);
  $('#budget-seaman-preview-available-ranks-list').empty();

  $('#bud-seaman-template-modal').modal('show');
}


function getTemplatePreview(){
  mi={};
  mi.template_id = $('#budget-seaman-preview-template').val();
  if(mi.template_id != '-1'){
    $.ajax({
      type:'POST',
      url:'function_call.php?f=132',
      data:{'fName':'getTemplatePreview', 'mi':mi},
      cache:false,
      error:function(error){if(!JSON.stringify(error).includes('Session ended!'))alert(JSON.stringify(error)); else CallPulse();},
      beforeSend:function(){ ShowLoader();},
      complete:function(){HideLoader();},
      success:function(d){
        preview_template=d;
        ht='';
        for(i=0;i<preview_template.length;i++){
          r="<tr class='budget-template-item' data-id = '"+preview_template[i].id+"' onclick='selectedItem($(this)); loadTemplatePreview($(this));'>";
          r+="<td class='title'>"+preview_template[i].rank+"</td>";
          r+="</tr>";
          ht+=r;
        }
        $('#budget-seaman-preview-available-ranks-list').html(ht);

      }
    });
  }

}


function loadTemplatePreview(elem){
  tempp=preview_template.find(x=>x.id == elem.closest('tr').attr('data-id'));
  if(isset(tempp)){
    $('#budget-seaman-preview-salary-basic').val(tempp.basic);
    $('#budget-seaman-preview-salary-sick-wage').val(tempp.sick_wage);
    $('#budget-seaman-preview-salary-leave-sub').val(tempp.leave_sub);
    $('#budget-seaman-preview-salary-leave-days').val(tempp.leave_day_pay_d);
    $('#budget-seaman-preview-salary-leave-pay').val(tempp.leave_day_pay);
    $('#budget-seaman-preview-salary-ot-fixed').val(tempp.ot_fixed);
    $('#budget-seaman-preview-salary-ot-guaranted').val(tempp.ot_guaranted);
    $('#budget-seaman-preview-salary-ot-rate').val(tempp.ot_rate_hrs);

    $('#budget-seaman-preview-salary-total-wage').val(tempp.total_wage);
    $('#budget-seaman-preview-bonus-non-recharge').val(tempp.non_recharge);
    $('#budget-seaman-preview-bonus-fleet').val(tempp.fleet);
    $('#budget-seaman-preview-bonus-loyalty').val(tempp.loyalty);
    $('#budget-seaman-preview-bonus-recharge').val(tempp.recharge);
    $('#budget-seaman-preview-bonus-tanker').val(tempp.tanker);
    $('#budget-seaman-preview-bonus-seniority').val(tempp.seniority);
    $('#budget-seaman-preview-bonus-rejoining').val(tempp.rejoin_bonus);
    $('#budget-seaman-preview-bonus-gross-wage').val(tempp.gross_wage);

    $('#budget-seaman-preview-fees').prop('checked',cIntToBool(tempp.fees));

    checkInputFill();
  }

}


function removeTemplate(){
  mi={};
  mi.template_id = $('#budget-seaman-preview-template').val();
  if(mi.template_id != '-1'){

    Swal.fire({
      title: dict.remove_selected_template+'?',
      icon: 'info',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      cancelButtonText: dict['no'],
      confirmButtonText:dict['yes']
    }).then((result) => {
      if (result.value) {
        $.ajax({
          type:'POST',
          url:'function_call.php?f=132',
          data:{'fName':'removeTemplate', 'mi':mi},
          cache:false,
          error:function(error){if(!JSON.stringify(error).includes('Session ended!'))alert(JSON.stringify(error)); else CallPulse();},
          beforeSend:function(){ ShowLoader();},
          complete:function(){HideLoader();},
          success:function(d){
            templates.splice(templates.findIndex(x=>x.template_id == mi.template_id),1);
            opt = '<option value="-1">'+dict.not_selected+'</option>';
            for(i=0;i<templates.length;i++){
              opt+='<option value="'+templates[i].template_id+'">'+templates[i].template_title+'</option>';
            }
            mdbUpdateSelectContent('budget-seaman-preview-template',opt);
            mdbUpdateSelectContent('budget-seaman-template',opt);
            $('#budget-seaman-preview-available-ranks-list').empty();

            $('#budget-seaman-preview-salary-basic').val('');
            $('#budget-seaman-preview-salary-sick-wage').val('');
            $('#budget-seaman-preview-salary-leave-sub').val('');
            $('#budget-seaman-preview-salary-leave-days').val('');
            $('#budget-seaman-preview-salary-leave-pay').val('');
            $('#budget-seaman-preview-salary-ot-fixed').val('');
            $('#budget-seaman-preview-salary-ot-guaranted').val('');
            $('#budget-seaman-preview-salary-ot-rate').val('');

            $('#budget-seaman-preview-salary-total-wage').val('');
            $('#budget-seaman-preview-bonus-non-recharge').val('');
            $('#budget-seaman-preview-bonus-fleet').val('');
            $('#budget-seaman-preview-bonus-loyalty').val('');
            $('#budget-seaman-preview-bonus-recharge').val('');
            $('#budget-seaman-preview-bonus-tanker').val('');
            $('#budget-seaman-preview-bonus-seniority').val('');
            $('#budget-seaman-preview-bonus-rejoining').val('');
            $('#budget-seaman-preview-bonus-gross-wage').val('');

            $('#budget-seaman-preview-fees').prop('checked',false);

          }
        });
      }
    });


  }

}



//Dynamic salary controls
function addIncome(){
  $('#income-list').append(rowDynamicSalary({}));
}

function addDeduction(){
  $('#deduction-list').append(rowDynamicSalary({}));
}

function rowDynamicSalary(values, context){
  if(!isset(values.id))values.id = uuidv4();
  if(!isset(values.title))values.title='';
  if(!isset(values.perc))values.perc='0';
  if(!isset(values.value))values.value='0';
  if(!isset(values.print))values.print='0';

  disabled='disabled';editable='false';
  if(!$('#budget-seaman-save').prop('disabled')){
    disabled='';
    editable='true';
  }

  fixed=' selected ';perc='';
  if(values.perc=='1'){fixed=''; perc=' selected ';}

  print_state='';
  if(values.print=='1')
    print_state='<i class="bi bi-check"></i>';

  r='<tr class="dynamic-item" data-id="'+values.id+'">';
    r+='<td class="title" contenteditable="'+editable+'">'+values.title+'</td>';
    r+='<td>';
      r+='<select style="height: 18px; line-height: 1;" class="custom-select py-0 perc" '+disabled+'>';
        r+='<option value="0" '+fixed+'>'+dict['fixed']+'</option>';
        r+='<option value="1" '+perc+'>'+dict['percent']+'</option>';
      r+='</select>';
    r+='</td>';
    r+='<td class="value" contenteditable="'+editable+'" onblur="calculateTotal()">'+values.value+'</td>';
    r+='<td class="text-center cursor-hand print-control" onclick="dynamicSalaryPrintClick($(this))" hidden>'+print_state+'</td>';
    r+='<td class="ui-hover-remove text-center text-middle red-text cursor-hand" onclick="removeDynamicItem($(this))"><i class="bi bi-x"></i></td>';
  r+='</tr>';

  return r;
}


function dynamicSalaryPrintClick(elem){
  if(!$('#budget-seaman-save').prop('disabled')){
  icon='<i class="bi bi-check"></i>';
  if (elem.html().length > 0) {
    elem.html('');
  } else {
    elem.html(icon);
  }
  }
}


function removeDynamicItem(elem){
  if(!$('#budget-seaman-save').prop('disabled')){
    dynamic_to_remove.push(elem.closest('tr').attr('data-id'));
    elem.closest('tr').remove();
    calculateTotal();
  }
}

//Dynamic salary controls




function selectedItem(row){
  mclass='';
  if($(row).hasClass('rank-item'))mclass='rank-item';
  else if($(row).hasClass('budget-item'))mclass='budget-item';
  else if($(row).hasClass('budget-template-item'))mclass='budget-template-item';

  $('.'+mclass+'.selected-item').removeClass("selected-item");
  $(row).addClass("selected-item");
}
function countTotalCrews(){
  total_rob=0;
  total_on_board=0;
  $('.budget-item').each(function(){
    total_rob+=decimal($(this).find('.budget-item-rob').text());
    total_on_board+=decimal($(this).find('.budget-item-on-board').text());
  });
  $('#budget-seaman-total-required').val(total_rob);
  $('#budget-seaman-total-on-board').val(total_on_board);

  checkInputFill();
}


function form_state(state){
  if(state=="enabled")state=true;
  else state=false;

  $('#budget-seaman-edit').prop('disabled',state);
  //Access check
  if(!sysModuleAccess()){
    $('#budget-seaman-edit').prop('disabled',true);
    state=false;
  }


  $('#budget-seaman-save').prop('disabled',!state);
  $('#budget-seaman-delete').prop('disabled',!state);

  $('#budget-seaman-required-on-board').prop('disabled',!state);
  $('#budget-seaman-contract-duration').prop('disabled',!state);

  $('#budget-seaman-salary-basic').prop('disabled',!state);
  $('#budget-seaman-salary-sick-wage').prop('disabled',!state);
  $('#budget-seaman-salary-leave-sub').prop('disabled',!state);
  $('#budget-seaman-salary-leave-days').prop('disabled',!state);
  $('#budget-seaman-salary-leave-pay').prop('disabled',!state);
  $('#budget-seaman-salary-ot-fixed').prop('disabled',!state);
  $('#budget-seaman-salary-ot-guaranted').prop('disabled',!state);
  $('#budget-seaman-salary-ot-rate').prop('disabled',!state);

  $('#budget-seaman-bonus-non-recharge').prop('disabled',!state);
  $('#budget-seaman-bonus-fleet').prop('disabled',!state);
  $('#budget-seaman-bonus-loyalty').prop('disabled',!state);
  $('#budget-seaman-bonus-recharge').prop('disabled',!state);
  $('#budget-seaman-bonus-tanker').prop('disabled',!state);
  $('#budget-seaman-bonus-rejoining').prop('disabled',!state);
  $('#budget-seaman-bonus-seniority').prop('disabled',!state);
  $('#budget-seaman-bonus-rejoining').prop('disabled',!state);
  $('#budget-seaman-fees').prop('disabled',!state);

  $('#add-income, #add-deduction').prop('hidden',!state);
  $('.dynamic-item .title, .value').prop('contenteditable',state);
  $('.dynamic-item .perc').prop('disabled',!state);

  if($('#budget-seaman-save').val()=='new')
    $('#budget-seaman-delete').prop('disabled',true);
}


function calculateTotal(){
    main_salary=0;
    bonus_premium=0;
    $('.main-salary').each(function(){ main_salary+=decimal($(this).val()); });
    $('.bonus-premium').each(function(){ bonus_premium+=decimal($(this).val()); });
    $('#budget-seaman-salary-total-wage').val(main_salary.toFixed(2));
    $('#budget-seaman-bonus-gross-wage').val(decimal(main_salary+bonus_premium - decimal($('#budget-seaman-fees').val())).toFixed(2));

    //Dynamic
    //Income list
    current_total=decimal($('#budget-seaman-bonus-gross-wage').val());
    total_fixed=0;
    total_perc=0;
    $('#income-list tr').each(function(){
      if($(this).find('.perc').val() == '1')
        total_perc+=decimal($(this).find('.value').text().replace('%',''));
      else total_fixed+=decimal($(this).find('.value').text());
    });
    current_total+=total_fixed;
    if(total_perc>0)
      current_total+=(current_total * total_perc) / 100;

    //Deduction list
    total_fixed=0;
    total_perc=0;
    $('#deduction-list tr').each(function(){
      if($(this).find('.perc').val() == '1')
        total_perc+=decimal($(this).find('.value').text().replace('%',''));
      else total_fixed+=decimal($(this).find('.value').text());
    });
    current_total-=total_fixed;
    if(total_perc>0)
      current_total-=(current_total * total_perc) / 100;

    $('#budget-seaman-bonus-gross-wage').val(decimal(current_total).toFixed(2));

  checkInputFill();
}
function initSalaryControls(){
  $('.salary-item').unbind();
  $('.salary-item').on("input",function(){
    calculateTotal();
  });
  $(".salary-item").keydown(function (event) {
    if (event.shiftKey == true) {
        event.preventDefault();
    }

    if ((event.keyCode >= 48 && event.keyCode <= 57) ||
        (event.keyCode >= 96 && event.keyCode <= 105) ||
        event.keyCode == 8 || event.keyCode == 9 || event.keyCode == 37 ||
        event.keyCode == 39 || event.keyCode == 46 || event.keyCode == 190 || event.keyCode == 110) {

    } else {
        event.preventDefault();
    }

    if($(this).val().indexOf('.') !== -1 && (event.keyCode == 190 && event.keyCode == 110))
        event.preventDefault();
    //if a decimal has been added, disable the "."-button

});
}

function sysModuleAccess(){
  return cIntToBool(securels.get('usr_bn_budget_seaman_compasition_edit'));
}

function switchCheck(elem){
  console.log(elem);
  if(elem.find('.bud-template-vessel-item-include i').hasClass('bi-check-square')){
    elem.find('.bud-template-vessel-item-include i').removeClass('bi-check-square').addClass('bi-square');
  }
  else elem.find('.bud-template-vessel-item-include i').removeClass('bi-square').addClass('bi-check-square');
}