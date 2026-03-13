

var category_recount=true;

function initPlanItemControls(){
  $('.plan-cell').unbind();
  $('.plan-cell.num-strict').on('input',function(e){
    countPlanTotal($(this));
  });

  $('.plan-cell').on('blur',function(e){
    savePlanItem($(this));
  });
  $('.plan-cell').on('focusin',function(e){
    if(parseInt($(this).text()) == 0)
      $(this).html('');
  });


  $(".plan-cell.num-strict").keydown(function (event) {
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


function savePlanItem(item_div){
  mi={};
  mi.plan_id=item_div.attr('data-id');
  mi.item_id=item_div.attr('data-item-id');
  mi.fields=[];

  //if month edited save year and day to
  if(item_div.hasClass('month-cell')){
    field={};
    field.name=item_div.attr('data-field');
    field.value=item_div.text();
    mi.fields.push(field);
    //Year/day
    field={};
    field.name=item_div.closest('.grid-content').find('.plan-cell.year-cell[data-item-id="'+mi.item_id+'"]').attr('data-field');
    field.value=item_div.closest('.grid-content').find('.plan-cell.year-cell[data-item-id="'+mi.item_id+'"]').text();
    mi.fields.push(field);

    field={};
    field.name=item_div.closest('.grid-content').find('.plan-cell.day-cell[data-item-id="'+mi.item_id+'"]').attr('data-field');
    field.value=item_div.closest('.grid-content').find('.plan-cell.day-cell[data-item-id="'+mi.item_id+'"]').text();
    mi.fields.push(field);
  }
  else if(item_div.hasClass('year-cell') || item_div.hasClass('day-cell')){
    //Year/day
    field={};
    field.name=item_div.closest('.grid-content').find('.plan-cell.year-cell[data-item-id="'+mi.item_id+'"]').attr('data-field');
    field.value=item_div.closest('.grid-content').find('.plan-cell.year-cell[data-item-id="'+mi.item_id+'"]').text();
    mi.fields.push(field);

    field={};
    field.name=item_div.closest('.grid-content').find('.plan-cell.day-cell[data-item-id="'+mi.item_id+'"]').attr('data-field');
    field.value=item_div.closest('.grid-content').find('.plan-cell.day-cell[data-item-id="'+mi.item_id+'"]').text();
    mi.fields.push(field);
    //Months
    $('.plan-cell.month-cell[data-item-id="'+mi.item_id+'"]').each(function(){
      field={};
      field.name=$(this).attr('data-field');
      field.value=$(this).text();
      mi.fields.push(field);
    });
  }
  else{
    field={};
    field.name=item_div.attr('data-field');
    field.value=item_div.text();
    mi.fields.push(field);
  }

  mi.year=$('#budget-year').val();
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






var secured_from_edit_item='';
var secured_from_edit_field='';
function countPlanTotal(item){
  split_month=false;
  recount_total_year_day=false;
  current_year=$('#budget-year').val();

  if(item!=null){
    table_elem=item.closest('.grid-content');

    if(item.hasClass('month-cell')){
      countCategoryTotal(item);
      //Month total column
      month_column_total=0;
      table_elem.find('.month-cell[data-field="'+item.attr('data-field')+'"][data-level="2"]').each(function(){
        month_column_total+=decimal($(this).text());
      });
      table_elem.find('.total-cell[data-total-ref="'+item.attr('data-field')+'"]').html(month_column_total.toFixed(3));

      //Recount Year / Day
      item_year_total=0;
      item_per_day=0;
      table_elem.find('.month-cell[data-item-id="'+item.attr('data-item-id')+'"]').each(function(){
        item_year_total+=decimal($(this).text());
      });
      if(item_year_total>0)
        item_per_day=item_year_total/365;

      if(item.attr('data-item-id')!=secured_from_edit_item || secured_from_edit_field!='year')
        table_elem.find('.year-cell[data-item-id="'+item.attr('data-item-id')+'"]').html(item_year_total.toFixed(3));
      if(item.attr('data-item-id')!=secured_from_edit_item || secured_from_edit_field!='day')
        table_elem.find('.day-cell[data-item-id="'+item.attr('data-item-id')+'"]').html(item_per_day.toFixed(3));


    }

    else if(item.hasClass('year-cell') || item.hasClass('day-cell')){
      if(item.hasClass('year-cell')){
        secured_from_edit_field='year';
        item_year_total=decimal(item.text());
        item_per_day=0;
        if(item_year_total>0){
          item_per_day=item_year_total/365;
        }
        table_elem.find('.day-cell[data-item-id="'+item.attr('data-item-id')+'"]').html(item_per_day.toFixed(3));
      }
      else{
        secured_from_edit_field='day';
        item_year_total=0;
        item_per_day=decimal(item.text());
        if(item_per_day>0){
          item_year_total=item_per_day*365;
        }
        table_elem.find('.year-cell[data-item-id="'+item.attr('data-item-id')+'"]').html(item_year_total.toFixed(3));
      }

      //Update months if necessary
      if(!$('#plan-lock-months').prop('checked')){
        secured_from_edit_item=item.attr('data-item-id');
        table_elem.find('.month-cell[data-item-id="'+item.attr('data-item-id')+'"]').each(function(){
          day_month=parseInt(new Date(current_year,$(this).attr('data-field').split('_')[1],0).getDate()) * item_per_day;
          $(this).html(day_month.toFixed(3));
        });
        table_elem.find('.month-cell[data-item-id="'+item.attr('data-item-id')+'"]').each(function(){

          countCategoryTotal($(this));
          //Month total column
          month_column_total=0;
          table_elem.find('.month-cell[data-field="'+$(this).attr('data-field')+'"][data-level="2"]').each(function(){
            month_column_total+=decimal($(this).text());
          });
          table_elem.find('.total-cell[data-total-ref="'+$(this).attr('data-field')+'"]').html(month_column_total.toFixed(3));

        });
        secured_from_edit_item='';
        secured_from_edit_field='';
      }


    }


    table_year_total=0;
    table_day_total=0;
    table_elem.find('.year-cell[data-level="2"]').each(function(){
      table_year_total+=decimal($(this).text());
    });
    table_elem.find('.day-cell[data-level="2"]').each(function(){
      table_day_total+=decimal($(this).text());
    });
    table_elem.find('.total-cell[data-total-ref="year_costs"]').html(table_year_total.toFixed(3));
    table_elem.find('.total-cell[data-total-ref="day_costs"]').html(table_day_total.toFixed(3));
  }
  //For full load
  else{
    $('.annual-plan .grid-content').each(function(){
      parents_with_input=[];
      $(this).find('.year-cell[contenteditable="true"]').each(function(){
        //$(this).trigger('input');
        if(!isset(parents_with_input.find(x=>x == $(this).attr('data-parent-id'))))
          parents_with_input.push($(this).attr('data-parent-id'));
      });

      for(i=0;i<parents_with_input.length;i++){
        for(mont=1;mont<13;mont++){
          first_child_of_parent=$(this).find('.month-cell[data-parent-id="'+parents_with_input[i]+'"][data-field="month_'+mont+'"]:first');
          first_child_of_parent.trigger('input');
        }

      }
    });

    $('#bud-annual-plan-tab-classic').attr('data-init-count','1');
  }



}




function countCategoryTotal(edited_item){
  res=0;
  $('.plan-cell.month-cell[data-parent-id="'+edited_item.attr('data-parent-id')+'"][data-field="'+edited_item.attr('data-field')+'"]').each(function(){
    res+=decimal($(this).text());
  });
  parent_item=$('.plan-cell.month-cell[data-item-id="'+edited_item.attr('data-parent-id')+'"][data-field="'+edited_item.attr('data-field')+'"]');
  if(parent_item.length>0){
    parent_item.html(res.toFixed(3));
    category_recount=false;
    parent_item.trigger('input');
    category_recount=true;
  }

}

























/*function countPlanTotal2(item=null){
  if(item!=null){
    table_elem=item.closest('.grid-content');
    split_month=false;
    recount_total_year_day=false;
    current_year=$('#budget-year').val();

    //Col Total count
    item_col_total=0;
    table_elem.find('.num-strict[data-field="'+item.attr('data-field')+'"]').each(function(){
      item_col_total+=decimal($(this).text());
    });
    table_elem.find('.total-cell[data-total-ref="'+item.attr('data-field')+'"]').html(item_col_total.toFixed(3));

    if(item.hasClass('month-cell')){
      //Count total for year / day
      year_total=0;
      $('.plan-cell.month-cell[data-item-id="'+item.attr('data-item-id')+'"]').each(function(){
        year_total+=decimal($(this).text());
      });
      table_elem.find('.year-cell[data-item-id="'+item.attr('data-item-id')+'"]').html(year_total.toFixed(3));
      table_elem.find('.day-cell[data-item-id="'+item.attr('data-item-id')+'"]').html((year_total/365).toFixed(3));
      recount_total_year_day=true;
    }

    else if(item.hasClass('year-cell')){
      table_elem.find('.day-cell[data-item-id="'+item.attr('data-item-id')+'"]').html((decimal($(item).text())/365).toFixed(3));
      //Recount Day Total
      day_total=0;
      table_elem.find('.day-cell').each(function(){
        day_total+=decimal($(this).text());
      });
      table_elem.find('.total-cell[data-total-ref="day_costs"]').html(day_total.toFixed(3));
      split_month=true;
    }

    else if(item.hasClass('day-cell')){
      table_elem.find('.year-cell[data-item-id="'+item.attr('data-item-id')+'"]').html((decimal($(item).text())*365).toFixed(3));
      //Recount Year Total
      year_total=0;
      table_elem.find('.year-cell').each(function(){
        year_total+=decimal($(this).text());
      });
      table_elem.find('.total-cell[data-total-ref="year_costs"]').html(year_total.toFixed(3));
      split_month=true;
    }

    //Finish recount
    if(recount_total_year_day){
      year_total=0; day_total=0;
      table_elem.find('.year-cell').each(function(){
        year_total+=decimal($(this).text());
      });
      table_elem.find('.total-cell[data-total-ref="year_costs"]').html(year_total.toFixed(3));

      table_elem.find('.day-cell').each(function(){
        day_total+=decimal($(this).text());
      });
      table_elem.find('.total-cell[data-total-ref="day_costs"]').html(day_total.toFixed(3));
    }

    if(split_month && !$('#plan-lock-months').prop('checked')){
      per_day=decimal(table_elem.find('.day-cell[data-item-id="'+item.attr('data-item-id')+'"]').text());
      table_elem.find('.month-cell[data-item-id="'+item.attr('data-item-id')+'"]').each(function(){
        day_month=parseInt(new Date(current_year,$(this).attr('data-field').split('_')[1],0).getDate()) * per_day;
        $(this).html(day_month.toFixed(3));
        month_col_total=0;
        table_elem.find('.num-strict[data-field="'+$(this).attr('data-field')+'"]').each(function(){
          month_col_total+=decimal($(this).text());
        });
        table_elem.find('.total-cell[data-total-ref="'+$(this).attr('data-field')+'"]').html(month_col_total.toFixed(3));
      });
    }


    if(category_recount){
      countCategoryTotal(item);
    }

  }


  //Calculate all
  else{
    $('.annual-plan .grid-content').each(function(){
      max_level_in_table=1;
      $(this).find('.month-cell[data-field="month_1"]').each(function(){if(decimal($(this).attr('data-level'))>max_level_in_table) max_level_in_table=decimal($(this).attr('data-level'));});
      //months
      for(month_ind=1;month_ind<13;month_ind++){
        //category calculations
        countCategoryTotal($(this).find('.plan-cell.month-cell[data-field="month_'+month_ind+'"][data-level="'+max_level_in_table+'"]'));

        total_month=0;
        $(this).find('.month-cell[data-field="month_'+month_ind+'"]').each(function(){
          total_month+=decimal($(this).text());
        });
        $(this).find('.total-cell[data-total-ref="month_'+month_ind+'"]').html(total_month.toFixed(3));
      }

      //Year
      year_total=0;
      $(this).find('.year-cell').each(function(){
        year_total+=decimal($(this).text());
      });
      $(this).find('.total-cell[data-total-ref="year_costs"]').html(year_total.toFixed(3));

      //Day
      day_total=0;
      $(this).find('.day-cell').each(function(){
        day_total+=decimal($(this).text());
      });
      $(this).find('.total-cell[data-total-ref="day_costs"]').html(day_total.toFixed(3));
    });


  }


}*/
