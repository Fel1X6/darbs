



function initFactItemControls(){
  $('.fact-cell').unbind();
  $('.fact-cell.month-cell[data-editable="1"]').dblclick(function(){
    openMonthDetails($(this));
  });

  $('.fact-cell[data-field="comment"]').on('blur',function(e){
    saveFactItem($(this));
  });

}




function openMonthDetails(month_cell,tab){
  $('#bud-month-deduction-value').val('');
  $('#new-budget-file-btn').prop('hidden',true);
  $('#budget-files-list').empty();
  $('#bud-month-comment').val('');
  checkInputFill();

  mi={};
  mi.item_id=month_cell.attr('data-item-id');
  //mi.field=month_cell.attr('data-field');
  mi.field='month_'+month_cell.attr('data-month');
  mi.year=$('#budget-year').val();
  modal_title='';
  $('#bud-month-add-deduction').attr('data-item-id',month_cell.attr('data-item-id'));
  $('#bud-month-add-deduction').attr('data-month',mi.field.split('_')[1]);
  tmp=cats.find(x=>x.id == mi.item_id);
  if(isset(tmp)){
    modal_title=$('#bud-month-add-deduction').attr('data-month')+'.'+$('#budget-year').val()+' - '+tmp.code +' '+ tmp.title
  }

  $.ajax({
    type:'POST',
    url:'function_call.php?f=132',
    data:{'fName':'openMonthDetails', 'mi':mi},
    cache:false,
    error:function(error){if(!JSON.stringify(error).includes('Session ended!'))alert(JSON.stringify(error)); else CallPulse();},
    beforeSend:function(){ ShowLoader();},
    complete:function(){HideLoader();},
    success:function(d){


      $('#bud-month-details-modal-title').html(modal_title);
      $('#bud-month-details-modal-title').attr('data-called-from',tab);
      //Sum external invoice into one object
      ext_invs=d.filter(x=>x.comment.includes("External invoice"));
      if(ext_invs.length > 0){
        totals=[];
        for(i=0;i<ext_invs.length;i++){
          if(!isset(totals.find(x=>x.id == ext_invs[i].id))){
            tm=ext_invs.filter(x=>x.id == ext_invs[i].id);
            it=ext_invs[i];t=0;
            for(j=0;j<tm.length;j++){
              t+=decimal(tm[j].value);
            }
            it.value=t;
            totals.push(it);
          }
        }
        //Remove old ext invoices items
        for(i=0;i<totals.length;i++){
          d=d.filter(x=>x.id != totals[i].id);
        }
        d=d.concat(totals);
      }

      //Sum purchase into one object
      ext_invs=d.filter(x=>x.comment.includes("Purchase order"));
      if(ext_invs.length > 0){
        totals=[];
        for(i=0;i<ext_invs.length;i++){
          if(!isset(totals.find(x=>x.id == ext_invs[i].id))){
            tm=ext_invs.filter(x=>x.id == ext_invs[i].id);
            it=ext_invs[i];t=0;
            for(j=0;j<tm.length;j++){
              t+=decimal(tm[j].value);
            }
            it.value=t;
            totals.push(it);
          }
        }
        //Remove old purchase items
        for(i=0;i<totals.length;i++){
          d=d.filter(x=>x.id != totals[i].id);
        }
        d=d.concat(totals);
      }



      d=d.sort(function(a,b){
        if(b.date.length==0){
          return -1;
        }
        else
          return new Date(b.date) - new Date(a.date)
      });
      rows="";
      for(i=0;i<d.length;i++){
        if(decimal(d[i].value)>0)
          rows+=rowMonthDeduction(d[i]);
      }
      $('#bud-month-deduction-list').html(rows);
      initMonthDeductionControl();

      total=0;
      $('.month-detail-value').each(function(){
        total+=decimal($(this).text());
      });
      $('#bud-month-total').html(total.toFixed(2));

    }
  });
  $('#bud-month-details-modal').modal('show');
}


function rowMonthDeduction(values){
  if(!isset(values.id))values.id='';
  if(!isset(values.user))values.user='';

  date='';
  if(values.date.length>0)date=convertDate(values.date,'web');

  manual='';
  if(isset(values.files))
    manual='manual';

  r="<tr class='month-detail-item cursor-hand' data-id='"+values.id+"' data-manual='"+manual+"'>";
  r+="<td class='month-detail-date'>"+date+"</td>";
  r+="<td class='month-detail-user'>"+values.user+"</td>";
  r+="<td class='month-detail-value'>"+decimal(values.value).toFixed(2)+"</td>";
  r+="<td class='month-detail-comment'>"+values.comment+"</td>";

  if(manual.length>0 && !$('#bud-month-add-deduction').prop('disabled')){
    r+="<td class='month-detail-add-file ui-hover text-center'><i class=\"bi bi-folder2-open\"></i></td>";
    r+="<td class='month-detail-delete cursor-hand ui-hover-remove text-center text-middle red-text'><i class=\"bi bi-x\"></i></td>";
  }
  //External invoices files
  else if(isset(values.file_count) && values.file_count.length > 0){
    r+="<td class='month-detail-add-file month-detail-non-control-file ui-hover text-center'><i class=\"bi bi-folder2-open\"></i></td>";
    r+="<td class='month-detail-non-delete'></td>";
  }
  else{
    r+="<td class='month-detail-non-delete' colspan='2'></td>";
  }
  r+="</tr>";

  return r;
}
function initMonthDeductionControl(){
  $('.month-detail-item').unbind();
  $('.month-detail-item td').not('.month-detail-delete').click(function(){
    selectedItem($(this).closest('tr'));
    $('#new-budget-file-btn').prop('hidden',true);
    if($(this).closest('tr').attr('data-manual').length>0){
      $('#new-budget-file-btn').prop('hidden',true);

      if($(this).hasClass('month-detail-add-file')){
        //addDeductionFile();
        
        if(!$('#bud-month-add-deduction').prop('disabled')){
          $('#new-budget-file-btn').prop('hidden',false);
        }

        if($(this).hasClass('month-detail-non-control-file'))
          $('#new-budget-file-btn').prop('hidden',true);

        $('#bud-files-list-modal').modal('show');
        openDeductionFiles($(this).closest('tr'));
      }
    }
    else if($(this).hasClass('month-detail-add-file')){

        $('#bud-files-list-modal').modal('show');
        openDeductionFiles($(this).closest('tr'));
      
    }
    else{
      $('#new-budget-file-btn').prop('hidden',true);
      $('#budget-files-list').empty();
    }

  });
  $('.month-detail-delete').click(function(){
    removeDetail($(this).closest("tr"));
  });
}



function saveMonthDeduction(){
  error=0;
  if($('#bud-month-deduction-value').val().length==0 || (!decimal($('#bud-month-deduction-value').val(),true) || decimal($('#bud-month-deduction-value').val())==0)){
    error++;
    toastr.error(dict['invalid_value']);
  }
  if($('#bud-month-comment').val().length==0){
    error++;
    toastr.error(dict['empty_comment_field']);
  }

  if(error==0){
    mi={};
    mi.id=uuidv4();
    mi.year=$('#budget-year').val();
    mi.month=$('#bud-month-add-deduction').attr('data-month');
    mi.item_id=$('#bud-month-add-deduction').attr('data-item-id');
    mi.currency=$('#bud-month-currency').text();
    mi.value=decimal($('#bud-month-deduction-value').val());
    mi.comment=$('#bud-month-comment').val();
    $.ajax({
      type:'POST',
      url:'function_call.php?f=132',
      data:{'fName':'saveMonthDeduction','mi':mi},
      cache:false,
      error:function(error){if(!JSON.stringify(error).includes('Session ended!'))alert(JSON.stringify(error)); else CallPulse();},
      beforeSend:function(){ ShowLoader();},
      complete:function(){HideLoader();},
      success:function(d){
        if(d.answer=='ok'){
          mi.user=securels.get('my_username');
          mi.date=d.date;
          mi.manual='true';
          mi.files=[];

          $('#bud-month-deduction-list').prepend(rowMonthDeduction(mi));
          initMonthDeductionControl();

          total=0;
          $('.month-detail-value').each(function(){
            total+=decimal($(this).text());
          });
          $('#bud-month-total').html(total.toFixed(2));

          $('#bud-month-deduction-value').val('');
          $('#bud-month-comment').val('');
          checkInputFill();

          if($('#bud-month-details-modal-title').attr('data-called-from') == 'budget'){
            num_group=$('#main-table .num-group[data-item-id="'+mi.item_id+'"][data-month="'+mi.month+'"]');
            num_group.find('.num-fact').html(total.toFixed(2));
            recountTableTotalFact(num_group);
          }
          else{
            num_group=$('#ob-main-table .num-group[data-item-id="'+mi.item_id+'"][data-month="'+mi.month+'"]');
            num_group.find('.num-fact').html(total.toFixed(2));
            obrecountTableTotalFact(num_group);
          }

          //$('.fact-cell[data-item-id="'+mi.item_id+'"][data-field="month_'+mi.month+'"]').html(total.toFixed(3));
          //countFactTotal({item_id: mi.item_id, month: mi.month});
        }
        else toastr.error(dict['error_occurred']+": "+JSON.stringify(d));

      }
    });
  }
}


function removeDetail(detail_row){
  Swal.fire({
  title: dict['remove_deduction_from_month'],
  icon: 'danger',
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
      data:{'fName':'removeDetail','detail_id':detail_row.attr('data-id')},
      cache:false,
      error:function(error){if(!JSON.stringify(error).includes('Session ended!'))alert(JSON.stringify(error)); else CallPulse();},
      beforeSend:function(){ ShowLoader();},
      complete:function(){HideLoader();},
      success:function(d){
        if(d.answer=='ok'){
          detail_row.remove();
          toastr.info(dict['deduction_removed']);
          $('#budget-files-list').empty();

          total=0;
          $('.month-detail-value').each(function(){
            total+=decimal($(this).text());
          });
          $('#bud-month-total').html(total.toFixed(2));

          if(total>0)
            total=total.toFixed(2);
          else total='0';


          if($('#bud-month-details-modal-title').attr('data-called-from') == 'budget'){
            num_group=$('#main-table .num-group[data-item-id="'+$('#bud-month-add-deduction').attr('data-item-id')+'"][data-month="'+$('#bud-month-add-deduction').attr('data-month')+'"]');
            num_group.find('.num-fact').html(total);
            recountTableTotalFact(num_group);
          }
          else{
            num_group=$('#ob-main-table .num-group[data-item-id="'+$('#bud-month-add-deduction').attr('data-item-id')+'"][data-month="'+$('#bud-month-add-deduction').attr('data-month')+'"]');
            num_group.find('.num-fact').html(total);
            obrecountTableTotalFact(num_group);
          }
        }
        else toastr.error(dict['error_occurred']+": "+JSON.stringify(d));

      }
    });
  }
});

}






function saveFactItem(item_div){
  mi={};
  mi.fact_id=item_div.attr('data-id');
  mi.item_id=item_div.attr('data-item-id');
  mi.fields=[];

    field={};
    field.name=item_div.attr('data-field');
    field.value=item_div.text();
    mi.fields.push(field);


  mi.year=$('#budget-year').val();
  $.ajax({
    type:'POST',
    url:'function_call.php?f=132',
    data:{'fName':'saveFactItem', 'mi':mi},
    cache:false,
    error:function(error){if(!JSON.stringify(error).includes('Session ended!'))alert(JSON.stringify(error)); else CallPulse();},
    success:function(d){
      if(d.answer!='ok')
        toastr.error(dict['error_occurred']+": "+JSON.stringify(d));
    }
  });
}






function countFactTotal(){

  $('.annual-fact .grid-content').each(function(){
    table_elem=$(this);
for(month_ind=1;month_ind<13;month_ind++){
  month_tot=0;
  table_elem.find('.month-cell[data-level="2"][data-field="month_'+month_ind+'"]').each(function(){
    month_tot+=decimal($(this).text());
  });
  table_elem.find('.total-cell[data-total-ref="month_'+month_ind+'"').html(month_tot.toFixed(2));
}

  table_year_total=0;
  table_day_total=0;
  table_elem.find('.year-cell[data-level="2"]').each(function(){
    table_year_total+=decimal($(this).text());
  });
  table_elem.find('.day-cell[data-level="2"]').each(function(){
    table_day_total+=decimal($(this).text());
  });
  table_elem.find('.total-cell[data-total-ref="year_costs"]').html(table_year_total.toFixed(2));
  table_elem.find('.total-cell[data-total-ref="day_costs"]').html(table_day_total.toFixed(2));
  });

}



function countFactCategoryTotal(edited_item){
  res=0;
  $('.fact-cell.month-cell[data-parent-id="'+edited_item.attr('data-parent-id')+'"][data-field="'+edited_item.attr('data-field')+'"]').each(function(){
    res+=decimal($(this).text());
  });
  parent_item=$('.fact-cell.month-cell[data-item-id="'+edited_item.attr('data-parent-id')+'"][data-field="'+edited_item.attr('data-field')+'"]');
  if(parent_item.length>0){
    parent_item.html(res.toFixed(2));
    countFactTotal({item_id: parent_item.attr('data-item-id'), month:parent_item.attr('data-field').split('_')[1]});
  }
}














function openDeductionFiles(detail_row){
  mi={};
  mi.deduction_id=detail_row.attr('data-id');
  if(detail_row.find('.month-detail-non-control-file').length > 0){
    mi.external_invoices='true';
  }
  $.ajax({
    type:'POST',
    url:'function_call.php?f=132',
    data:{'fName':'openDeductionFiles', 'mi':mi},
    cache:false,
    error:function(error){if(!JSON.stringify(error).includes('Session ended!'))alert(JSON.stringify(error)); else CallPulse();},
    beforeSend:function(){ ShowLoader();},
    complete:function(){HideLoader();},
    success:function(d){

      if(!isset(mi.external_invoices)){
        $('#new-budget-file-btn').attr('data-deduction-id',detail_row.attr('data-id'));

        rows="";
        for(i=0;i<d.length;i++)
          rows+=rowDeductionFile(d[i]);
        $('#budget-files-list').html(rows);
      }
      else{
        rows="";
        for(i=0;i<d.length;i++)
          rows+=rowEIFile(d[i]);
        $('#budget-files-list').html(rows);
      }



    }
  });
}

function rowDeductionFile(values){
  r="<tr class='month-deduction-file-item cursor-hand' data-id='"+values.id+"'>";
  r+="<td class='month-deduction-file-item-filename noselect' ondblclick='previewDeductionFile($(this).closest(\"tr\"))'>"+values.filename+"</td>";
  r+="<td class='month-deduction-file-item-username noselect' ondblclick='previewDeductionFile($(this).closest(\"tr\"))'>"+values.username+"</td>";
  r+="<td class='month-deduction-file-item-username noselect' ondblclick='previewDeductionFile($(this).closest(\"tr\"))'>"+convertDate(values.update_datetime,'webs')+"</td>";
  r+="<td class='month-deduction-file-item-delete cursor-hand ui-hover-remove text-center text-middle red-text' onclick='removeDeductionFile($(this).closest(\"tr\"))'><i class=\"bi bi-x\"></i></td>";
  r+="</tr>";
  return r;
}
function rowEIFile(values){
  r="<tr class='month-deduction-file-item cursor-hand' data-id='"+values.id+"' data-filepath='"+values.filepath+"'>";
  r+="<td class='month-deduction-file-item-filename noselect' ondblclick='previewEIFile($(this).closest(\"tr\"))'>"+values.filename+"</td>";
  r+="</tr>";
  return r;
}

function addDeductionFile(){
  file_path="/999/budget/month_deductions/"+$('#new-budget-file-btn').attr('data-deduction-id')+'/';
  $('#budget-file-input').val('');
  $('#budget-file-input').click();
  $('#budget-file-input').unbind();
  $('#budget-file-input').change(function(){
    if($('#budget-file-input').get(0).files.length !== 0){
      fu=fileUpload({'ar':'1','destination':file_path, 'upload_on_server':'1', 'vessel_id':'999', 'file_element':'budget-file-input'});
      fu.done(function(d){
        if(d=='ok'){
          values={};
          values.id=uuidv4();
          values.filename=$('#budget-file-input').val().split('\\').pop().replace("'","_").replace('"','_').replace('&','_');
          values.username=securels.get("my_username");
          values.deduction_id=$('#new-budget-file-btn').attr('data-deduction-id');

          $.ajax({
            type:'POST',
            url:'function_call.php?f=132',
            data:{'fName':'addDeductionFile','mi':values},
            cache:false,
            error:function(error){if(!JSON.stringify(error).includes('Session ended!'))alert(JSON.stringify(error)); else CallPulse();},
            success:function(d){
              if(d['answer']=='ok'){
                values.update_datetime=d.date;
                $('#budget-files-list').prepend(rowDeductionFile(values));
                toastr.success(dict['file_added']);
              }
              else toastr.error(dict['error_occurred']+": "+JSON.stringify(d));
            }
          });
        }
      });
  }

  });
}

function removeDeductionFile(file_item){
  Swal.fire({
  title: dict['remove_file_value'].replace("@value",file_item.find('.month-deduction-file-item-filename').text()),
  icon: 'danger',
  showCancelButton: true,
  confirmButtonColor: '#3085d6',
  cancelButtonColor: '#d33',
  cancelButtonText: dict['no'],
  confirmButtonText:dict['yes']
}).then((result) => {
  if (result.value) {
    mi={}
    mi.file_id=file_item.attr('data-id');
    $.ajax({
      type:'POST',
      url:'function_call.php?f=132',
      data:{'fName':'removeDeductionFile', 'mi':mi},
      cache:false,
      error:function(error){if(!JSON.stringify(error).includes('Session ended!'))alert(JSON.stringify(error)); else CallPulse();},
      beforeSend:function(){ ShowLoader();},
      complete:function(){HideLoader();},
      success:function(d){
        if(d.answer=='ok'){
          file_item.remove();
        }
        else toastr.error(dict['error_occurred']+": "+JSON.stringify(d));

      }
    });
  }
});
}

function previewDeductionFile(file_item){
  fp=filePreview({file_path: "999/budget/month_deductions/"+$('#new-budget-file-btn').attr('data-deduction-id')+'/'+file_item.find('.month-deduction-file-item-filename').text(), ar:1, local_preview:'0'});
  fp.done(function(d){
    if(d=='ok')window.open('file_udp/filePreview.php',"_blank");
    else toastr.error(dict['error_occurred']);
  });
}

function previewEIFile(file_item){
  fp=filePreview({file_path: file_item.attr('data-filepath')+'/'+file_item.find('.month-deduction-file-item-filename').text(), ar:1, local_preview:'0'});
  fp.done(function(d){
    if(d=='ok')window.open('file_udp/filePreview.php',"_blank");
    else toastr.error(dict['error_occurred']);
  });
}


















/*function countFactTotal(params=null){
  current_year=$('#budget-year').val();

  if(params!=null){
    table_elem=$('.fact-cell.year-cell[data-item-id="'+params.item_id+'"]').closest('.grid-content');
    countFactCategoryTotal($('.fact-cell.month-cell[data-item-id="'+params.item_id+'"][data-field="month_'+params.month+'"]'));

    //Month total column
    month_column_total=0;
    table_elem.find('.month-cell[data-field="month_'+params.month+'"][data-level="2"]').each(function(){
      month_column_total+=decimal($(this).text());
    });
    table_elem.find('.total-cell[data-total-ref="month_'+params.month+'"]').html(month_column_total.toFixed(3));

    //Recount Year / Day
    item_year_total=0;
    item_per_day=0;
    table_elem.find('.month-cell[data-item-id="'+params.item_id+'"]').each(function(){
      item_year_total+=decimal($(this).text());
    });
    if(item_year_total>0)
      item_per_day=item_year_total/365;

    table_elem.find('.year-cell[data-item-id="'+params.item_id+'"]').html(item_year_total.toFixed(3));
    table_elem.find('.day-cell[data-item-id="'+params.item_id+'"]').html(item_per_day.toFixed(3));



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
    parents_with_input=[];
    $('.annual-fact .fact-cell.year-cell[data-editable="1"]').each(function(){
      table_elem=$(this).closest('.grid-content');
      if(!isset(parents_with_input.find(x=>x == $(this).attr('data-parent-id'))))
        parents_with_input.push($(this).attr('data-parent-id'));

        //Recount Year / Day
        item_year_total=0;
        item_per_day=0;
        table_elem.find('.month-cell[data-item-id="'+$(this).attr('data-item-id')+'"]').each(function(){
          item_year_total+=decimal($(this).text());
        });
        if(item_year_total>0)
          item_per_day=item_year_total/365;

        table_elem.find('.year-cell[data-item-id="'+$(this).attr('data-item-id')+'"]').html(item_year_total.toFixed(3));
        table_elem.find('.day-cell[data-item-id="'+$(this).attr('data-item-id')+'"]').html(item_per_day.toFixed(3));
    });

    for(i=0;i<parents_with_input.length;i++){
      for(mont=1;mont<13;mont++){
        first_child_of_parent=$('.annual-fact .month-cell[data-parent-id="'+parents_with_input[i]+'"][data-field="month_'+mont+'"]:first');
        countFactTotal({item_id: first_child_of_parent.attr('data-item-id'), month: mont});
      }
    }


    $('.annual-fact .grid-content').each(function(){
      table_elem=$(this);
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
    });

    $('#bud-annual-fact-tab-classic').attr('data-init-count','1');
  }



}*/
