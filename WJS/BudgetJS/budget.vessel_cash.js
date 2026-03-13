var budget_codes=[];
var currencies = [];
var vessel=null;
var delete_files=[];
var records=[];
var mv = '';

(function($){
    $(document).ready(function(){
        initVesselCash();

    })
})(jQuery);


function initVesselCash(){
    momSetDate('vc-from',getCurrentDate('DB','sub',30));
    momSetDate('vc-till',getCurrentDate('DB','add',1));

    $.ajax({
        type:'POST',
        url:'function_call.php?f=132',
        data:{'fName':'initVesselCash'},
        cache:false,
        error:function(error){if(!JSON.stringify(error).includes('Session ended!'))alert(JSON.stringify(error)); else CallPulse();},
        beforeSend:function(){ ShowLoader();},
        complete:function(){HideLoader();},
        success:function(d){
            budget_codes=d.budget_codes;
            currencies=d.currencies;
            vessel=d.vessel;
            records =d.records;

            mv =securels.get('usr_vessel_id');

           
            
            for(i=0;i<records.length;i++){
                records[i].datetime_conv=new Date(records[i].datetime);
            }

            opt='<option value="" disabled selected>'+dict['not_selected']+'</option>';
            opt2='';
            for(i=0;i<budget_codes.length;i++){
                opt+="<option value='"+budget_codes[i].id+"'>"+budget_codes[i].content+"</option>";
                opt2+="<option value='"+budget_codes[i].id+"'>"+budget_codes[i].content+"</option>";
            }
                
            $('#vs-show-codes').html(opt);
            $('#vc-accrual-budget-code').html(opt2);
            $('#vc-deduction-budget-code').html('<option value="-1" selected>'+dict['not_selected']+'</option>'+opt2);

            opt='';
            for(i=0;i<currencies.length;i++){
                opt+='<option value="'+currencies[i]+'">'+currencies[i]+"</option>";
            }
            $('#vs-show-currency').html(opt);
            $('#vc-accrual-currency').html(opt);
            $('#vc-deduction-currency').html(opt);

            mdbSetSelect('vs-show-currency',vessel.budget_currency);

            opt='';
            for(i=0;i<d.crews.length;i++){
              opt+='<option value="'+d.crews[i].id+'">'+d.crews[i].rank+' : '+d.crews[i].name_surname+'</option>';
            }
            $('#vc-deduction-cash-advance-recipient').html(opt);
            


            searchRecords();

            $("#vc-from, #vc-till").on("change.datetimepicker", ({date, oldDate}) => {
                if(date!=oldDate){
                    searchRecords();
                }
              });
        }
      });
}


function addDeduction(){
    $('#vc-add-deduction-modal-title').html('<b>'+dict.add_deduction+'</b>');
  $('#vc-deduction-amount').val('');
  mdbSetSelect('vc-deduction-currency',$('#vs-show-currency').val());
  mdbSetSelect('vc-deduction-budget-code','','first');
  mdbSetSelect('vc-deduction-cash-advance-recipient','','first');
  momSetDateTime('vc-deduction-date',getCurrentDate('DBs','none',0,true));
  $('#vc-deduction-remark').val('');
  $('#vc-deduction-files-list').empty();
  $('#save-deduction').val(uuidv4());
  $('#vc-deduction-cash-advance').prop('checked',false);
  showCashAdvance();

    $('#vc-deduction-amount, #vc-deduction-remark, #vc-deduction-cash-advance').prop('disabled',false);
    mdbSelectState('vc-deduction-cash-advance-recipient',true);
    mdbSelectState('vc-deduction-currency',true);
    //mdbSelectState('vc-deduction-date',true);
    momStateDate('vc-deduction-date',true);
    mdbSelectState('vc-deduction-budget-code',true);
    $('#vc-deduction-add-file').prop('hidden',false);


  $("#vc-add-deduction-modal").modal("show");
}

function saveDeduction(){

    error=0;
    if($('#vc-deduction-amount').val().length ==0 && !decimal($('#vc-deduction-amount').val(),true)){
        error++;
    }

    if(($('#vc-deduction-budget-code').val().length == 0 || $('#vc-deduction-budget-code').val() == '-1') && !$('#vc-deduction-cash-advance').prop('checked')  ){
        error++;
    }


    if(error==0){
        mi={};
        mi.id=$('#save-deduction').val();
        mi.amount = decimal($('#vc-deduction-amount').val());
        mi.currency = $('#vc-deduction-currency').val();
        mi.budget_code_id = $('#vc-deduction-budget-code').val();
        mi.datetime = momGetDateTime('vc-deduction-date')+':00';
        mi.remarks = $('#vc-deduction-remark').val();
        mi.cash_advance = cBoolToInt($('#vc-deduction-cash-advance').prop('checked'));
        mi.crew_id = $('#vc-deduction-cash-advance-recipient').val();
        mi.files=[];
        $('.vc-file[data-state="new"]').each(function(){
            file={};
            file.id=$(this).attr('data-id');
            file.filename=$(this).find('.filename').text();
            mi.files.push(file);
        });
        mi.delete_files=delete_files;

        if(mi.cash_advance == '1'){
            tmp = "Cash advance for "+$('#vc-deduction-cash-advance-recipient option[value="'+mi.crew_id+'"]').text();
            if(mi.remarks.length > 0)
                    mi.remarks=tmp+' Remarks: '+mi.remarks;
            else mi.remarks=tmp; 
        }

    $.ajax({
        type:'POST',
        url:'function_call.php?f=132',
        data:{'fName':'saveDeduction', 'mi':mi},
        cache:false,
        error:function(error){if(!JSON.stringify(error).includes('Session ended!'))alert(JSON.stringify(error)); else CallPulse();},
        beforeSend:function(){ ShowLoader();},
        complete:function(){HideLoader();},
        success:function(d){
            if(d.answer == 'ok'){

                rec = records.find(x=>x.id == mi.id);
                if(isset(rec)){
                    bc=budget_codes.find(x=>x.id == mi.budget_code_id);
                    if(!isset(bc))rec.budget_code='';
                    else rec.budget_code=bc.code;
                }
                else{
                    delete_files=[];
                    if(mi.files.length > 0)mi.files='1';
                    else mi.files='';

                    bc=budget_codes.find(x=>x.id == mi.budget_code_id);
                    if(!isset(bc))mi.budget_code='';
                    else mi.budget_code=bc.code;
                    mi.datetime_conv=new Date(mi.datetime);
                    mi.username=securels.get('my_username');
                    mi.type='1';
                    records.push(mi);

                }

                $("#vc-add-deduction-modal").modal("hide");
                searchRecords();
            }
        }
      });

    }

}

function loadDeduction(elem){
    rec_date = elem.closest('tr').find('.cash-date').text().split(' ')[0].split('.')[1];
    now = getCurrentDate('DB').split('-')[1];

    mi={};
    mi.id = elem.attr('data-id');
    if(rec_date == now) {
        $.ajax({
            type: 'POST',
            url: 'function_call.php?f=132',
            data: {'fName': 'loadDeduction', 'mi': mi},
            cache: false,
            error: function (error) {
                if (!JSON.stringify(error).includes('Session ended!')) alert(JSON.stringify(error)); else CallPulse();
            },
            beforeSend: function () {
                ShowLoader();
            },
            complete: function () {
                HideLoader();
            },
            success: function (d) {
                $('#vc-add-deduction-modal-title').html('<b>' + dict.edit_deduction + '</b>');
                $('#vc-deduction-amount').val(d.amount);
                mdbSetSelect('vc-deduction-currency', d.currency);
                mdbSetSelect('vc-deduction-budget-code', d.budget_code_id);
                mdbSetSelect('vc-deduction-cash-advance-recipient', d.crew_id);
                momSetDateTime('vc-deduction-date', d.datetime);
                $('#vc-deduction-remark').val(d.remarks);
                $('#vc-deduction-files-list').empty();


                ht = '';
                for (i = 0; i < d.files.length; i++) {
                    d.files[i].state = 'alt';
                    d.files[i].filetype = 'deduction';
                    d.files[i].no_delete = true;
                    ht += rowVCFile(d.files[i]);

                }
                $('#vc-deduction-files-list').html(ht);
                updateRowNumbers("vc-deduction-files-list");


                $('#save-deduction').val(d.id);
                $('#vc-item-files-list').attr('data-id', d.id);
                $('#vc-deduction-cash-advance').prop('checked', cIntToBool(d.cash_advance));
                showCashAdvance();

                $('#vc-deduction-amount, #vc-deduction-remark, #vc-deduction-cash-advance').prop('disabled', true);
                mdbSelectState('vc-deduction-cash-advance-recipient', false);
                mdbSelectState('vc-deduction-currency', false);
                //mdbSelectState('vc-deduction-date',false);
                momStateDate('vc-deduction-date', false);
                $('#vc-deduction-add-file').prop('hidden', true);


                checkInputFill();
                $("#vc-add-deduction-modal").modal("show");
            }
        });
    }

}




function addAccrual(){
    $('#vc-accrual-amount').val('');
    mdbSetSelect('vc-accrual-currency',$('#vs-show-currency').val());
    mdbSetSelect('vc-accrual-budget-code','','first');
    momSetDateTime('vc-accrual-date',getCurrentDate('DBs','none',0,true));
    $('#vc-accrual-remark').val('');
    $('#vc-accrual-files-list').empty();
    $('#save-accrual').val(uuidv4());



    $("#vc-add-accrual-modal").modal("show");
}



function saveAccrual(){

    error=0;
    if($('#vc-accrual-amount').val().length ==0 && !decimal($('#vc-accrual-amount').val(),true)){
        error++;
    }

    if($('#vc-accrual-budget-code').val().length == 0){
        error++;
    }


    if(error==0){
        mi={};
        mi.id=$('#save-accrual').val();
        mi.amount = decimal($('#vc-accrual-amount').val());
        mi.currency = $('#vc-accrual-currency').val();
        mi.budget_code_id = '-1';
        mi.datetime = momGetDateTime('vc-accrual-date')+':00';
        mi.remarks = $('#vc-accrual-remark').val();
        mi.files=[];
        $('.vc-file[data-state="new"]').each(function(){
            file={};
            file.id=$(this).attr('data-id');
            file.filename=$(this).find('.filename').text();
            mi.files.push(file);
        });
        mi.delete_files=delete_files;

    $.ajax({
        type:'POST',
        url:'function_call.php?f=132',
        data:{'fName':'saveAccrual', 'mi':mi},
        cache:false,
        error:function(error){if(!JSON.stringify(error).includes('Session ended!'))alert(JSON.stringify(error)); else CallPulse();},
        beforeSend:function(){ ShowLoader();},
        complete:function(){HideLoader();},
        success:function(d){
            if(d.answer == 'ok'){
                delete_files=[];
                if(mi.files.length > 0)mi.files='1';
                else mi.files='';
                mi.budget_code=''
                mi.datetime_conv=new Date(mi.datetime);
                mi.username=securels.get('my_username');
                mi.type='0';
                records.push(mi);
                $("#vc-add-accrual-modal").modal("hide");
                searchRecords();
            }
        }
      });

    }

}


function rowVC(values){
  cl='accrual';tit=dict['accrual'];
  loa = '';
  if(values.type=='1'){
    cl='deduction';
    tit=dict['deduction'];
    if(securels.get('origin_vessel') == '0'){
        loa = "ondblclick='loadDeduction($(this))'";
    }
  }


    r='<tr class="cash-item " data-id="'+values.id+'" data-type="'+values.type+'" data-currency = "'+values.currency+'" '+loa+'>';
    r+='<td class="row-counter"></td>';
    r+='<td class="cash-type '+cl+'">'+tit+'</td>';
    r+='<td class="cash-date">'+convertDate(values.datetime,'webs')+'</td>';
    r+='<td class="cash-budget-code">'+values.budget_code+'</td>';
    r+='<td class="cash-amount">'+decimal(values.amount).toFixed(2)+'</td>';
    r+='<td class="cash-budget-name-surname">'+values.username+'</td>';
    r+='<td class="cash-budget-remarks">'+values.remarks+'</td>';
    if(values.files.length > 0)
        r+='<td class="cash-budget-attachments ui-hover text-center text-middle amber lighten-4 cursor-hand" onclick="openVCFiles($(this))"><i class="bi bi-folder2-open"></i></td>';
    else
        r+='<td class="cash-budget-attachments"></td>';
    if(mv == '0')
      r+='<td class="cash-budget-removeItem-button ui-hover-remove text-center text-middle cursor-hand" onclick="removeVesselCash($(this))"><i class="bi bi-x"></i></td>';
    r+='</tr>';
    return r;

    //$('#vc-item-attachments-modal').modal('show');
}

function removeVesselCash(elem){

    rec_date = elem.closest('tr').find('.cash-date').text().split(' ')[0].split('.')[1];
    now = getCurrentDate('DB').split('-')[1];

    if(rec_date == now){
        mi={};
        mi.id = elem.closest('tr').attr('data-id');
        Swal.fire({
            heightAuto: false,
            title: dict['remove']+'?',
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            cancelButtonText: menu_dict['no'],
            confirmButtonText: menu_dict['yes']
        }).then((result) => {
            if (result.value) {

                $.ajax({
                    type:'POST',
                    url:'function_call.php?f=132',
                    data:{'fName':'removeVesselCash', 'mi':mi},
                    cache:false,error:function(error){if(!JSON.stringify(error).includes('Session ended!'))alert(JSON.stringify(error)); else CallPulse();},
                    beforeSend:function(){ ShowLoader();},
                    complete:function(){HideLoader();},
                    success:function(d){
                        elem.closest('tr').remove();
                    }
                });


            }
        });
    }

}


function openVCFiles(elem){
  mi={};
  mi.id=elem.closest('tr').attr('data-id');
  mi.type=elem.closest('tr').attr('data-type');
  $.ajax({
    type:'POST',
    url:'function_call.php?f=132',
    data:{'fName':'openVCFiles', 'mi':mi},
    cache:false,
    error:function(error){if(!JSON.stringify(error).includes('Session ended!'))alert(JSON.stringify(error)); else CallPulse();},
    beforeSend:function(){ ShowLoader();},
    complete:function(){HideLoader();},
    success:function(d){
      ht='';
      for(i=0;i<d.length;i++){
        d[i].filetype='';
        d[i].state='';
        d[i].no_delete='1';
        ht+=rowVCFile(d[i]);
      }
        
      $('#vc-item-files-list').html(ht);
      $('#vc-item-files-list').attr('data-id',mi.id);
      $('#vc-item-files-list').attr('data-type',mi.type);
    }
  });

  $('#vc-item-attachments-modal').modal('show');
}


function showCashAdvance(){
    if($('#vc-deduction-cash-advance').prop('checked')){
        $('#vc-deduction-seagoing-control').attr('hidden', false);
        $('#vc-deduction-cash-advance-controls').attr('hidden', false);

        now = new Date();
        lastDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        date_params={
            language: 'en',
            format: 'DD.MM.YYYY',
            locale: 'en-EN',
            minDate:  now.getFullYear() + '-' + String(now.getMonth() + 1).padStart(2, '0') + '-01',
            maxDate:   lastDate.getFullYear() + '-' + String(lastDate.getMonth() + 1).padStart(2, '0') + '-' + String(lastDate.getDate()).padStart(2, '0')
        }

        $('#vc-deduction-date').datetimepicker('destroy');
        $('#vc-deduction-date').datetimepicker(date_params);
        momSetDate('vc-deduction-date',getCurrentDate('DB'));
    }
    else{
      $('#vc-deduction-seagoing-control').attr('hidden', true);
        $('#vc-deduction-cash-advance-controls').attr('hidden', true);

        date_params={
            language: 'en',
            format: 'DD.MM.YYYY',
            locale: 'en-EN'
        }

        $('#vc-deduction-date').datetimepicker('destroy');
        $('#vc-deduction-date').datetimepicker(date_params);
        momSetDate('vc-deduction-date',getCurrentDate('DB'));
    }
}



function selectAccrualFile(){
    id=uuidv4();
    gfile = [];
    $('#vc-accrual-file-input').val('');
  
    $('.drop-zone').off();
    $('#vc-accrual-file-input').off();
  
    $("#file-upload-modal").modal("show");
  
    // Drag&Drop upload
    $('.drop-zone').on('drop', function (e) {
      if (gfile.name) {
        uploadAction(gfile);
      }
    });
  
    // Classic upload
    $('.drop-zone').on('click', function () {
      $('#vc-accrual-file-input').click();
    });
  
    $('.clipboard-file-btn').unbind().on('click', async function(){
      navigator.permissions.query({ name: 'clipboard-read' });
      try { 
        
         await getClipboardItemAsFile().then(pngFile=>{
          if(pngFile){
            gfile = pngFile;
          }
        });
        if (gfile.name) {
          uploadAction(gfile);
        }
      
      } catch (error) {
        console.error('Error reading clipboard:', error);
      }
    });
  
    $('#vc-accrual-file-input').on('change', function () {
      if ($('#vc-accrual-file-input').get(0).files.length !== 0) {
        uploadAction($('#vc-accrual-file-input'));
      }
    });
  
    function uploadAction(file) {
      if (file instanceof File) {
        filename = file.name;
        fu = fileUpload({'destination':'@tmp', 'file_element':file, 'additional_path':'upload/'+$('#save-accrual').val()});
      } else {
        filename = $('#vc-accrual-file-input').val().split('\\').pop().replace("'","_").replace('"','_').replace('&','_');
        fu = fileUpload({'destination':'@tmp', 'file_element':'vc-accrual-file-input', 'additional_path':'upload/'+$('#save-accrual').val()});
      }
      fu.done(function(d){
        if(d=='ok'){
          
          $('#vc-accrual-files-list').append(rowVCFile({'id':uuidv4(),'filename':filename, 'state':'new', 'filetype':'accrual'}));
          updateRowNumbers("vc-accrual-files-list");
  
          $("#file-upload-modal").modal("hide");
        }
      });
    }
  }



  function selectDeductionFile(){
    id=uuidv4();
    gfile = [];
    $('#vc-deduction-file-input').val('');
  
    $('.drop-zone').off();
    $('#vc-deduction-file-input').off();
  
    $("#file-upload-modal").modal("show");
  
    // Drag&Drop upload
    $('.drop-zone').on('drop', function (e) {
      if (gfile.name) {
        uploadAction(gfile);
      }
    });
  
    // Classic upload
    $('.drop-zone').on('click', function () {
      $('#vc-deduction-file-input').click();
    });
  
    $('.clipboard-file-btn').unbind().on('click', async function(){
      navigator.permissions.query({ name: 'clipboard-read' });
      try { 
        
         await getClipboardItemAsFile().then(pngFile=>{
          if(pngFile){
            gfile = pngFile;
          }
        });
        if (gfile.name) {
          uploadAction(gfile);
        }
      
      } catch (error) {
        console.error('Error reading clipboard:', error);
      }
    });
  
    $('#vc-deduction-file-input').on('change', function () {
      if ($('#vc-deduction-file-input').get(0).files.length !== 0) {
        uploadAction($('#vc-deduction-file-input'));
      }
    });
  
    function uploadAction(file) {
      if (file instanceof File) {
        filename = file.name;
        fu = fileUpload({'destination':'@tmp', 'file_element':file, 'additional_path':'upload/'+$('#save-deduction').val()});
      } else {
        filename = $('#vc-deduction-file-input').val().split('\\').pop().replace("'","_").replace('"','_').replace('&','_');
        fu = fileUpload({'destination':'@tmp', 'file_element':'vc-deduction-file-input', 'additional_path':'upload/'+$('#save-deduction').val()});
      }
      fu.done(function(d){
        if(d=='ok'){
          
          $('#vc-deduction-files-list').append(rowVCFile({'id':uuidv4(),'filename':filename, 'state':'new', 'filetype':'deduction'}));
          updateRowNumbers("vc-deduction-files-list");
  
          $("#file-upload-modal").modal("hide");
        }
      });
    }
  }









  function previewVCFile(elem){
    //In TeMP
    if(elem.attr('data-state') == 'new'){
        if(elem.hasClass('accrual'))
            path="@tmp"+'upload/'+$('#save-accrual').val();
        else
            path="@tmp"+'upload/'+$('#save-deduction').val();
      local_preview=1;
    }
    else{
      if($('#vc-item-files-list').attr('data-type') == '0')
        path=securels.get('my_vessel')+'/budget/vessel_cash/accruals/'+$('#vc-item-files-list').attr('data-id');
      else
        path=securels.get('my_vessel')+'/budget/vessel_cash/deductions/'+$('#vc-item-files-list').attr('data-id');
      local_preview=0;
    }
  
    if(path.length>0){
      fp=filePreview({file_path: path+"/"+elem.find('.filename').text(), ar:1, local_preview:local_preview});
      fp.done(function(d){
        if(d=='ok')window.open('file_udp/filePreview.php',"_blank");
        else toastr.error(dict['error_occurred']);
      });
    }
  
  }


  function removeVCFile(elem){
    if(confirm(dict['remove_file_value'].replace('@value',elem.find('.filename').text()))){
        delete_files.push(elem.attr('data-id'));
        elem.remove();
    }

  }


  function rowVCFile(values){
    r="<tr class='vc-file "+values.filetype+"' data-id='"+values.id+"' data-state='"+values.state+"'>";
    r+="<td class='row-counter'></td>";
    r+="<td class='filename' ondblclick='previewVCFile($(this).closest(\"tr\"))'>"+values.filename+"</td>";
    if(isset(values.no_delete))
      r+="";
    else
      r+="<td class='vc-file-delete noselect cursor-hand ui-hover-remove text-center text-middle' onclick='removeVCFile($(this).closest(\"tr\"))'><i class='bi bi-x'></i></td>";
    r+="</tr>";
    return r;
  }


  function searchRecords(){
    from=new Date(momGetDate('vc-from'));
    till=new Date(momGetDate('vc-till'));
    search_budget_codes = $('#vs-show-codes').val();
    search_currency=$('#vs-show-currency').val();
    search_cash_advance = cBoolToInt($('#vc-only-cash-advance').prop('checked')).toString();



    display_list=records.filter(x=>x.datetime_conv >= from && x.datetime_conv <= till && x.currency == search_currency );
    if(search_cash_advance == '1')
        display_list=display_list.filter(x=>x.cash_advance == search_cash_advance);  

    if(search_budget_codes.length > 0){
        tmp_list=[];
        for(x=0;x<display_list.length;x++){
            if(search_budget_codes.includes(display_list[x].budget_code_id))
                tmp_list.push(display_list[x]);
        }
        display_list=tmp_list;
    }


    ht='';ded=0;acc=0;
    for(i=0;i<display_list.length;i++){
        ht+=rowVC(display_list[i]);
 
        if(display_list[i].type == '0')acc+=decimal(display_list[i].amount);
        else ded+=decimal(display_list[i].amount);
    }
    $('#vc-item-list').html(ht);
    updateRowNumbers("vc-item-list");
    $('#vc-total-deductions').val(ded.toFixed(2));
    $('#vc-total-accruals').val(acc.toFixed(2));
    $('#vc-total-cash').val((acc-ded).toFixed(2));
    getCurrentOnBoard();
  }



  function setupCashAdvance(){
    params={};
    params.crew_id=$('#vc-deduction-cash-advance-recipient').val();
    params.date=momGetDateTime('vc-deduction-date');
    params.amount=$('#vc-deduction-amount').val();
    params.currency = $('#vc-deduction-currency').val();
    $.ajax({
      type:'POST',
      url:'function_call.php?f=524',
      data:{'fName':'setupCashAdvance',"params":params},
      cache:false,
      error:function(error){if(!JSON.stringify(error).includes('Session ended!'))alert(JSON.stringify(error)); else CallPulse();},
      beforeSend:function(){ShowLoader();},
      complete:function(){HideLoader();},
      success:function(d){
        if(d.includes('.php'))
            window.open(d,'_blank');
      }
    });
  }


  function getCurrentOnBoard(){
    deduction=0;accrual=0;
    tmp_list=records.filter(x=>x.currency == $('#vs-show-currency').val());
    for(x=0;x<tmp_list.length;x++){
      if(tmp_list[x].type == '0')accrual+=decimal(tmp_list[x].amount);
      else deduction+=decimal(tmp_list[x].amount);
    }
    total=(accrual - deduction).toFixed(2);
    $('#vc-cash-on-board').html(total);

  }



  function printCashReport(){
    mi={};
    mi.data = [];
    mi.date_from = convertDate(momGetDate('vc-from'),'web');
    mi.date_till = convertDate(momGetDate('vc-till'),'web');
    mi.currency = $('#vs-show-currency').val();


    $('#vc-item-list tr').each(function(){
        itm = {};
        itm.type = $(this).attr('data-type');
        itm.date = $(this).find('.cash-date').text().split(' ')[0];
        bud = budget_codes.find(x=>x.code == $(this).find('.cash-budget-code').text());
        if(isset(bud)){
            itm.budget_code = bud.content;
        }
        else itm.budget_code='';
        itm.currency = $(this).attr('data-currency');
        itm.amount = $(this).find('.cash-amount').text();
        itm.ns = $(this).find('.cash-budget-name-surname').text();
        itm.remark = $(this).find('.cash-budget-remarks').text();
        mi.data.push(itm);
    });
    mi.data = mi.data.reverse();
    mi.data = LZUTF8.compress(JSON.stringify(mi.data)).join(' ');


      $.ajax({
          type:'POST',
          url:'function_call.php?f=524',
          data:{'fName':'printCashReport','params':mi},
          cache:false,
          error:function(error){if(!JSON.stringify(error).includes('Session ended!'))alert(JSON.stringify(error)); else CallPulse();},
          success:function(d){
              if(d.includes('.php'))
                  window.open(d,'_blank');

          }
      });


  }