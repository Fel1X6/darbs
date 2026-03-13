var cats=[];
var items=[];
var ship=null;

var planning_data=[];
var fact_data=[];
var special_fields_values=[];
var manual_months=[];
var budget=[];

(function($){
    $(document).ready(function(){

      mdbSetSelect('budget-year',getCurrentDate('DB').split('-')[0]);


      initBudget();


      sysModuleAccess();
      if(sysModuleAccess(true).usr_bn_budget_planning_template=='1'){
        $('#bud-template-cat-list, #bud-template-items-list').sortable({
          helper: fixWidthHelper
        }).disableSelection();

        //Template select control
        $('.bud-template-item-field').click(function(){
          cell=$(this).find('.bud-template-item-field-select');
          if(cell.html()=='<i class="bi bi-square"></i>')
            cell.html('<i class="bi bi-check-square"></i>');
          else cell.html('<i class="bi bi-square"></i>');
        });
      }



      $(document).on('keydown', '.year-cell', function(e) {
        if (e.key === 'Enter') {
          e.preventDefault();
          $('.year-cell').eq($('.year-cell').index(this) + 1).focus();
        }
      });

    })
})(jQuery);


function initBudget(){
  $.ajax({
    type:'POST',
    url:'function_call.php?f=132',
    data:{'fName':'initBudget'},
    cache:false,
    error:function(error){if(!JSON.stringify(error).includes('Session ended!'))alert(JSON.stringify(error)); else CallPulse();},
    beforeSend:function(){ ShowLoader();},
    complete:function(){HideLoader();},
    success:function(d){
      cats=d.cats;
      //items=d.items;
      ship=d.ship;

      $('#bud-month-currency').html(ship.budget_currency);
      $('#plan-currency').val(ship.budget_currency);
      checkInputFill();

      $('.overflow-checkbox[data-toggle="tooltip"]').tooltip(
        {
          delay: {"show":400,"hide":100}
        }
      );
      $('[data-toggle="tooltip"]').tooltip();



      loadBudgetPlanningFact();
    }
  });
}


function saveTemplateOrder(){
  mi={};
  mi['cats']=[];
  $('.bud-template-cat-item').each(function(){
    item=$(this).find('.bud-template-cat-item-id').text();
    mi.cats.push(item);
  });
  mi['items']=[];
  if($('.bud-template-cat-item.selected-item').length>0){
    mi['cat_id']=$('.bud-template-cat-item.selected-item .bud-template-cat-item-id').text();
    $('.bud-template-item').each(function(){
      item=$(this).find('.bud-template-item-id').text();
      mi.items.push(item);
    });
  }

  $.ajax({
    type:'POST',
    url:'function_call.php?f=132',
    data:{'fName':'saveTemplateOrder','mi':mi},
    cache:false,
    error:function(error){if(!JSON.stringify(error).includes('Session ended!'))alert(JSON.stringify(error)); else CallPulse();},
    beforeSend:function(){ ShowLoader();},
    complete:function(){HideLoader();},
    success:function(d){
      if(d.answer=='ok'){
        for(i=0;i<mi.cats.length;i++){
          ind=cats.findIndex(x=>x.id == mi.cats[i]);
          if(ind!=-1)
            cats[ind].order_no=i;
        }
        for(i=0;i<mi.items.length;i++){
          ind=items.findIndex(x=>x.id == mi.items[i]);
          if(ind!=-1)
            items[ind].order_no=i;
        }
        toastr.info(dict['order_updated']);
        $('#bud-templates-tab-classic').attr('data-changed','1');
      }
      else toastr.error(dict['order_updated']+": "+JSON.stringify(d));

    }
  });

}



function selectedItem(row){
  mclass='';
  if($(row).hasClass('bud-template-cat-item'))mclass='bud-template-cat-item';
  else if($(row).hasClass('bud-template-item'))mclass='bud-template-item';
  else if($(row).hasClass('month-detail-item'))mclass='month-detail-item';
  else if (row.hasClass('external-invoice')) mclass = 'external-invoice';

  $('.'+mclass+'.selected-item').removeClass("selected-item");
  $(row).addClass("selected-item");
}






function loadData(){
  selected_tab=$('.budget-tablist .nav-link.active');
  selected_tab.attr('data-init-count','0');
  loadBudgetPlanningFact(selected_tab);
}


function loadBudgetPlanningFact(tab=null){
  mi={};
  mi.year=$('#budget-year').val();
  $.ajax({
    type:'POST',
    url:'function_call.php?f=132',
    data:{'fName':'loadBudgetPlanningFact','mi':mi},
    cache:false,
    error:function(error){if(!JSON.stringify(error).includes('Session ended!'))alert(JSON.stringify(error)); else CallPulse();},
    beforeSend:function(){ ShowLoader();},
    complete:function(){HideLoader();},
    success:function(d){
      budget=d.budget;

      planning_data=d.plan.items;
      fact_data=d.fact;
      special_fields_values=d.field_calculations;
      manual_months=d.month_manual;

      values=[];
      head_cats=cats.filter(x=>x.parent_id == 'np' && x.overbudget_item == '0');
      for(i=0;i<head_cats.length;i++){
        data={}; data_fact={};
        tmp_items=[];

        data.category={};
        data.category.title=head_cats[i].title;
        data.category.code=head_cats[i].code;
        data.category.id=head_cats[i].id;
        data_fact.category={};
        data_fact.category.title=head_cats[i].title;
        data_fact.category.code=head_cats[i].code;
        data_fact.category.id=head_cats[i].id;

        data.items=[];data_fact.items=[];
        findCatChildrens(head_cats[i].id);
        ind=tmp_items.findIndex(x=>x.id == head_cats[i].id);
        //tmp_items.splice(ind,1);
        values.push(tmp_items);

      }
      $('#main-table').html(planTable(values));
      filterControls($('#plan-months'));
      recountTableTotalPlan();

      inputControls();

      $('.ui-search input').on('input', function () {
        if ($(this).val().length > 0) {
          $(this).parent().addClass('notempty');
        } else {
          $(this).parent().removeClass('notempty');
        }
      });
      if(localStorage.hasOwnProperty('autoroute_ext_id')){
        $('#open-external-invoices').click();
      }


      loadOverbudget();

    }
  });


  function findCatChildrens(cat_id){
    cat=cats.find(x=>x.id == cat_id);
    tmp_items.push(cat);
    var cat_list=cats.filter(x=>x.parent_id == cat_id);
    for(var i=0;i<cat_list.length;i++){
        findCatChildrens(cat_list[i].id);
    }
  }
}








function budgetTabClick(elem){
  /*if($('#bud-templates-tab-classic').attr('data-changed')=='1')
    loadBudgetPlanningFact();
  else if(elem.attr('id') == 'bud-month-chart-tab-classic' && ($('#bud-annual-plan-tab-classic').attr('data-init-count') == '0' && $('#bud-annual-fact-tab-classic').attr('data-init-count') == '0'))
    loadBudgetPlanningFact(elem);

  else if(elem.attr('id') == 'bud-month-chart-tab-classic')
    initBudgetChart();

  else if(elem.attr('id') == 'bud-annual-plan-tab-classic' && $('#bud-annual-plan-tab-classic').attr('data-init-count') == '0')
    loadBudgetPlanningFact(elem);
  else if(elem.attr('id') == 'bud-annual-fact-tab-classic' && $('#bud-annual-fact-tab-classic').attr('data-init-count') == '0')
    loadBudgetPlanningFact(elem);*/
}

function switchPeriodEdit(){

  if($('#plan-months').val().length == 12){
    $('.year-group .num-plan').each(function(){
      if($(this).closest('.grid-tbody').attr('data-editable') == '1'){
        $(this).addClass('ui-hover');
        $(this).attr('contenteditable', 'true');
      }
    });
  }
  else{
    if($('.year-group.ui-hover').length > 0){
      $('.year-group .num-plan').each(function(){
          $(this).removeClass('ui-hover');
          $(this).attr('contenteditable', 'false');
      });
    }
  }
}


function planTable(values){
  $('#main-table').empty();
  $('#main-table').closest('.grid-table').attr('data-num-months',12);
  $('#main-table').closest('.grid-table').attr('data-month-cols',4);
  $('#main-table').closest('.grid-table').attr('data-total-cols',3);
  current_month=parseInt(getCurrentDate('DB').split('-')[1]);


  head='<div class="grid-row grid-thead"><div class="grid-td grid-th grid-empty masked-offset" style="grid-column: span 2;"><div class="d-flex align-items-center">'+
  '<button onclick="toggleExpandPlan($(this));" id="expand-plan" class="btn btn-secondary btn-sm waves-effect mr-2"><i class="bi bi-arrows-expand mr-0"></i></button>'+
  '<div class="mb-0 flex-grow-1 mr-2">'+
    '<input type="text" id="budget-search" class="ui-search__input form-control" placeholder="Search">'+
    '<span class="bi bi-x reset" onclick="resetSearch($(this));" style="display: none; color: #000;"></span>'+
  '</div>'+
  '<button onclick="searchItem();" id="budget-item-search" class="btn btn-primary btn-square waves-effect"><i class="bi bi-search mr-0"></i></button>'+
  '</div></div>';
  // head+='<div class="grid-td grid-th grid-empty"></div>';
  head+='<div class="grid-td grid-th top text-center month-head" data-month="1">'+dict['january']+'</div>';
  head+='<div class="grid-td grid-th top text-center month-head" data-month="2">'+dict['february']+'</div>';
  head+='<div class="grid-td grid-th top text-center month-head" data-month="3">'+dict['march']+'</div>';
  head+='<div class="grid-td grid-th top text-center month-head" data-month="4">'+dict['april']+'</div>';
  head+='<div class="grid-td grid-th top text-center month-head" data-month="5">'+dict['may']+'</div>';
  head+='<div class="grid-td grid-th top text-center month-head" data-month="6">'+dict['june']+'</div>';
  head+='<div class="grid-td grid-th top text-center month-head" data-month="7">'+dict['july']+'</div>';
  head+='<div class="grid-td grid-th top text-center month-head" data-month="8">'+dict['august']+'</div>';
  head+='<div class="grid-td grid-th top text-center month-head" data-month="9">'+dict['september']+'</div>';
  head+='<div class="grid-td grid-th top text-center month-head" data-month="10">'+dict['october']+'</div>';
  head+='<div class="grid-td grid-th top text-center month-head" data-month="11">'+dict['november']+'</div>';
  head+='<div class="grid-td grid-th top text-center month-head" data-month="12">'+dict['december']+'</div>';
  head+='<div class="grid-td grid-th top text-center">'+dict['period']+'</div>';
  head+='<div class="grid-td grid-th top text-center">'+dict['day_cost']+'</div>';
  head+='<div class="grid-td grid-th masked-offset">'+dict['code']+'</div>';
  head+='<div class="grid-td grid-th">'+dict['title']+'</div>';

  for(i=1;i<13;i++){
    head+='<div class="grid-td grid-th grid-group group-head month-subhead" data-month="'+i+'">';
    head+='<div class="grid-td grid-th head-plan">'+dict['budget']+'</div>';
    head+='<div class="grid-td grid-th head-reserve">'+dict['reserved']+'</div>';
    head+='<div class="grid-td grid-th head-fact">'+dict['fact']+'</div>';
    head+='<div class="grid-td grid-th">'+dict['diff']+'</div>';
    head+='</div>';
  }


    head+='<div class="grid-td grid-th grid-group group-head group-cols--3 year-group">';
    head+='<div class="grid-td grid-th head-plan">'+dict['budget']+'</div>';
    head+='<div class="grid-td grid-th head-fact">'+dict['fact']+'</div>';
    head+='<div class="grid-td grid-th">'+dict['diff']+'</div>';
    head+='</div>';

    head+='<div class="grid-td grid-th grid-group group-head group-cols--3 day-group">';
    head+='<div class="grid-td grid-th head-plan">'+dict['budget']+'</div>';
    head+='<div class="grid-td grid-th head-fact">'+dict['fact']+'</div>';
    head+='<div class="grid-td grid-th">'+dict['diff']+'</div>';
    head+='</div>';
    head+='</div>';



  html='';
  for(z=0;z<values.length;z++){
    for(i=0;i<values[z].length;i++){
      local_data={};


      

      if(isset(budget[values[z][i].id])){
        local_data=budget[values[z][i].id];
        if(local_data.current_reserve.length == 0) local_data.current_reserve='0.00';
      }
      else{
        for(month=1;month<13;month++){
          local_data['plan_month_'+month]=0;
          local_data['month_'+month]=0;
          local_data.current_reserve='0.00';
        }
      }


      hasChild='false';
      plan_editable='true';
      fact_editable='1';
      if(values[z].filter(x=>x.parent_id == values[z][i].id).length>0){
        hasChild='true';
        plan_editable='false';
        fact_editable='0';
      }

      expand_btn='';
      if(hasChild == 'true') {
        expand_btn='<span class="budget-child-expand" onclick="budgetExpandToggle($(this))"></span>';
      }

      visibility='collapsed';
      if(hasChild='true' && parseInt(values[z][i].level) == 1) {
        visibility='expanded';
      }

      html+='<!-- Row: '+values[z][i].code+' -->';
      if(visibility=='collapsed') {
        html+='<div class="grid-row grid-tbody collapsed" data-editable = "'+fact_editable+'" data-item-id="'+values[z][i].id+'" data-parent-id="'+values[z][i].parent_id+'">';
      } else {
        html+='<div class="grid-row grid-tbody" data-editable = "'+fact_editable+'" data-item-id="'+values[z][i].id+'" data-parent-id="'+values[z][i].parent_id+'">';
      }

      html+='<div class="grid-td fixed item-code bg-white"  data-item-id="'+values[z][i].id+'" data-parent-id="'+values[z][i].parent_id+'" style="left: '+(((lvl = parseInt(values[z][i].level)-1) > 0) ? lvl * 20 + 10 : 0.5 * 20)+'px; margin-left: '+(((lvl = parseInt(values[z][i].level)-1) > 0) ? lvl * 20 : 0 * 20)+'px; padding-left: 16px;">'+expand_btn+values[z][i].code+'</div>';
      html+='<div class="grid-td fixed item-name" ondblclick="openBCodeBreakdown($(this))" data-title="'+values[z][i].code+' '+values[z][i].title+'" data-item-id="'+values[z][i].id+'" data-parent-id="'+values[z][i].parent_id+'">'+values[z][i].title+'</div>';
      for(month=1;month<13;month++){
        if(local_data['plan_month_'+month].length == 0)
          local_data['plan_month_'+month]='0';
        html+='<div class="grid-td grid-group group-cols num-group" data-item-id="'+values[z][i].id+'" data-parent-id="'+values[z][i].parent_id+'" data-level="'+values[z][i].level+'" data-month="'+month+'">';
          html+='<div class="grid-td text-middle text-right num-plan '+((plan_editable == 'true') ? 'ui-hover':'')+' num-strict" contenteditable="'+plan_editable+'">'+decimal(local_data['plan_month_'+month]).toFixed(2)+'</div>';
          reserve='0';
          if(current_month == month){
            reserve=decimal(local_data.current_reserve).toFixed(2);
          }
            
          html+='<div class="grid-td text-middle text-right num-reserve">'+reserve+'</div>';
          html+='<div class="grid-td text-middle text-right num-fact" data-editable="'+fact_editable+'">'+decimal(local_data['month_'+month]).toFixed(2)+'</div>';
          html+='<div class="grid-td text-middle text-right num-diff">'+decimal(local_data['plan_month_'+month] - local_data['month_'+month]).toFixed(2)+'</div>';
        html+='</div>';
      }



        html+='<div class="grid-td grid-group group-cols group-cols--3 year-group" data-item-id="'+values[z][i].id+'" data-level="'+values[z][i].level+'" data-parent-id="'+values[z][i].parent_id+'">';
          html+='<div class="grid-td text-middle text-right num-plan year-cell">0</div>';
          html+='<div class="grid-td text-middle text-right num-fact">0</div>';
          html+='<div class="grid-td text-middle text-right num-diff">0</div>';
        html+='</div>';

        html+='<div class="grid-td grid-group group-cols group-cols--3 day-group" data-item-id="'+values[z][i].id+'" data-level="'+values[z][i].level+'" data-parent-id="'+values[z][i].parent_id+'">';
          html+='<div class="grid-td text-middle text-right num-plan">0</div>';
          html+='<div class="grid-td text-middle text-right num-fact">0</div>';
          html+='<div class="grid-td text-middle text-right num-diff">0</div>';
        html+='</div>';

      html+='</div>';
    }

  }

  html+='<div class="grid-row grid-tfoot"><div class="grid-td grid-empty bg-white fixed" style="left:10px;"></div>';
    html+='<div class="grid-td item-total fixed">Total</div>';
    for(month=1;month<13;month++){
      html+='<div class="grid-td grid-group group-cols group-month-total" data-month="'+month+'">';
        html+='<div class="grid-td text-middle text-right num-total-plan">0.000</div>';
        html+='<div class="grid-td text-middle text-right num-total-reserve">0.000</div>';
        html+='<div class="grid-td text-middle text-right num-total-fact">0.000</div>';
        html+='<div class="grid-td text-middle text-right num-total-diff">0.000</div>';
      html+='</div>';
    }
    html+='<div class="grid-td grid-group group-cols group-cols--3 year-total-group">';
      html+='<div class="grid-td text-middle text-right num-plan">0</div>';
      html+='<div class="grid-td text-middle text-right num-fact">0</div>';
      html+='<div class="grid-td text-middle text-right num-diff">0</div>';
    html+='</div>';

    html+='<div class="grid-td grid-group group-cols group-cols--3 day-total-group">';
      html+='<div class="grid-td text-middle text-right num-plan">0</div>';
      html+='<div class="grid-td text-middle text-right num-fact">0</div>';
      html+='<div class="grid-td text-middle text-right num-diff">0</div>';
    html+='</div></div>';

  return head+html;
}

function recountTableTotalPlan(item=null){
  if(item == null){
    for(i=1;i<13;i++){
      month_total_plan=0;
      month_total_fact=0;
      month_total_reserve=0;
      month_total_diff=0;
      $('#main-table').find('.num-group[data-level="1"][data-month="'+i+'"]').each(function(){
        month_total_plan+=decimal($(this).find('.num-plan').text());
        month_total_fact+=decimal($(this).find('.num-fact').text());
        month_total_reserve+=decimal($(this).find('.num-reserve').text());
        month_total_diff+=decimal($(this).find('.num-diff').text());
      });

      month_group=$('#main-table').find('.group-month-total[data-month="'+i+'"]');
       month_group.find('.num-total-plan').html(month_total_plan.toFixed(2));
       month_group.find('.num-total-fact').html(month_total_fact.toFixed(2));
       month_group.find('.num-total-reserve').html(month_total_reserve.toFixed(2));
       month_group.find('.num-total-diff').html(month_total_diff.toFixed(2));
    }

  }

  else{
    current_parent_id=item.attr('data-parent-id');
    item.find('.num-diff').html(( decimal(item.find('.num-plan').text()) - decimal(item.find('.num-fact').text())).toFixed(2));
      total_plan=0;
    for(i=1;i<13;i++){
      //Check if month visible
      if(!$('#main-table').find('.month-head[data-month="'+i+'"]').prop('hidden')){
        obj=$('#main-table').find('.num-group[data-item-id="'+item.attr('data-item-id')+'"][data-month="'+i+'"]');
        total_plan+=decimal(obj.find('.num-plan').text());
      }

    }
    //Period
    obj=$('#main-table').find('.year-group[data-item-id="'+item.attr('data-item-id')+'"]');
    obj.find('.num-plan').html(total_plan.toFixed(2));
    total_fact=decimal(obj.find('.num-fact').text());
    obj.find('.num-diff').html( ( total_plan - total_fact ).toFixed(2) );

    //Day
    obj=$('#main-table').find('.day-group[data-item-id="'+item.attr('data-item-id')+'"]');
    obj.find('.num-plan').html( (total_plan / 365).toFixed(2) );
    total_fact=decimal(obj.find('.num-fact').text());
    obj.find('.num-diff').html( ( (total_plan / 365) - total_fact).toFixed(2) );


    while(current_parent_id!='np'){

      sub_cat_total=0; year_total_plan=0; year_total_diff=0; day_total_plan=0; day_total_diff=0;

      $('#main-table').find('.num-group[data-parent-id="'+current_parent_id+'"][data-month="'+item.attr('data-month')+'"] .num-plan').each(function(){
        sub_cat_total+=decimal($(this).text());
      });
      $('#main-table').find('.year-group[data-parent-id="'+current_parent_id+'"]').each(function(){
        year_total_plan+=decimal($(this).find('.num-plan').text());
        year_total_diff+=decimal($(this).find('.num-diff').text());
      });
      $('#main-table').find('.day-group[data-parent-id="'+current_parent_id+'"]').each(function(){
        day_total_plan+=decimal($(this).find('.num-plan').text());
        day_total_diff+=decimal($(this).find('.num-diff').text());
      });

      head_cat=$('#main-table').find('.num-group[data-item-id="'+current_parent_id+'"][data-month="'+item.attr('data-month')+'"]');
      head_cat.find('.num-plan').html(sub_cat_total.toFixed(2));
      head_cat.find('.num-diff').html((sub_cat_total - decimal(head_cat.find('.num-fact').text())).toFixed(2));
      head_cat=$('#main-table').find('.year-group[data-item-id="'+current_parent_id+'"]');
      head_cat.find('.num-plan').html(year_total_plan.toFixed(2));
      head_cat.find('.num-diff').html(year_total_diff.toFixed(2));
      head_cat=$('#main-table').find('.day-group[data-item-id="'+current_parent_id+'"]');
      head_cat.find('.num-plan').html(day_total_plan.toFixed(2));
      head_cat.find('.num-diff').html(day_total_diff.toFixed(2));



      current_parent_id=head_cat.attr('data-parent-id');
    }


    month_total_plan=0;
    month_total_fact=0;
    month_total_reserve=0;
    month_total_diff=0;
    $('#main-table').find('.num-group[data-level="1"][data-month="'+item.attr('data-month')+'"]').each(function(){
      month_total_plan+=decimal($(this).find('.num-plan').text());
      month_total_fact+=decimal($(this).find('.num-fact').text());
      month_total_reserve+=decimal($(this).find('.num-reserve').text());
      month_total_diff+=decimal($(this).find('.num-diff').text());
    });

    month_group=$('#main-table').find('.group-month-total[data-month="'+item.attr('data-month')+'"]');
     month_group.find('.num-total-plan').html(month_total_plan.toFixed(2));
     month_group.find('.num-total-fact').html(month_total_fact.toFixed(2));
     month_group.find('.num-total-reserve').html(month_total_reserve.toFixed(2));
     month_group.find('.num-total-diff').html(month_total_diff.toFixed(2));

    recountPeriodDay('1');
  }



}

function recountPeriodDay(item=null){
  if(item == null){
    visibleMonths = $('#main-table').find('.month-head:not([hidden])').map(function(){
      return $(this).data('month');
    }).get();

    $('#main-table').find('.item-code').each(function(){
      itemId = $(this).attr('data-item-id');
      total_plan = 0, total_fact = 0;

      groups = $('.num-group[data-item-id="'+itemId+'"]');

      $(visibleMonths).each(function(i){
          obj = groups.filter('[data-month="'+visibleMonths[i]+'"]');
          total_plan += decimal(obj.find('.num-plan').text());
          total_fact += decimal(obj.find('.num-fact').text());
      });

      total_diff=total_plan - total_fact;
      //Period
      obj=$('#main-table').find('.year-group[data-item-id="'+itemId+'"]');
      obj.find('.num-plan').html(total_plan.toFixed(2));
      obj.find('.num-fact').html(total_fact.toFixed(2));
      obj.find('.num-diff').html( total_diff.toFixed(2) );

      //Day
      obj=$('#main-table').find('.day-group[data-item-id="'+itemId+'"]');
      obj.find('.num-plan').html( (total_plan / 365).toFixed(2) );
      obj.find('.num-fact').html( (total_fact / 365).toFixed(2) );
      obj.find('.num-diff').html( (total_diff / 365).toFixed(2) );
    });

  }


  year_total_plan=0;
  year_total_fact=0;
  $('#main-table').find('.year-group[data-level="1"]').each(function(){
    year_total_plan+=decimal($(this).find('.num-plan').text());
    year_total_fact+=decimal($(this).find('.num-fact').text());
  });
  obj=$('.year-total-group');
  obj.find('.num-plan').html(year_total_plan.toFixed(2));
  obj.find('.num-fact').html(year_total_fact.toFixed(2));
  obj.find('.num-diff').html( (year_total_plan - year_total_fact) .toFixed(2));

  day_total_plan=0;
  day_total_fact=0;
  $('#main-table').find('.day-group[data-level="1"]').each(function(){
    day_total_plan+=decimal($(this).find('.num-plan').text());
    day_total_fact+=decimal($(this).find('.num-fact').text());
  });
  obj=$('#main-table').find('.day-total-group');
  obj.find('.num-plan').html(day_total_plan.toFixed(2));
  obj.find('.num-fact').html(day_total_fact.toFixed(2));
  obj.find('.num-diff').html( (day_total_plan - day_total_fact) .toFixed(2));

}

function recountTableTotalFact(item=null){
    current_parent_id=item.attr('data-parent-id');
    item.find('.num-diff').html(( decimal(item.find('.num-plan').text()) - decimal(item.find('.num-fact').text())).toFixed(2));

    total_fact=0;
  for(i=1;i<13;i++){
    //Check if month visible
    if(!$('#main-table .month-head[data-month="'+i+'"]').prop('hidden')){
      obj=$('#main-table .num-group[data-item-id="'+item.attr('data-item-id')+'"][data-month="'+i+'"]');
      total_fact+=decimal(obj.find('.num-fact').text());
    }

  }

  //Period
  obj=$('#main-table .year-group[data-item-id="'+item.attr('data-item-id')+'"]');
  obj.find('.num-fact').html(total_fact.toFixed(2));
  total_plan=decimal(obj.find('.num-plan').text());
  obj.find('.num-diff').html( ( total_plan - total_fact ).toFixed(2) );

  //Day
  obj=$('#main-table .day-group[data-item-id="'+item.attr('data-item-id')+'"]');
  obj.find('.num-fact').html( (total_fact / 365).toFixed(2) );
  total_plan=decimal(obj.find('.num-plan').text());
  obj.find('.num-diff').html( ( (total_plan / 365) - total_fact).toFixed(2) );


    while(current_parent_id!='np'){

      sub_cat_total=0;year_total_fact=0; year_total_diff=0; day_total_fact=0; day_total_diff=0;

      $('#main-table .num-group[data-parent-id="'+current_parent_id+'"][data-month="'+item.attr('data-month')+'"] .num-fact').each(function(){
        sub_cat_total+=decimal($(this).text());
      });
      $('#main-table .year-group[data-parent-id="'+current_parent_id+'"]').each(function(){
        year_total_fact+=decimal($(this).find('.num-fact').text());
        year_total_diff+=decimal($(this).find('.num-diff').text());
      });
      $('#main-table .day-group[data-parent-id="'+current_parent_id+'"]').each(function(){
        day_total_fact+=decimal($(this).find('.num-fact').text());
        day_total_diff+=decimal($(this).find('.num-diff').text());
      });

      head_cat=$('.num-group[data-item-id="'+current_parent_id+'"][data-month="'+item.attr('data-month')+'"]');
      head_cat.find('.num-fact').html(sub_cat_total.toFixed(2));
      head_cat.find('.num-diff').html((sub_cat_total - decimal(head_cat.find('.num-fact').text())).toFixed(2));
      head_cat=$('.year-group[data-item-id="'+current_parent_id+'"]');
      head_cat.find('.num-fact').html(year_total_fact.toFixed(2));
      head_cat.find('.num-diff').html(year_total_diff.toFixed(2));
      head_cat=$('.day-group[data-item-id="'+current_parent_id+'"]');
      head_cat.find('.num-fact').html(day_total_fact.toFixed(2));
      head_cat.find('.num-diff').html(day_total_diff.toFixed(2));

      current_parent_id=head_cat.attr('data-parent-id');
    }


    month_total_plan=0;
    month_total_fact=0;
    month_total_reserve=0;
    month_total_diff=0;
    $('#main-table .num-group[data-level="1"][data-month="'+item.attr('data-month')+'"]').each(function(){
      month_total_plan+=decimal($(this).find('.num-plan').text());
      month_total_fact+=decimal($(this).find('.num-fact').text());
      month_total_reserve+=decimal($(this).find('.num-reserve').text());
      month_total_diff+=decimal($(this).find('.num-diff').text());
    });

    month_group=$('.group-month-total[data-month="'+item.attr('data-month')+'"]');
     month_group.find('.num-total-plan').html(month_total_plan.toFixed(2));
     month_group.find('.num-total-fact').html(month_total_fact.toFixed(2));
     month_group.find('.num-total-reserve').html(month_total_reserve.toFixed(2));
     month_group.find('.num-total-diff').html(month_total_diff.toFixed(2));

recountPeriodDay('1');
}


function inputControls(){
  if(securels.get("usr_bn_budget_planing_redact")=='1'){
    $('#main-table .num-plan').unbind();

    $('#main-table .num-plan:not(.year-cell)').on('blur',function(e){
      recountTableTotalPlan($(this).closest('div.num-group'));
      savePlanItem($(this).closest('div.num-group'));
    });

    $('#main-table .year-cell').on('blur',function(e){
      va = $(this).html();
      splitter= false;
      if(decimal(va) % 12 != 0){splitter=true;}

      base = +(va / 12).toFixed(2);
      sum = 0;


      $(this).closest('.grid-tbody').find('.num-group .num-plan').each(function(){
        gr = $(this).closest('div.num-group');
        if(!splitter){
          $(this).html(base.toFixed(2));
        }
        else{
          if(gr.attr('data-month') != '12'){
            $(this).html(base.toFixed(2));
            sum += base;
          }
          else{
            $(this).html((va - sum).toFixed(2));
          }
        }


        recountTableTotalPlan($(this).closest('div.num-group'));
        savePlanItem($(this).closest('div.num-group'));
      });

      //recountTableTotalPlan($(this).closest('div.num-group'));
      //savePlanItem($(this).closest('div.num-group'));
    });

    $('#main-table .num-plan').on('focusin',function(e){
      if(parseInt($(this).text()) == 0)
        $(this).html('');
    });

    $('#main-table .num-fact').unbind();
    $('#main-table .num-fact[data-editable="1"]').dblclick(function(){
      openMonthDetails($(this).closest('div.num-group'),'budget');
    });

    $("#main-table .num-plan.num-strict").keydown(function (event) {
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

      if(($(this).val().indexOf('.') !== -1 && !$(this).val().includes('.')) && (event.keyCode == 190 && event.keyCode == 110))
          event.preventDefault();
      //if a decimal has been added, disable the "."-button
      });
  }
  else{
    $('#main-table .num-plan').unbind();
    $('#main-table .num-fact').unbind();
  }



}

function filterControls(itemClicked,first_load=false){
  month_num=parseInt($('#main-table').closest('.grid-table').attr('data-num-months'));
  month_cols=parseInt($('#main-table').closest('.grid-table').attr('data-month-cols'));
  total_cols=parseInt($('#main-table').closest('.grid-table').attr('data-total-cols'));
  if(itemClicked.hasClass('filter-plan')){
    if(itemClicked.prop('checked')){
      month_cols--;
      total_cols--;
      $('#main-table').find('.head-plan, .num-plan, .num-total-plan').prop('hidden',true);
    }
    else{
       month_cols++;
       total_cols++;
       $('#main-table').find('.head-plan, .num-plan, .num-total-plan').prop('hidden',false);
    }
  }
  else if(itemClicked.hasClass('filter-fact')){
    if(itemClicked.prop('checked')){
       month_cols--;
       total_cols--;
       $('#main-table').find('.head-fact, .num-fact, .num-total-fact').prop('hidden',true);
    }
    else{
       month_cols++;
       total_cols++;
       $('#main-table').find('.head-fact, .num-fact, .num-total-fact').prop('hidden',false);
    }
  }
  else if(itemClicked.hasClass('filter-reserve')){
    if(itemClicked.prop('checked')){
       month_cols--;
       $('#main-table').find('.head-reserve, .num-reserve, .num-total-reserve').prop('hidden',true);
    }
    else{
       month_cols++;
       $('#main-table').find('.head-reserve, .num-reserve, .num-total-reserve').prop('hidden',false);
    }
  }

  if(itemClicked.hasClass('filter-zero')){
    if(itemClicked.prop('checked')){
      $('.item-code').each(function(){
        cur_item_id=$(this).attr('data-item-id');
        zeros=0;
        $('.num-group[data-item-id="'+cur_item_id+'"] .num-diff').each(function(){
          if(parseFloat($(this).text()) == 0)zeros++;
        })
        if(zeros == 12){
          $(this).css('display','none');
          $('.item-name[data-item-id = "'+cur_item_id+'"], .num-group[data-item-id="'+cur_item_id+'"], .year-group[data-item-id="'+cur_item_id+'"], .day-group[data-item-id="'+cur_item_id+'"]').css('display','none');
        }
      });
    }
    else{
      $('#main-table').find('.item-code, .item-name, .num-group, .year-group, .day-group').css('display','');
    }
  }


  if(itemClicked.is('select')){
    month_num=$('#plan-months').val().length;
    $('#main-table').find('.month-head').each(function(){
      if($('#plan-months').val().includes($(this).attr('data-month'))){
        if($(this).prop('hidden')){
          $(this).prop('hidden',false);
          $('#main-table').find('.month-subhead[data-month="'+$(this).attr('data-month')+'"], .num-group[data-month="'+$(this).attr('data-month')+'"], .group-month-total[data-month="'+$(this).attr('data-month')+'"]').prop('hidden',false);
        }
      }
      else{
        if(!$(this).prop('hidden')){
          $(this).prop('hidden',true);
          $('#main-table').find('.month-subhead[data-month="'+$(this).attr('data-month')+'"], .num-group[data-month="'+$(this).attr('data-month')+'"], .group-month-total[data-month="'+$(this).attr('data-month')+'"]').prop('hidden',true);
        }
      }
    });
    recountPeriodDay();
  }

  $('#main-table').closest('.grid-table').attr('data-num-months',month_num);
  $('#main-table').closest('.grid-table').attr('data-month-cols',month_cols);
  $('#main-table').closest('.grid-table').attr('data-total-cols',total_cols);
  tableGridCss();

  switchPeriodEdit();
  // tableInteractions();
}

function tableGridCss() {
  var month_num = parseInt($('#main-table').closest('.grid-table').attr('data-num-months'));
  var month_cols = parseInt($('#main-table').closest('.grid-table').attr('data-month-cols'));
  var total_cols = parseInt($('#main-table').closest('.grid-table').attr('data-total-cols'));

  var rule = '';
  if (month_num === 0) {
    rule = '160px 200px repeat(2, minmax('+ 80 * month_cols +'px, 100%))';
  } else {
    rule = '160px 200px repeat('+ month_num +', minmax('+ 80 * month_cols +'px, 70%)) repeat(2,minmax('+ 86 * total_cols +'px, 30%))';
  }
  $('#main-table .grid-row').css('grid-template-columns', rule);
}

// function tableInteractions() {
//   $('.grid-td').mouseover(function(){
//     $('.grid-td').removeClass('active-row');
//     var item_id = $(this).attr('data-item-id');
//     if(item_id != undefined) {
//       $('.grid-td[data-item-id="'+item_id+'"]').addClass('active-row');
//     }
//   });
//   $('#main-table').mouseout(function(){
//     $('.grid-td').removeClass('active-row');
//   });
// }


function savePlanItem(item){
  mi={};
  mi.month=item.attr('data-month');
  mi.item_id=item.attr('data-item-id');
  mi.year=$('#budget-year').val();
  mi.value=item.find('.num-plan').text();
  $.ajax({
    type:'POST',
    url:'function_call.php?f=132',
    data:{'fName':'savePlanItem', 'mi':mi},
    cache:false,
    error:function(error){if(!JSON.stringify(error).includes('Session ended!'))alert(JSON.stringify(error)); else CallPulse();},
    success:function(d){
      if(d.answer!='ok')
        toastr.error(dict['error_occurred']+": "+JSON.stringify(d));
    }
  });
}


function rowPlanCategoryTable(values){
  //HEAD
  t='<div class="grid-table annual-plan" data-cat-id="'+values.category.id+'">';
  t+='<div class="grid-content" data-slideout-ignore>';
  max_padding=80;
  if(values.items.length>0)
    max_padding+=parseInt(values.items[values.items.length-1].level) * 20;

  t+='<div class="grid-colspan category-title">'+values.category.title+' - '+values.category.code+'</div>';
  t+='<div class="grid-td grid-th" >'+dict['code']+'</div>';
  t+='<div class="grid-td grid-th" >'+dict['title']+'</div>';
  t+='<div class="grid-td grid-th">'+dict['january']+'</div>';
  t+='<div class="grid-td grid-th">'+dict['february']+'</div>';
  t+='<div class="grid-td grid-th">'+dict['march']+'</div>';
  t+='<div class="grid-td grid-th">'+dict['april']+'</div>';
  t+='<div class="grid-td grid-th">'+dict['may']+'</div>';
  t+='<div class="grid-td grid-th">'+dict['june']+'</div>';
  t+='<div class="grid-td grid-th">'+dict['july']+'</div>';
  t+='<div class="grid-td grid-th">'+dict['august']+'</div>';
  t+='<div class="grid-td grid-th">'+dict['september']+'</div>';
  t+='<div class="grid-td grid-th">'+dict['october']+'</div>';
  t+='<div class="grid-td grid-th">'+dict['november']+'</div>';
  t+='<div class="grid-td grid-th">'+dict['december']+'</div>';
  t+='<div class="grid-td grid-th">'+dict['year']+'</div>';
  t+='<div class="grid-td grid-th">'+dict['day_cost']+'</div>';
  t+='<div class="grid-td grid-th grid-td-last">'+dict['comment']+'</div>';


  //Category items
  for(l=0;l<values.items.length;l++){
    if(!isset(values.items[l].year_costs))values.items[l].year_costs='';
    if(!isset(values.items[l].day_costs))values.items[l].day_costs='';
    if(!isset(values.items[l].comment))values.items[l].comment='';

    editable='true';
    if(values.items.filter(x=>x.parent_id == values.items[l].item_id).length>0)
      editable='false';

    t+='<div class="grid-td fixed item-code bg-white" data-item-id="'+values.items[l].item_id+'" style="left: '+((parseInt(values.items[l].level)-2) * 20 + 10)+'px; margin-left: '+((parseInt(values.items[l].level)-2) * 20)+'px;">'+values.items[l].code+'</div>';
    t+='<div class="grid-td fixed item-name" data-item-id="'+values.items[l].item_id+'">'+values.items[l].title+'</div>';
    for(month_ind=1;month_ind<13;month_ind++){
      if(!isset(values.items[l]['month_'+month_ind]))
        values.items[l]['month_'+month_ind]='';
      t+='<div class="grid-td text-middle text-right plan-cell num-strict month-cell" contenteditable="'+editable+'" data-id="'+values.items[l].id+'" data-item-id="'+values.items[l].item_id+'" data-parent-id="'+values.items[l].parent_id+'" data-level="'+values.items[l].level+'" data-field="month_'+month_ind+'">'+values.items[l]['month_'+month_ind]+'</div>';
    }
    t+='<div class="grid-td text-middle text-right plan-cell num-strict year-cell" contenteditable="'+editable+'" data-id="'+values.items[l].id+'" data-item-id="'+values.items[l].item_id+'" data-parent-id="'+values.items[l].parent_id+'" data-level="'+values.items[l].level+'" data-field="year_costs">'+values.items[l].year_costs+'</div>';
    t+='<div class="grid-td text-middle text-right plan-cell num-strict day-cell" contenteditable="'+editable+'" data-id="'+values.items[l].id+'" data-item-id="'+values.items[l].item_id+'" data-parent-id="'+values.items[l].parent_id+'" data-level="'+values.items[l].level+'" data-field="day_costs">'+values.items[l].day_costs+'</div>';
    t+='<div class="grid-td grid-td-last plan-cell" contenteditable="true" data-id="'+values.items[l].id+'" data-item-id="'+values.items[l].item_id+'" data-field="comment">'+values.items[l].comment+'</div>';
  }

  //Category Totals
  t+='<div class="grid-td grid-empty bg-white fixed" style="left:10px;"></div>';
  t+='<div class="grid-td">'+dict['total']+'</div>';
  for(month_ind=1;month_ind<13;month_ind++)
    t+='<div class="grid-td total-cell" data-total-ref="month_'+month_ind+'">0.000</div>';
  t+='<div class="grid-td total-cell" data-total-ref="year_costs">0.000</div>';
  t+='<div class="grid-td grid-td-last total-cell" data-total-ref="day_costs">0.000</div>';
  t+='<div class="grid-td grid-empty bg-white fixed" style="left:10px;"></div>';

  t+='</div>';
  t+='</div>';

  return t;
}







function rowFactCategoryTable(values){
  //HEAD
  t='<div class="grid-table annual-fact" data-cat-id="'+values.category.id+'">';
  t+='<div class="grid-content" data-slideout-ignore>';

  t+='<div class="grid-colspan category-title">'+values.category.title+' - '+values.category.code+'</div>';
  t+='<div class="grid-td grid-th" >'+dict['code']+'</div>';
  t+='<div class="grid-td grid-th">'+dict['title']+'</div>';
  t+='<div class="grid-td grid-th">'+dict['january']+'</div>';
  t+='<div class="grid-td grid-th">'+dict['february']+'</div>';
  t+='<div class="grid-td grid-th">'+dict['march']+'</div>';
  t+='<div class="grid-td grid-th">'+dict['april']+'</div>';
  t+='<div class="grid-td grid-th">'+dict['may']+'</div>';
  t+='<div class="grid-td grid-th">'+dict['june']+'</div>';
  t+='<div class="grid-td grid-th">'+dict['july']+'</div>';
  t+='<div class="grid-td grid-th">'+dict['august']+'</div>';
  t+='<div class="grid-td grid-th">'+dict['september']+'</div>';
  t+='<div class="grid-td grid-th">'+dict['october']+'</div>';
  t+='<div class="grid-td grid-th">'+dict['november']+'</div>';
  t+='<div class="grid-td grid-th">'+dict['december']+'</div>';
  t+='<div class="grid-td grid-th">'+dict['year']+'</div>';
  t+='<div class="grid-td grid-th">'+dict['day_cost']+'</div>';
  t+='<div class="grid-td grid-th grid-td-last">'+dict['comment']+'</div>';



  //Category items
  for(l=0;l<values.items.length;l++){
    if(!isset(values.items[l].year_costs))values.items[l].year_costs='';
    if(!isset(values.items[l].day_costs))values.items[l].day_costs='';
    if(!isset(values.items[l].comment))values.items[l].comment='';

    editable='1';
    if(values.items.filter(x=>x.parent_id == values.items[l].item_id).length>0)
      editable='0';

    t+='<div class="grid-td fixed fact-code item-code" data-item-id="'+values.items[l].item_id+'" style="margin-left: '+((parseInt(values.items[l].level)-2) * 20)+'px;">'+values.items[l].code+'</div>';
    t+='<div class="grid-td fixed item-name" data-item-id="'+values.items[l].item_id+'">'+values.items[l].title+'</div>';
    for(month_ind=1;month_ind<13;month_ind++){
      if(values.items[l]['month_'+month_ind]==0)
        values.items[l]['month_'+month_ind]='';
      else values.items[l]['month_'+month_ind]=decimal(values.items[l]['month_'+month_ind]).toFixed(2);

      t+='<div class="grid-td text-middle text-right fact-cell num-strict month-cell" data-editable="'+editable+'"  data-id="'+values.items[l].id+'" data-item-id="'+values.items[l].item_id+'" data-parent-id="'+values.items[l].parent_id+'" data-level="'+values.items[l].level+'" data-field="month_'+month_ind+'">'+values.items[l]['month_'+month_ind]+'</div>';
    }
    t+='<div class="grid-td text-middle text-right fact-cell num-strict year-cell" data-editable="'+editable+'"  data-id="'+values.items[l].id+'" data-item-id="'+values.items[l].item_id+'" data-parent-id="'+values.items[l].parent_id+'" data-level="'+values.items[l].level+'" data-field="year_costs">'+values.items[l].year_costs+'</div>';
    t+='<div class="grid-td text-middle text-right fact-cell num-strict day-cell" data-editable="'+editable+'" data-id="'+values.items[l].id+'" data-item-id="'+values.items[l].item_id+'" data-parent-id="'+values.items[l].parent_id+'" data-level="'+values.items[l].level+'" data-field="day_costs">'+values.items[l].day_costs+'</div>';
    t+='<div class="grid-td grid-td-last fact-cell" contenteditable="true" data-id="'+values.items[l].id+'" data-item-id="'+values.items[l].item_id+'" data-field="comment">'+values.items[l].comment+'</div>';
  }

  //Category Totals
  t+='<div class="grid-td fixed grid-empty" ></div>';
  t+='<div class="grid-td">'+dict['total']+'</div>';
  for(month_ind=1;month_ind<13;month_ind++)
    t+='<div class="grid-td total-cell" data-total-ref="month_'+month_ind+'">0.000</div>';
  t+='<div class="grid-td total-cell" data-total-ref="year_costs">0.000</div>';
  t+='<div class="grid-td grid-td-last total-cell" data-total-ref="day_costs">0.000</div>';
  t+='<div class="grid-td grid-empty"></div>';

  t+='</div>';
  t+='</div>';

  return t;
}


function budgetExpandToggle(el, recursive = false) {
  el.toggleClass('expanded');
  itemId = $(el).parent().attr('data-item-id');
  $('#main-table').find('.grid-tbody[data-parent-id='+itemId+']').toggleClass('collapsed expanded');

  // Stop recursion after this
  if(recursive) {
    return;
  }

  // Recursively run for all children elements on collapse only
  if (!$(el).hasClass('expanded')) {
    children = getAllChildIds(itemId);
    $(children).each(function(i) {
      budgetExpandToggle($('#main-table .item-code[data-item-id="'+children[i]+'"] .budget-child-expand.expanded'), true);
    });
  }
}

function getAllChildIds(parentId) {
  childIds = [];

  // Function to recursively find child IDs
  function findChildren(parentId) {
    children = $('.item-code[data-parent-id="'+parentId+'"]');
    $(children).each(function(i) {
      childId = $(this).attr('data-item-id');
      childIds.push(childId);
      // Recursively find children
      findChildren(childId);
    });
  }

  findChildren(parentId);

  return childIds;
}

function searchItem(){
  $('#main-table .grid-tbody.expanded').not('[data-parent-id="np"]').toggleClass('expanded collapsed');
  $('#main-table .budget-child-expand').removeClass('expanded');
  $('#expand-plan').html('<i class="bi bi-arrows-expand mr-0"></i>');
  $('#expand-plan').removeClass('expanded');
  toggleExpandPlan($('#expand-plan'));
  txt=$('#budget-search').val();
  if(txt.length > 0){
    c=cats.find(x=>x.code == txt.toLowerCase());
    if(isset(c)){
      el=document.querySelector("#main-table .item-code[data-item-id='"+c.id+"']");
      if (el) {
        el.scrollIntoView({block: 'center'});
        row_elements = $('.grid-td[data-item-id="'+c.id+'"]');
        $(row_elements).each(function(){
          $(this).addClass('row-highlight');
          setTimeout(() => {
            $(this).removeClass('row-highlight');
          }, 2000);
        })
      }
    }
  }
}



function toggleExpandPlan(el) {
  if(el.hasClass('expanded')) {
    $('#main-table .grid-tbody.expanded').not('[data-parent-id="np"]').toggleClass('expanded collapsed');
    $('#main-table .budget-child-expand').removeClass('expanded');
    el.html('<i class="bi bi-arrows-expand mr-0"></i>');
    el.removeClass('expanded');
  } else {
    $('#main-table .grid-tbody.collapsed').not('[data-parent-id="np"]').toggleClass('expanded collapsed');
    $('#main-table .budget-child-expand').addClass('expanded');
    el.html('<i class="bi bi-arrows-collapse mr-0"></i>');
    el.addClass('expanded');
  }
}

function initBudgetChart(){
  $('#chart-months').closest('div').find('.chartjs-size-monitor').remove();
  $('#chart-months').replaceWith('<canvas id="chart-months"></canvas>');

  if($('#bud-annual-plan-tab-classic').attr('data-init-count') == '0')
    loadBudgetPlanningFact($('#bud-annual-plan-tab-classic'));
  if($('#bud-annual-fact-tab-classic').attr('data-init-count') == '0')
    loadBudgetPlanningFact($('#bud-annual-fact-tab-classic'));

  planned_chart=[];
  fact_chart=[];
  for(i=1;i<13;i++){
    pmonth_super_total=0;fmonth_super_total=0;
    $('.annual-plan .total-cell[data-total-ref="month_'+i+'"]').each(function(){ pmonth_super_total+=decimal($(this).text()); });
    $('.annual-fact .total-cell[data-total-ref="month_'+i+'"]').each(function(){ fmonth_super_total+=decimal($(this).text()); });
    planned_chart.push(pmonth_super_total.toFixed(2));
    fact_chart.push(fmonth_super_total.toFixed(2));
  }

  var ctxL = document.getElementById("chart-months").getContext('2d');
  var myLineChart = new Chart(ctxL, {
    type: 'line',
    data: {
      labels: [dict['january'], dict['february'], dict['march'], dict['april'], dict['may'], dict['june'], dict['july'],dict['august'],dict['september'],dict['october'],dict['november'],dict['december']],
      datasets: [{
        label: dict['planned'],
        data: planned_chart,
        backgroundColor: ['rgba(76, 175, 80, .2)'],
        borderColor: ['rgba(76, 175, 80, .7)'],
        borderWidth: 2
      },
      {
        label: dict['by_fact'],
        data: fact_chart,
        backgroundColor: ['rgba(244, 67, 54, 0.2)'],
        borderColor: ['rgba(244, 67, 54, 0.7)'],
        borderWidth: 2
      }
    ]
  },
  options: {
    responsive: true,
    maintainAspectRatio: false
  }
  });
}




function printData(){
  if($('#bud-month-chart-tab-classic').hasClass('active')){
    $('#chart-months').css('width','1200px');
    printJS({ printable: "bud-month-chart-tab", type: "html", documentTitle: dict['budget_chart_year_for_vessel'].replace("@year",$('#budget-year').val()).replace("@vessel",$('#selected-vessel').text())});
    //$('#running-total-tab').kinziPrint();
    $('#chart-months').css('width','');
  }
  else if($('#bud-annual-plan-tab-classic').hasClass('active')){
    $('#print-content').html(preparePlanFactPrintForm('plan'));
    $('#print-iframe').prop('hidden',false);
    $('#print-content table tr').css('page-break-inside','avoid');
    document.getElementById('print-iframe').contentWindow.document.getElementsByTagName('body')[0].innerHTML=$('#iframe-content').html();
    document.getElementById('print-iframe').contentWindow.print();
    $('#print-iframe').prop('hidden',true);
  }

  else if($('#bud-annual-fact-tab-classic').hasClass('active')){
    $('#print-content').html(preparePlanFactPrintForm('fact'));
    $('#print-iframe').prop('hidden',false);
    $('#print-content table tr').css('page-break-inside','avoid');
    document.getElementById('print-iframe').contentWindow.document.getElementsByTagName('body')[0].innerHTML=$('#iframe-content').html();
    document.getElementById('print-iframe').contentWindow.print();
    $('#print-iframe').prop('hidden',true);
  }
}



function preparePlanFactPrintForm(type='plan'){
  title=dict['planned_budget_year'].replace("@year",$('#budget-year').val());
  tables=".annual-plan";
  cell_title="plan-cell";
  if(type=='fact'){
    title=dict['fact_budget_year'].replace('@year',$('#budget-year').val());
    tables='.annual-fact';
    cell_title="fact-cell";
  }
  //Head
  form="<table style='width:100%;'>";
  form+="<tr><td colspan='4'>"+title+"</td></tr>";
  form+="<tr><td width='10%'>"+dict['vessel']+":</td><td width='40%'>"+$('#selected-vessel').text()+"</td><td width='10%'>"+dict['date']+":</td><td width='40%'>"+getCurrentDate('web')+"</td></tr>";
  form+="<tr><td width='10%'>"+dict['building_year']+":</td><td width='40%'>"+ship.Name+"</td><td width='10%'>"+dict['currency']+":</td><td width='40%'>"+ship.budget_currency+"</td></tr>";
  form+="<tr><td width='10%'>"+dict['type']+":</td><td width='40%'>"+ship.vessel_type+"</td><td width='10%'>"+dict['days']+":</td><td width='40%'>365</td></tr>";
  form+="</table>";

  //Form Table
  $(tables).each(function(){
    table_elem=$(this);
    form+="<br><b>"+table_elem.find('.category-title').text()+"</b><br>";
    form+="<table class='print-item-table' style='width:100%;'>";
    form+="<tr>";
    form+='<td style="min-width: 50px;">'+dict['code']+'</td>';
    form+='<td style="min-width: 80px">'+dict['title']+'</td>';
    form+='<td style="min-width: 70px;">'+dict['january']+'</td>';
    form+='<td style="min-width: 70px;">'+dict['february']+'</td>';
    form+='<td style="min-width: 70px;">'+dict['march']+'</td>';
    form+='<td style="min-width: 70px;">'+dict['april']+'</td>';
    form+='<td style="min-width: 70px;">'+dict['may']+'</td>';
    form+='<td style="min-width: 70px;">'+dict['june']+'</td>';
    form+='<td style="min-width: 70px;">'+dict['july']+'</td>';
    form+='<td style="min-width: 70px;">'+dict['august']+'</td>';
    form+='<td style="min-width: 70px;">'+dict['september']+'</td>';
    form+='<td style="min-width: 70px;">'+dict['october']+'</td>';
    form+='<td style="min-width: 70px;">'+dict['november']+'</td>';
    form+='<td style="min-width: 70px;">'+dict['december']+'</td>';
    form+='<td style="min-width: 70px;">'+dict['year']+'</td>';
    form+='<td style="min-width: 70px;">'+dict['day_cost']+'</td>';
    form+='<td style="min-width: 80px">'+dict['comment']+'</td>';
    form+="</tr>";

    table_elem.find('.item-code').each(function(){
      item_id=$(this).attr('data-item-id');
      form+="<tr>";
      form+="<td>"+$(this).text()+"</td>";
      form+="<td>"+table_elem.find('.item-name[data-item-id="'+item_id+'"]').text()+"</td>";
      for(i=1;i<13;i++)
        form+="<td>"+table_elem.find('.month-cell[data-item-id="'+item_id+'"][data-field="month_'+i+'"]').text()+"</td>";
      form+="<td>"+table_elem.find('.year-cell[data-item-id="'+item_id+'"]').text()+"</td>";
      form+="<td>"+table_elem.find('.day-cell[data-item-id="'+item_id+'"]').text()+"</td>";
      form+="<td>"+table_elem.find('.'+cell_title+'[data-field="comment"][data-item-id="'+item_id+'"]').text()+"</td>";
      form+="</tr>";
    });

    //Totals
    form+="<tr>";
    form+="<td colspan='2' align='right'>"+dict['total']+"</td>";
    for(i=1;i<13;i++)
      form+="<td>"+table_elem.find('.total-cell[data-total-ref="month_'+i+'"]').text()+"</td>";

    form+="<td>"+table_elem.find('.total-cell[data-total-ref="year_costs"]').text()+"</td>";
    form+="<td>"+table_elem.find('.total-cell[data-total-ref="day_costs"]').text()+"</td>";
    form+="</tr>";

    form+="</table>";

  })

   return form;
}



function sysModuleAccess(return_values_only=false){
  if(!return_values_only){
    if(securels.get("usr_bn_budget_planning_template")=='1'){
      $('#bud-template-new-category, #bud-template-new-item, #bud-template-save-order, #bud-template-item-save, #bud-template-cat-save, #bud-month-add-deduction').prop('disabled',false);
      $('#bud-template-item-code, #bud-template-item-title, #bud-template-cat-title, #bud-template-cat-code').prop('readonly',false);
      $('#bud-template-item-enabled, #bud-template-cat-enabled').closest('label').css('display','');
      mdbSelectState('bud-template-item-cat',true);
    }
    if(securels.get("usr_bn_budget_planing_redact")=='1'){
      $('#bud-month-add-deduction').prop('disabled',false);
    }
  }
  else{
   vals={};
   vals.usr_bn_budget_planning_template=securels.get("usr_bn_budget_planning_template");
   vals.usr_bn_budget_planing_redact=securels.get("usr_bn_budget_planing_redact");
   return vals;
  }
}



function exportToExcel(){
  params={};
  params.year = $('#budget-year').val();
  params.months=$('#plan-months').val();
  params.zero_values = cBoolToInt($('#plan-hide-zero').prop('checked'));
  params.budget_column = cBoolToInt($('#plan-hide-budget').prop('checked'));
  params.reserved_column = cBoolToInt($('#plan-hide-reserved').prop('checked'));
  params.fact_column = cBoolToInt($('#plan-hide-fact').prop('checked'));
  params.overbudget='0';
  if($('#bud-overbudget-tab-classic').hasClass('active'))params.overbudget='1';


  $.ajax({
    type:'POST',
    url:'function_call.php?f=706',
    data:{'fName':'budgetExport','params':params},
    cache:false,
    error:function(error){if(!JSON.stringify(error).includes('Session ended!'))alert(JSON.stringify(error)); else CallPulse();},
    beforeSend:function(){ ShowLoader();},
    complete:function(){HideLoader();},
    success:function(d){

      if(d.includes('budget_export'))
      window.open('excel/budget_export.php','_blank');
    }
  });
}

function openBCodeBreakdown(elem) {
  $('#bud-code-breakdown-modal').modal('show');

  $('#bud-code-breakdown-modal-title').html(elem.attr('data-title'));
  $('#bud-code-breakdown-year').val($('budget-year').val());

  item_id = elem.attr('data-item-id');
  $('.num-group[data-item-id="'+item_id+'"]').each(function(){
    gr = $('#bud-code-breakdown-list [data-month="'+$(this).attr('data-month')+'"]');
    gr.find('.budget').html($(this).find('.num-plan').text());
    gr.find('.fact').html($(this).find('.num-fact').text());
    gr.find('.reserved').html($(this).find('.num-reserve').text());
    gr.find('.diff').html($(this).find('.num-diff').text());

  });
}
