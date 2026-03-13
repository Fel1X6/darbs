function loadOverbudget(tab=null){

    values=[];
    head_cats=cats.filter(x=>x.parent_id == 'np' && x.overbudget_item == '1');
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

        $('#ob-main-table').html(obTable(values));
        obfilterControls($('#ob-plan-months'));
        recountTableTotalOB();
  
        obinputControls();

        obrecountPeriodDay();
  
        $('.ui-search input').on('input', function () {
          if ($(this).val().length > 0) {
            $(this).parent().addClass('notempty');
          } else {
            $(this).parent().removeClass('notempty');
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



  function obTable(values){
    $('#ob-main-table').empty();
    $('#ob-main-table').closest('.grid-table').attr('data-num-months',12);
    $('#ob-main-table').closest('.grid-table').attr('data-month-cols',4);
    $('#ob-main-table').closest('.grid-table').attr('data-total-cols',3);
    current_month=parseInt(getCurrentDate('DB').split('-')[1]);
  
  
    head='<div class="grid-row grid-thead"><div class="grid-td grid-th grid-empty masked-offset" style="grid-column: span 2;"><div class="d-flex align-items-center">'+
    '<button onclick="toggleExpandOB($(this));" id="expand-ob" class="btn btn-secondary btn-sm waves-effect mr-2"><i class="bi bi-arrows-expand mr-0"></i></button>'+
    '<div class="mb-0 flex-grow-1 mr-2">'+
      '<input type="text" id="ob-budget-search" class="ui-search__input form-control" placeholder="Search">'+
      '<span class="bi bi-x reset" onclick="resetSearch($(this));" style="display: none; color: #000;"></span>'+
    '</div>'+
    '<button onclick="searchOBItem();" id="budget-item-search" class="btn btn-primary btn-square waves-effect"><i class="bi bi-search mr-0"></i></button>'+
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
          expand_btn='<span class="budget-child-expand" onclick="obbudgetExpandToggle($(this))"></span>';
        }
  
        visibility='collapsed';
        if(hasChild='true' && parseInt(values[z][i].level) == 1) {
          visibility='expanded';
        }
  
        html+='<!-- Row: '+values[z][i].code+' -->';
        if(visibility=='collapsed') {
          html+='<div class="grid-row grid-tbody collapsed" data-item-id="'+values[z][i].id+'" data-parent-id="'+values[z][i].parent_id+'">';
        } else {
          html+='<div class="grid-row grid-tbody" data-item-id="'+values[z][i].id+'" data-parent-id="'+values[z][i].parent_id+'">';
        }
  
        html+='<div class="grid-td fixed item-code bg-white"  data-item-id="'+values[z][i].id+'" data-parent-id="'+values[z][i].parent_id+'" style="left: '+(((lvl = parseInt(values[z][i].level)-1) > 0) ? lvl * 20 + 10 : 0.5 * 20)+'px; margin-left: '+(((lvl = parseInt(values[z][i].level)-1) > 0) ? lvl * 20 : 0 * 20)+'px; padding-left: 16px;">'+expand_btn+values[z][i].code+'</div>';
        html+='<div class="grid-td fixed item-name" data-item-id="'+values[z][i].id+'" data-parent-id="'+values[z][i].parent_id+'">'+values[z][i].title+'</div>';
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
            html+='<div class="grid-td text-middle text-right num-plan">0</div>';
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


  function obfilterControls(itemClicked,first_load=false){
    month_num=parseInt($('#ob-main-table').closest('.grid-table').attr('data-num-months'));
    month_cols=parseInt($('#ob-main-table').closest('.grid-table').attr('data-month-cols'));
    total_cols=parseInt($('#ob-main-table').closest('.grid-table').attr('data-total-cols'));
    if(itemClicked.hasClass('filter-plan')){
      if(itemClicked.prop('checked')){
        month_cols--;
        total_cols--;
        $('#ob-main-table').find('.head-plan, .num-plan, .num-total-plan').prop('hidden',true);
      }
      else{
         month_cols++;
         total_cols++;
         $('#ob-main-table').find('.head-plan, .num-plan, .num-total-plan').prop('hidden',false);
      }
    }
    else if(itemClicked.hasClass('filter-fact')){
      if(itemClicked.prop('checked')){
         month_cols--;
         total_cols--;
         $('#ob-main-table').find('.head-fact, .num-fact, .num-total-fact').prop('hidden',true);
      }
      else{
         month_cols++;
         total_cols++;
         $('#ob-main-table').find('.head-fact, .num-fact, .num-total-fact').prop('hidden',false);
      }
    }
    else if(itemClicked.hasClass('filter-reserve')){
      if(itemClicked.prop('checked')){
         month_cols--;
         $('#ob-main-table').find('.head-reserve, .num-reserve, .num-total-reserve').prop('hidden',true);
      }
      else{
         month_cols++;
         $('#ob-main-table').find('.head-reserve, .num-reserve, .num-total-reserve').prop('hidden',false);
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
        $('#ob-main-table').find('.item-code, .item-name, .num-group, .year-group, .day-group').css('display','');
      }
    }
  
  
    if(itemClicked.is('select')){
      month_num=$('#ob-plan-months').val().length;
      $('#ob-main-table').find('.month-head').each(function(){
        if($('#ob-plan-months').val().includes($(this).attr('data-month'))){
          if($(this).prop('hidden')){
            $(this).prop('hidden',false);
            $('#ob-main-table').find('.month-subhead[data-month="'+$(this).attr('data-month')+'"], .num-group[data-month="'+$(this).attr('data-month')+'"], .group-month-total[data-month="'+$(this).attr('data-month')+'"]').prop('hidden',false);
          }
        }
        else{
          if(!$(this).prop('hidden')){
            $(this).prop('hidden',true);
            $('#ob-main-table').find('.month-subhead[data-month="'+$(this).attr('data-month')+'"], .num-group[data-month="'+$(this).attr('data-month')+'"], .group-month-total[data-month="'+$(this).attr('data-month')+'"]').prop('hidden',true);
          }
        }
      });
      recountTableTotalOB();
    }
  
    $('#ob-main-table').closest('.grid-table').attr('data-num-months',month_num);
    $('#ob-main-table').closest('.grid-table').attr('data-month-cols',month_cols);
    $('#ob-main-table').closest('.grid-table').attr('data-total-cols',total_cols);
    obtableGridCss();
    // obtableInteractions();
  }


  function searchOBItem(){
    $('#ob-main-table .grid-tbody.expanded').not('[data-parent-id="np"]').toggleClass('expanded collapsed');
    $('#ob-main-table .budget-child-expand').removeClass('expanded');
    $('#expand-ob').html('<i class="bi bi-arrows-expand mr-0"></i>');
    $('#expand-ob').removeClass('expanded');
    toggleExpandOB($('#expand-ob'));
    txt=$('#ob-budget-search').val();
    if(txt.length > 0){
      c=cats.find(x=>x.code == txt.toLowerCase());
      if(isset(c)){
        el=document.querySelector("#ob-main-table .item-code[data-item-id='"+c.id+"']");
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


  function obtableGridCss() {
    var month_num = parseInt($('#ob-main-table').closest('.grid-table').attr('data-num-months'));
    var month_cols = parseInt($('#ob-main-table').closest('.grid-table').attr('data-month-cols'));
    var total_cols = parseInt($('#ob-main-table').closest('.grid-table').attr('data-total-cols'));
  
    var rule = '';
    if (month_num === 0) {
      rule = '160px 200px repeat(2, minmax('+ 80 * month_cols +'px, 100%))';
    } else {
      rule = '160px 200px repeat('+ month_num +', minmax('+ 80 * month_cols +'px, 70%)) repeat(2,minmax('+ 86 * total_cols +'px, 30%))';
    }
    $('#ob-main-table .grid-row').css('grid-template-columns', rule);
  }
  
  // function obtableInteractions() {
  //   $('#ob-main-table .grid-td').mouseover(function(){
  //     $('#ob-main-table .grid-td').removeClass('active-row');
  //     var item_id = $(this).attr('data-item-id');
  //     if(item_id != undefined) {
  //       $('#ob-main-table .grid-td[data-item-id="'+item_id+'"]').addClass('active-row');
  //     }
  //   });
  //   $('#ob-main-table').mouseout(function(){
  //     $('#ob-main-table .grid-td').removeClass('active-row');
  //   });
  // }



  function recountTableTotalOB(item=null){
    if(item == null){
      for(i=1;i<13;i++){
        month_total_plan=0;
        month_total_fact=0;
        month_total_reserve=0;
        month_total_diff=0;
        $('#ob-main-table').find('.num-group[data-level="1"][data-month="'+i+'"]').each(function(){
          month_total_plan+=decimal($(this).find('.num-plan').text());
          month_total_fact+=decimal($(this).find('.num-fact').text());
          month_total_reserve+=decimal($(this).find('.num-reserve').text());
          month_total_diff+=decimal($(this).find('.num-diff').text());
        });
  
        month_group=$('#ob-main-table').find('.group-month-total[data-month="'+i+'"]');
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
        if(!$('#ob-main-table').find('.month-head[data-month="'+i+'"]').prop('hidden')){
          obj=$('#ob-main-table').find('.num-group[data-item-id="'+item.attr('data-item-id')+'"][data-month="'+i+'"]');
          total_plan+=decimal(obj.find('.num-plan').text());
        }
  
      }
      //Period
      obj=$('#ob-main-table').find('.year-group[data-item-id="'+item.attr('data-item-id')+'"]');
      obj.find('.num-plan').html(total_plan.toFixed(2));
      total_fact=decimal(obj.find('.num-fact').text());
      obj.find('.num-diff').html( ( total_plan - total_fact ).toFixed(2) );
  
      //Day
      obj=$('#ob-main-table').find('.day-group[data-item-id="'+item.attr('data-item-id')+'"]');
      obj.find('.num-plan').html( (total_plan / 365).toFixed(2) );
      total_fact=decimal(obj.find('.num-fact').text());
      obj.find('.num-diff').html( ( (total_plan / 365) - total_fact).toFixed(2) );
  
  
      while(current_parent_id!='np'){
  
        sub_cat_total=0; year_total_plan=0; year_total_diff=0; day_total_plan=0; day_total_diff=0;
  
        $('#ob-main-table').find('.num-group[data-parent-id="'+current_parent_id+'"][data-month="'+item.attr('data-month')+'"] .num-plan').each(function(){
          sub_cat_total+=decimal($(this).text());
        });
        $('#ob-main-table').find('.year-group[data-parent-id="'+current_parent_id+'"]').each(function(){
          year_total_plan+=decimal($(this).find('.num-plan').text());
          year_total_diff+=decimal($(this).find('.num-diff').text());
        });
        $('#ob-main-table').find('.day-group[data-parent-id="'+current_parent_id+'"]').each(function(){
          day_total_plan+=decimal($(this).find('.num-plan').text());
          day_total_diff+=decimal($(this).find('.num-diff').text());
        });
  
        head_cat=$('#ob-main-table').find('.num-group[data-item-id="'+current_parent_id+'"][data-month="'+item.attr('data-month')+'"]');
        head_cat.find('.num-plan').html(sub_cat_total.toFixed(2));
        head_cat.find('.num-diff').html((sub_cat_total - decimal(head_cat.find('.num-fact').text())).toFixed(2));
        head_cat=$('#ob-main-table').find('.year-group[data-item-id="'+current_parent_id+'"]');
        head_cat.find('.num-plan').html(year_total_plan.toFixed(2));
        head_cat.find('.num-diff').html(year_total_diff.toFixed(2));
        head_cat=$('#ob-main-table').find('.day-group[data-item-id="'+current_parent_id+'"]');
        head_cat.find('.num-plan').html(day_total_plan.toFixed(2));
        head_cat.find('.num-diff').html(day_total_diff.toFixed(2));
  
  
  
        current_parent_id=head_cat.attr('data-parent-id');
      }
  
  
      month_total_plan=0;
      month_total_fact=0;
      month_total_reserve=0;
      month_total_diff=0;
      $('#ob-main-table').find('.num-group[data-level="1"][data-month="'+item.attr('data-month')+'"]').each(function(){
        month_total_plan+=decimal($(this).find('.num-plan').text());
        month_total_fact+=decimal($(this).find('.num-fact').text());
        month_total_reserve+=decimal($(this).find('.num-reserve').text());
        month_total_diff+=decimal($(this).find('.num-diff').text());
      });
  
      month_group=$('#ob-main-table').find('.group-month-total[data-month="'+item.attr('data-month')+'"]');
       month_group.find('.num-total-plan').html(month_total_plan.toFixed(2));
       month_group.find('.num-total-fact').html(month_total_fact.toFixed(2));
       month_group.find('.num-total-reserve').html(month_total_reserve.toFixed(2));
       month_group.find('.num-total-diff').html(month_total_diff.toFixed(2));
 
       obrecountPeriodDay('1');
    }
  
  
  
  }
  
  function obrecountPeriodDay(item=null){
    if(item == null){
      visibleMonths = $('#ob-main-table').find('.month-head:not([hidden])').map(function(){
        return $(this).data('month');
      }).get();
  
      $('#ob-main-table').find('.item-code').each(function(){
        itemId = $(this).attr('data-item-id');
        total_plan = 0, total_fact = 0;
  
        groups = $('#ob-main-table .num-group[data-item-id="'+itemId+'"]');
  
        $(visibleMonths).each(function(i){
            obj = groups.filter('[data-month="'+visibleMonths[i]+'"]');
            total_plan += decimal(obj.find('.num-plan').text());
            total_fact += decimal(obj.find('.num-fact').text());
        });
  
        total_diff=total_plan - total_fact;
        //Period
        obj=$('#ob-main-table').find('.year-group[data-item-id="'+itemId+'"]');
        obj.find('.num-plan').html(total_plan.toFixed(2));
        obj.find('.num-fact').html(total_fact.toFixed(2));
        obj.find('.num-diff').html( total_diff.toFixed(2) );
  
        //Day
        obj=$('#ob-main-table').find('.day-group[data-item-id="'+itemId+'"]');
        obj.find('.num-plan').html( (total_plan / 365).toFixed(2) );
        obj.find('.num-fact').html( (total_fact / 365).toFixed(2) );
        obj.find('.num-diff').html( (total_diff / 365).toFixed(2) );
      });
  
    }
  
 
    year_total_plan=0;
    year_total_fact=0;
    $('#ob-main-table').find('.year-group[data-level="1"]').each(function(){
      year_total_plan+=decimal($(this).find('.num-plan').text());
      year_total_fact+=decimal($(this).find('.num-fact').text());
    });
    obj=$('#ob-main-table .year-total-group');
    obj.find('.num-plan').html(year_total_plan.toFixed(2));
    obj.find('.num-fact').html(year_total_fact.toFixed(2));
    obj.find('.num-diff').html( (year_total_plan - year_total_fact) .toFixed(2));
  
    day_total_plan=0;
    day_total_fact=0;
    $('#ob-main-table').find('.day-group[data-level="1"]').each(function(){
      day_total_plan+=decimal($(this).find('.num-plan').text());
      day_total_fact+=decimal($(this).find('.num-fact').text());
    });
    obj=$('#ob-main-table').find('.day-total-group');
    obj.find('.num-plan').html(day_total_plan.toFixed(2));
    obj.find('.num-fact').html(day_total_fact.toFixed(2));
    obj.find('.num-diff').html( (day_total_plan - day_total_fact) .toFixed(2));
  
  }

  function toggleExpandOB(el) {
    if(el.hasClass('expanded')) {
      $('#ob-main-table .grid-tbody.expanded').not('[data-parent-id="np"]').toggleClass('expanded collapsed');
      $('#ob-main-table .budget-child-expand').removeClass('expanded');
      el.html('<i class="bi bi-arrows-expand mr-0"></i>');
      el.removeClass('expanded');
    } else {
      $('#ob-main-table .grid-tbody.collapsed').not('[data-parent-id="np"]').toggleClass('expanded collapsed');
      $('#ob-main-table .budget-child-expand').addClass('expanded');
      el.html('<i class="bi bi-arrows-collapse mr-0"></i>');
      el.addClass('expanded');
    }
  }

  function obbudgetExpandToggle(el, recursive = false) {
    el.toggleClass('expanded');
    itemId = $(el).parent().attr('data-item-id');
    $('#ob-main-table').find('.grid-tbody[data-parent-id='+itemId+']').toggleClass('collapsed expanded');
  
    // Stop recursion after this
    if(recursive) {
      return;
    }
  
    // Recursively run for all children elements on collapse only
    if (!$(el).hasClass('expanded')) {
      children = getAllChildIds(itemId);
      $(children).each(function(i) {
        obbudgetExpandToggle($('#ob-main-table .item-code[data-item-id="'+children[i]+'"] .budget-child-expand.expanded'), true);
      });
    }
  }


  function obinputControls(){
    if(securels.get("usr_bn_budget_planing_redact")=='1'){
      $('#ob-main-table .num-plan').unbind();
  
      $('#ob-main-table .num-plan').on('blur',function(e){
        recountTableTotalOB($(this).closest('div.num-group'));
        savePlanItem($(this).closest('div.num-group'));
      });
      $('#ob-main-table .num-plan').on('focusin',function(e){
        if(parseInt($(this).text()) == 0)
          $(this).html('');
      });
  
      $('#ob-main-table .num-fact').unbind();
      $('#ob-main-table .num-fact[data-editable="1"]').dblclick(function(){
        openMonthDetails($(this).closest('div.num-group'),'overbuget');
      });
  
      $("#ob-main-table .num-plan.num-strict").keydown(function (event) {
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
      $('#ob-main-table .num-plan').unbind();
      $('#ob-main-table .num-fact').unbind();
    }
  
  
  
  }


  function obrecountTableTotalFact(item=null){
    current_parent_id=item.attr('data-parent-id');
    item.find('.num-diff').html(( decimal(item.find('.num-plan').text()) - decimal(item.find('.num-fact').text())).toFixed(2));

    total_fact=0;
  for(i=1;i<13;i++){
    //Check if month visible
    if(!$('#ob-main-table .month-head[data-month="'+i+'"]').prop('hidden')){
      obj=$('#ob-main-table .num-group[data-item-id="'+item.attr('data-item-id')+'"][data-month="'+i+'"]');
      total_fact+=decimal(obj.find('.num-fact').text());
    }

  }

  //Period
  obj=$('#ob-main-table .year-group[data-item-id="'+item.attr('data-item-id')+'"]');
  obj.find('.num-fact').html(total_fact.toFixed(2));
  total_plan=decimal(obj.find('.num-plan').text());
  obj.find('.num-diff').html( ( total_plan - total_fact ).toFixed(2) );

  //Day
  obj=$('#ob-main-table .day-group[data-item-id="'+item.attr('data-item-id')+'"]');
  obj.find('.num-fact').html( (total_fact / 365).toFixed(2) );
  total_plan=decimal(obj.find('.num-plan').text());
  obj.find('.num-diff').html( ( (total_plan / 365) - total_fact).toFixed(2) );


    while(current_parent_id!='np'){

      sub_cat_total=0;year_total_fact=0; year_total_diff=0; day_total_fact=0; day_total_diff=0;

      $('#ob-main-table .num-group[data-parent-id="'+current_parent_id+'"][data-month="'+item.attr('data-month')+'"] .num-fact').each(function(){
        sub_cat_total+=decimal($(this).text());
      });
      $('#ob-main-table .year-group[data-parent-id="'+current_parent_id+'"]').each(function(){
        year_total_fact+=decimal($(this).find('.num-fact').text());
        year_total_diff+=decimal($(this).find('.num-diff').text());
      });
      $('#ob-main-table .day-group[data-parent-id="'+current_parent_id+'"]').each(function(){
        day_total_fact+=decimal($(this).find('.num-fact').text());
        day_total_diff+=decimal($(this).find('.num-diff').text());
      });

      head_cat=$('#ob-main-table .num-group[data-item-id="'+current_parent_id+'"][data-month="'+item.attr('data-month')+'"]');
      head_cat.find('.num-fact').html(sub_cat_total.toFixed(2));
      head_cat.find('.num-diff').html((sub_cat_total - decimal(head_cat.find('.num-fact').text())).toFixed(2));
      head_cat=$('#ob-main-table .year-group[data-item-id="'+current_parent_id+'"]');
      head_cat.find('.num-fact').html(year_total_fact.toFixed(2));
      head_cat.find('.num-diff').html(year_total_diff.toFixed(2));
      head_cat=$('#ob-main-table .day-group[data-item-id="'+current_parent_id+'"]');
      head_cat.find('.num-fact').html(day_total_fact.toFixed(2));
      head_cat.find('.num-diff').html(day_total_diff.toFixed(2));

      current_parent_id=head_cat.attr('data-parent-id');
    }


    month_total_plan=0;
    month_total_fact=0;
    month_total_reserve=0;
    month_total_diff=0;
    $('#ob-main-table .num-group[data-level="1"][data-month="'+item.attr('data-month')+'"]').each(function(){
      month_total_plan+=decimal($(this).find('.num-plan').text());
      month_total_fact+=decimal($(this).find('.num-fact').text());
      month_total_reserve+=decimal($(this).find('.num-reserve').text());
      month_total_diff+=decimal($(this).find('.num-diff').text());
    });

    month_group=$('#ob-main-table .group-month-total[data-month="'+item.attr('data-month')+'"]');
     month_group.find('.num-total-plan').html(month_total_plan.toFixed(2));
     month_group.find('.num-total-fact').html(month_total_fact.toFixed(2));
     month_group.find('.num-total-reserve').html(month_total_reserve.toFixed(2));
     month_group.find('.num-total-diff').html(month_total_diff.toFixed(2));

     obrecountPeriodDay('1');
}