
var ei_suppliers=[];
var ei_currencies=[];
var ei_budget_codes=[];
var ei_removed_files=[];
var ei_removed_items=[];

var invoice_loaded = false;
var email_loaded = false;

function openExternalInvoices(){
        $.ajax({
          type:'POST',
          url:'function_call.php?f=132',
          data:{'fName':'openExternalInvoices'},
          cache:false,
          error:function(error){if(!JSON.stringify(error).includes('Session ended!'))alert(JSON.stringify(error)); else CallPulse();},
          beforeSend:function(){ ShowLoader();},
          complete:function(){HideLoader();},
          success:function(d){
            ei_suppliers=d.suppliers;
            ei_budget_codes=d.budget_codes;

            ht='';
            for(i=0;i<d.invoices.length;i++)
              ht+=rowExternalInvoice(d.invoices[i]);
            $('#bud-invoice-list').html(ht);
            rowExternalInvoiceControls();

            opt='<option value="-1">'+dict['not_selected']+'</option>';
            tmp_suppliers=ei_suppliers.filter(x=>x.enabled == '1');
            for(i=0;i<tmp_suppliers.length;i++){
              opt+='<option value="'+tmp_suppliers[i].id+'">'+tmp_suppliers[i].Name+'</option>';
            }
            mdbUpdateSelectContent('bud-custom-invoice-supplier',opt);

            autocomplete(document.getElementById('bud-custom-inv-item-budget-code'),ei_budget_codes,{hideDelete:"hidden", contentPath: 'content'});
            autocomplete(document.getElementById('bud-custom-invoice-choose-bc'),ei_budget_codes,{hideDelete:"hidden", contentPath: 'content'});


            treeviewEmpty('bud-custom-invoice-bCode-treeview');
            for(i=0;i<ei_budget_codes.length;i++){
              ei_budget_codes[i].name= ei_budget_codes[i].content;
              addTreeviewCategory('bud-custom-invoice-bCode-treeview',ei_budget_codes[i]);
            }
            initUITreeview('bud-custom-invoice-bCode-treeview',budgetCodeSelectedFromTreeview);
            $('#bud-custom-invoice-bCode-treeview .cat_undefined').remove();




            $('#bud-custom-invoice-remark').val(d.remarks);

            $('#bud-custom-invoices-modal').modal('show');


            opt="";
            for(i=0;i<d.units.length;i++){
              opt+='<option value = "'+d.units[i].id+'">'+d.units[i].unit_name+"</option>";
            }
            mdbUpdateSelectContent('bud-custom-inv-item-unit',opt);



            if(localStorage.hasOwnProperty('autoroute_ext_id')){
              $('.external-invoice[data-id="'+localStorage.getItem('autoroute_ext_id')+'"]').click();
              localStorage.removeItem('autoroute_ext_id');
            }
          }
        });

    
}


function newExternalInvoice(){
  $('#bud-custom-inv-title').val('');
  momSetDate('bud-custom-inv-date',getCurrentDate('DB'));
  checkInputFill();


  $('#bud-add-new-invoice-modal').modal('show');
}


function createExternalInvoice(){
    mi={};
    mi.id = uuidv4();
    mi.invoice_date = momGetDate('bud-custom-inv-date');
    mi.invoice_no = $('#bud-custom-inv-title').val();
    mi.clean_create_date = getCurrentDate('web');
    mi.create_date = getCurrentDate('DB');
    mi.remarks = '';
    mi.paid_date = '';
    mi.supplier_name = '';
    mi.total_price = '0';

  invoice_loaded=false;
  email_loaded = false;
  $('#bud-custom-overview-tab-clasic').click();
  $('#bud-custom-email-no-preview').prop('hidden',false);
  $('#bud-custom-email-iframe').prop('hidden',true);
  $("#bud-custom-invoice-preview").css('display','none');
  $('#bud-custom-invoice-no-preview').prop('hidden',false);


    if($('.external-invoice .ei-invoice-no:text("'+mi.invoice_no+'")').length == 0){
      $.ajax({
        type:'POST',
        url:'function_call.php?f=132',
        data:{'fName':'createExternalInvoices','mi':mi},
        cache:false,
        error:function(error){if(!JSON.stringify(error).includes('Session ended!'))alert(JSON.stringify(error)); else CallPulse();},
        beforeSend:function(){ ShowLoader();},
        complete:function(){HideLoader();},
        success:function(d){
          
          $('#bud-add-new-invoice-modal').modal('hide');
          mi.currency = d.currency;
          
          ht=rowExternalInvoice(mi);
          $('#bud-invoice-list').append(ht);
          rowExternalInvoiceControls();

          $('.external-invoice[data-id="'+mi.id+'"]').click();
        }
      });
    }
    else toastr.error(dict['invoice_already_exists']);


}


function removeExternalInvoice(){
  Swal.fire({
    heightAuto: false,
    title: dict['remove_invoice'],
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#3085d6',
    cancelButtonColor: '#d33',
    cancelButtonText: dict['no'],
    confirmButtonText:dict['yes']
  }).then((result) => {
    if (result.value) {
      mi={};
      mi.id=$('#bud-custom-invoice-save').val();
      $.ajax({
        type:'POST',
        url:'function_call.php?f=132',
        data:{'fName':'removeExternalInvoice','mi':mi},
        cache:false,
        error:function(error){if(!JSON.stringify(error).includes('Session ended!'))alert(JSON.stringify(error)); else CallPulse();},
        beforeSend:function(){ ShowLoader();},
        complete:function(){HideLoader();},
        success:function(d){
          $('#inv-logo').prop('hidden',false);
          $('#bud-custom-invoice-edit-form').prop('hidden',true);
          $('.external-invoice[data-id="'+mi.id+'"]').remove();
        }
      });
    }
  });

}


function saveExternalInvoice(){
  mi={};
  mi.id=$('#bud-custom-invoice-save').val();
  mi.paid_date = '';
  if(!momEmptyDate('bud-custom-invoice-paid-date')){
    mi.paid_date=momGetDate('bud-custom-invoice-paid-date');
  }
  mi.prepayment_date='';
  if(!momEmptyDate('bud-custom-invoice-prepayment-date')){
    mi.prepayment_date=momGetDate('bud-custom-invoice-prepayment-date');
  }

  mi.review_status = $('#bud-custom-invoice-status').val();
  mi.currency=$('#bud-custom-invoice-currency').val();
  mi.currency_rate=$('#bud-custom-invoice-currency-rate').val();
  mi.remarks=$('#bud-custom-invoice-remark').val();
  mi.supplier_id = $('#bud-custom-invoice-supplier').val();
  mi.supplier_name = $('#bud-custom-invoice-supplier option:selected').text();
  mi.total_price=$('#bud-custom-invoice-total').val();
  mi.files=[];
  $('.ei-file-item[data-action="add"]').each(function(){
    item={};
    item.id = $(this).attr('data-id');
    item.filename=$(this).find('.file-item-filename').text();
    item.filepath=$(this).attr('data-filepath');
    mi.files.push(item);
  });
  mi.items=[];
  mi.total_price = 0;
  $('.ei-item').each(function(){
    item={};
    item.id=$(this).attr('data-id');
    item.budget_code_id=$(this).attr('data-budget-code');
    item.name=$(this).find('.ei-name').text();
    item.price=decimal($(this).find('.ei-price').text()).toFixed(2);
    item.prev_price=decimal($(this).attr('data-prev-price'));
    item.comment=$(this).find('.ei-comment').text();
    if($(this).prop('hidden')){
      item.deleted='1';
    }
    item.unit_id = $(this).attr('data-unit-id');
    item.price_per_unit = $(this).find('.ei-unit-price').text();
    item.quantity = $(this).find('.ei-quantity').text();
    mi.total_price += decimal($(this).find('.ei-price').text());
    mi.items.push(item);
  });
  mi.removed_files=ei_removed_files;
  mi.removed_items=ei_removed_items;


  $.ajax({
    type:'POST',
    url:'function_call.php?f=132',
    data:{'fName':'saveExternalInvoice','mi':mi},
    cache:false,
    error:function(error){if(!JSON.stringify(error).includes('Session ended!'))alert(JSON.stringify(error)); else CallPulse();},
    beforeSend:function(){ ShowLoader();},
    complete:function(){HideLoader();},
    success:function(d){
      if(d.answer == 'ok'){
        ei_removed_files=[];
        ei_removed_items=[];

        $('.ei-item').each(function(){
          $(this).attr('data-prev-price',$(this).find('.ei-price').text());
          if($(this).prop('hidden'))$(this).remove();
        });

        for(i=0;i<d.new_sums.length;i++){
          num_group=$('.num-group[data-item-id="'+d.new_sums[i].item_id+'"][data-month="'+d.month+'"]');
          num_group.find('.num-fact').html(d.new_sums[i].new_sum);
          recountTableTotalFact(num_group);
        }


        $('.ei-file-item[data-action="add"]').each(function(){
          $(this).attr('data-action','none');
        });

        row=$('.external-invoice[data-id="'+mi.id+'"]');
        if(mi.paid_date.length > 0){
          row.find('.ei-paid').replaceWith('<td class="text-center ei-paid"><i class="bi bi-check-lg"></i></td>');
        }
        row.find('.ei-remarks').html(mi.remarks);
        prepay='';
        if(mi.prepayment_date.length > 0)
          prepay=convertDate(mi.prepayment_date,'web');
        row.find('.ei-prepay').html(prepay);

        row.find('.ei-supplier').html(mi.supplier_name);
        row.find('.ei-sum').html(mi.total_price+' '+mi.currency);



        if(mi.review_status == '1')
            row.find('.ei-status').html('<i class="bi bi-check-circle-fill text-success"></i><span class="success">'+dict['approved']+'</span>');
        else
          row.find('.ei-status').html('<i class="bi bi-question-circle-fill text-warning"></i><span class="warning">'+dict['need_review']+'</span>');

        toastr.success(dict['data_saved']);
      }

    }
  });

}




function rowExternalInvoice(values){
  prepay='';
  if(isset(values.prepayment_date) && values.prepayment_date.length > 0)
    prepay = convertDate(values.prepayment_date,'web');

  ai_mode='';
  if(values.ai_type == '1')
    ai_mode='<i class="bi bi-filetype-pdf"></i>';
  else if(values.ai_type == '2')
    ai_mode='<i class="bi bi-file-earmark-image"></i>';

  rev_status='';
  if(values.review_status == '1')
    rev_status='<i class="bi bi-check-circle-fill text-success"></i><span class="success">'+dict['approved']+'</span>';
  else if(values.review_status == '0')
    rev_status='<i class="bi bi-question-circle-fill text-warning"></i><span class="warning">'+dict['need_review']+'</span>';

r='<tr data-id="'+values.id+'" class="cursor-hand external-invoice">';
    r+='<td class="ei-received-date">'+values.clean_create_date+'</td>';
    r+='<td class="ei-invoice-no">'+values.invoice_no+'</td>';
    r+='<td>'+convertDate(values.invoice_date,'web')+'</td>';
    r+='<td class="ei-status">'+rev_status+'</td>';
    r+='<td class="ei-supplier">'+values.supplier_name+'</td>';
    r+='<td class="ei-sum">'+decimal(values.total_price).toFixed(2)+' '+values.currency+'</td>';
    r+='<td class="ei-prepay">'+prepay+'</td>';
    if(values.paid_date.length > 0){
      r+='<td class="text-center ei-paid"><i class="bi bi-check-lg"></i></td>';                        
    }
    else r+='<td class="text-center ei-paid"></td>'
    r+='<td class="text-center ei-ai">'+ai_mode+'</td>';
r+='</tr>';
return r;
}

function rowExternalInvoiceControls() {
  $('.external-invoice').unbind().click(function () {
    selectedItem($(this));
    $('#inv-logo').prop('hidden',true);
    $('#bud-custom-invoice-edit-form').prop('hidden',false);
    loadExternalInvoice($(this).attr('data-id'));
  });
}


function loadExternalInvoice(id){
  mi.id=id;

  $.ajax({
    type:'POST',
    url:'function_call.php?f=132',
    data:{'fName':'loadExternalInvoice','mi':mi},
    cache:false,
    error:function(error){if(!JSON.stringify(error).includes('Session ended!'))alert(JSON.stringify(error)); else CallPulse();},
    beforeSend:function(){ ShowLoader();},
    complete:function(){HideLoader();},
    success:function(d){
      invoice_loaded=false;
      email_loaded = false;
      $('#bud-custom-overview-tab-clasic').click();
      $('#bud-custom-email-no-preview').prop('hidden',false);
      $('#bud-custom-email-iframe').prop('hidden',true);
      $("#bud-custom-invoice-preview").css('display','none');
      $('#bud-custom-invoice-no-preview').prop('hidden',false);

      ei_currencies=d.currencies;
      $('#bud-custom-invoice-save').val(d.id);
      $('#invoiceNumber').html(d.invoice_no);
      $('#bud-custom-inv-invoice-no').html(d.invoice_no);
      $('#bud-custom-invoice-remark').val(d.remarks);

      mdbSetSelect('bud-custom-invoice-status',d.review_status);
      $('#bud-custom-invoice-bank-alert').prop('hidden',true);
      if(d.iban_alert == '1')
          $('#bud-custom-invoice-bank-alert').prop('hidden',false);


      opt='';
      for(i=0;i<ei_currencies.length;i++){
        opt+="<option value='"+ei_currencies[i].iso+"'>"+ei_currencies[i].iso+"</option>";
      }
      $('#bud-custom-invoice-currency').html(opt);
      cur=ei_currencies.find(x=>x.iso == d.currency);
      cur.exchange_to_eur=d.rate_to_eur;
      $('#bud-custom-invoice-currency').val(cur.iso);

      $('#bud-custom-invoice-currency').attr('data-prev-currency', cur.iso);
      $('#bud-custom-invoice-currency-rate').val(cur.exchange_to_eur);
      
      momClearDate('bud-custom-invoice-paid-date');
      if(d.paid_date.length > 0){
        momSetDate('bud-custom-invoice-paid-date',d.paid_date);
      }
      momClearDate('bud-custom-invoice-prepayment-date');
      if(d.prepayment_date.length > 0){
        momSetDate('bud-custom-invoice-prepayment-date',d.prepayment_date);
      }

      mdbSetSelect('bud-custom-invoice-supplier',d.supplier_id);


      ht='';
      for(i=0;i<d.files.length;i++)
        ht+=rowExternalInvoiceFile(d.files[i]);
      $('#bud-custom-invoice-file-list').html(ht);
      updateRowNumbers('bud-custom-invoice-file-list');

      ht='';
      for(i=0;i<d.items.length;i++)
        ht+=rowExternalInvoiceItem(d.items[i]);
      $('#bud-custom-invoice-item-list').html(ht);
      updateRowNumbers('bud-custom-invoice-item-list');
    
      sparams = {};
      sparams.t_bodies = [];
      sparams.t_bodies.push('#bud-custom-invoice-item-list');

      initSortTables(sparams);
      initResizableColumns('table.two');

      externalInvoiceCountTotal();
      checkInputFill();

    }
  });
}


function newExternalInvoiceItem(){
  zacSetContent('bud-custom-inv-item-budget-code',{'id':'-1','content':''});
  $('#bud-custom-inv-item-name').val('');
  $('#bud-custom-inv-item-price').val('');
  $('#bud-custom-inv-item-comment').val('');
  $('#bud-custom-inv-item-quantity').val('');
  mdbSetSelect('bud-custom-inv-item-unit','','first');
  $('#bud-custom-inv-item-unit-price').val('');
  $('#bud-custom-inv-item-save').attr('data-new','1');
  $('#bud-custom-inv-add-item-modal').modal('show');
}


function saveExternalInvoiceItem(){
  error=0;
  if($('#bud-custom-inv-item-name').val().length == 0){
    error++
  }

  mi={};
  if(error==0){
    if($('#bud-custom-inv-item-save').attr('data-new') == '1'){
      mi.id=uuidv4();
      mi.budget_code_id = zacGetContent('bud-custom-inv-item-budget-code').id;
      mi.name = $('#bud-custom-inv-item-name').val();
      mi.price = decimal($('#bud-custom-inv-item-price').val()).toFixed(2);
      mi.comment = $('#bud-custom-inv-item-comment').val();
      mi.quantity = $('#bud-custom-inv-item-quantity').val();
      mi.price_per_unit = $('#bud-custom-inv-item-unit-price').val();
      mi.unit_id = $('#bud-custom-inv-item-unit').val();
      mi.unit_name = $('#bud-custom-inv-item-unit option:selected').text();
      mi.new_item='1';

      $('#bud-custom-invoice-item-list').append(rowExternalInvoiceItem(mi));


    }
    else{
      mi.id=$('#bud-custom-inv-item-save').val();
      mi.budget_code_id = zacGetContent('bud-custom-inv-item-budget-code').id;
      mi.name = $('#bud-custom-inv-item-name').val();
      mi.price = decimal($('#bud-custom-inv-item-price').val()).toFixed(2);
      mi.comment = $('#bud-custom-inv-item-comment').val();
      mi.quantity = $('#bud-custom-inv-item-quantity').val();
      mi.price_per_unit = $('#bud-custom-inv-item-unit-price').val();
      mi.unit_id = $('#bud-custom-inv-item-unit').val();
      mi.unit_name = $('#bud-custom-inv-item-unit option:selected').text();
      mi.new_item='0';

      elem=$('.ei-item[data-id="'+mi.id+'"]');
      elem.replaceWith(rowExternalInvoiceItem(mi));

    }

    updateRowNumbers('bud-custom-invoice-item-list');
    externalInvoiceCountTotal();
    $('#bud-custom-inv-add-item-modal').modal('hide');
  }
}

function rowExternalInvoiceItem(values){
  bud_code='';bud_title='';
  if(values.budget_code_id.length == 0) values.budget_code_id='-1';
  if(values.budget_code_id!='-1'){
    tmp=ei_budget_codes.find(x=>x.id == values.budget_code_id);
    bud_code = tmp.code;
    bud_title=tmp.title;
  }

  prev_price=values.price;
  if(isset(values.new_item))
    prev_price='0';

  r='<tr class="ei-item cursor-hand" data-id="'+values.id+'" onclick="openExternalInvoiceItem($(this))" data-budget-code="'+values.budget_code_id+'" data-prev-price="'+prev_price+'" data-unit-id="'+values.unit_id+'">';
    r+='<td class="row-counter"></td>';
    r+='<td class="ei-bcode">'+bud_code+'</td>';
    r+='<td class="ei-bcode-title">'+bud_title+'</td>';
    r+='<td class="ei-name">'+values.name+'</td>';
    r+='<td class="ei-unit">'+values.unit_name+'</td>';
    r+='<td class="ei-quantity">'+values.quantity+'</td>';
    r+='<td class="ei-unit-price">'+values.price_per_unit+'</td>';
    r+='<td class="ei-price">'+values.price+'</td>';
    r+='<td class="ei-comment">'+values.comment+'</td>';
    r+='<td class="cursor-hand ui-hover-remove text-center text-middle" onclick="externalInvoicesRemoveItem($(this).closest(\'tr\'));event.stopPropagation();"><i class="bi bi-x"></i></td>';
  r+='</tr>';
  return r;
}

function openExternalInvoiceItem(elem){

    $('#bud-custom-inv-item-save').val(elem.attr('data-id'));
    bi=ei_budget_codes.find(x=>x.id == elem.attr('data-budget-code'));
    if(isset(bi)){
      zacSetContent('bud-custom-inv-item-budget-code',{'id':elem.attr('data-budget-code'),'content':bi.content});
    }
    else
      zacSetContent('bud-custom-inv-item-budget-code',{'id':'-1','content':''});
    $('#bud-custom-inv-item-name').val(elem.find('.ei-name').text());
    mdbSetSelect('bud-custom-inv-item-unit',elem.attr('data-unit-id'));
    $('#bud-custom-inv-item-comment').val(elem.find('.ei-comment').text());
    $('#bud-custom-inv-item-quantity').val(elem.find('.ei-quantity').text());
    $('#bud-custom-inv-item-unit-price').val(elem.find('.ei-unit-price').text());
    $('#bud-custom-inv-item-price').val((decimal(elem.find('.ei-unit-price').text()) * decimal(elem.find('.ei-quantity').text())).toFixed(2));
    $('#bud-custom-inv-item-save').attr('data-new','0');
    $('#bud-custom-inv-add-item-modal').modal('show');
    checkInputFill();

}


function externalInvoiceCountPosition(elem){
  if(elem.hasClass('ei-quantity')){
    elem.closest('tr').find('.ei-price').html((decimal(elem.closest('tr').find('.ei-unit-price').text()) * decimal(elem.text()) ).toFixed(2));
  }
  else if(elem.hasClass('ei-unit-price')){
    elem.closest('tr').find('.ei-price').html((decimal(elem.closest('tr').find('.ei-quantity').text()) * decimal(elem.text()) ).toFixed(2));
  }
  else{
    elem.closest('tr').find('.ei-unit-price').html((decimal(elem.closest('tr').find('.ei-price').text()) / decimal(elem.closest('tr').find('.ei-quantity').text()) ).toFixed(2));
  }

  externalInvoiceCountTotal();
}

function countInModal(elem){
  if(elem.attr('id') == 'bud-custom-inv-item-unit-price'){
    $('#bud-custom-inv-item-price').val( (decimal($('#bud-custom-inv-item-unit-price').val()) * decimal($('#bud-custom-inv-item-quantity').val()) ).toFixed(2) );
  }
  else if(elem.attr('id') == 'bud-custom-inv-item-quantity'){
    $('#bud-custom-inv-item-price').val( (decimal($('#bud-custom-inv-item-unit-price').val()) * decimal($('#bud-custom-inv-item-quantity').val()) ).toFixed(2) );
  }
  else{
    $('#bud-custom-inv-item-unit-price').val( (decimal($('#bud-custom-inv-item-price').val()) / decimal($('#bud-custom-inv-item-quantity').val()) ).toFixed(2) );
  }
  checkInputFill();
}


function externalInvoicesRemoveItem(elem){
  Swal.fire({
    heightAuto: false,
    title: dict['remove_item'],
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#3085d6',
    cancelButtonColor: '#d33',
    cancelButtonText: dict['no'],
    confirmButtonText:dict['yes']
  }).then((result) => {
    if (result.value) {
      ei_removed_items.push(elem.attr('data-id'));
      elem.prop('hidden',true);
      externalInvoiceCountTotal();
      updateRowNumbers('bud-custom-invoice-item-list');
    }
  });

}


function switchExternalInvoiceCurrency(currency,manual=false){
  if(!manual){
    cur=ei_currencies.find(x=>x.iso == currency);
    $('#bud-custom-invoice-currency-rate').val(cur.exchange_to_eur);
  }


  data = {};
  data['values'] = {};
  data['currency_from'] = $('#bud-custom-invoice-currency').attr('data-prev-currency');
  data['currency_to'] = $('#bud-custom-invoice-currency').val();
  //data['currenncy_rate'] = $('#bud-custom-invoice-currency-rate').val();
  $('.ei-item').each(function () {
    data['values'][$(this).attr('data-id')] = $(this).find('.ei-unit-price').text();
  });

  if (!jQuery.isEmptyObject(data.values)) {
    $.ajax({
      type: 'POST',
      url: 'function_call.php?f=452',
      data: { 'fName': "switchCurrency", "data": data },
      cache: false,
      error: function (error) { if (!JSON.stringify(error).includes('Session ended!')) alert(JSON.stringify(error)); else CallPulse(); },
      success: function (d) {
        for (key in d) {
          if (d.hasOwnProperty(key)) {
            d[key] = decimal(d[key]).toFixed(2);
            item = $('.ei-item[data-id="'+key+'"]');
            item.find('.ei-unit-price').html(d[key]);
            item.find('.ei-price').html(decimal(decimal(item.find('.ei-quantity').text()) * decimal(item.find('.ei-unit-price').text()) ).toFixed(2));
          }
        }
        $('#bud-custom-invoice-currency').attr('data-prev-currency', $('#bud-custom-invoice-currency').val());
        externalInvoiceCountTotal();

      }
    });
  }
  else{

    $('#bud-custom-invoice-currency').attr('data-prev-currency', $('#bud-custom-invoice-currency').val());
    externalInvoiceCountTotal();
  }
}



function addExternalFile(){
  gfile = [];
  $('#custom-invoice-file-input').val('');
  $('.drop-zone').off();
  $('#custom-invoice-file-input').off();

  $("#file-upload-modal").modal("show");

  // Drag&Drop upload
  $('.drop-zone').on('drop', function (e) {
    if (gfile.name) {
      uploadAction(gfile);
    }
  });

  // Classic upload
  $('.drop-zone').on('click', function () {
    $('#custom-invoice-file-input').click();
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

  $('#custom-invoice-file-input').on('change', function () {
    if ($('#custom-invoice-file-input').get(0).files.length !== 0) {
      uploadAction($('#custom-invoice-file-input'));
    }
  });

  function uploadAction(file) {
    //file_path=securels.get('my_vessel')+'/stock/'+selected_row.find('.stock-part-number').text()+'/';

    file_item = {};
    file_item["id"] = uuidv4();
    file_item["file_action"] = "add";
    if (file instanceof File) {
      file_item.filepath = "upload/"+"budget";
      file_item["filename"] = file.name.split('\\').pop().replace("'","_").replace('"','_').replace('&','_');
      fu=fileUpload({'destination':'@tmp', 'file_element':file, 'additional_path':file_item.filepath});
    } else {
      file_item.filepath = "upload/"+"budget";
      file_item["filename"] = $('#custom-invoice-file-input').val().split('\\').pop().replace("'","_").replace('"','_').replace('&','_');
      fu=fileUpload({'destination':'@tmp', 'file_element':'custom-invoice-file-input', 'additional_path':file_item.filepath});
    }

    fu.done(function(d){
      if(d=='ok'){
      $('#bud-custom-invoice-file-list').append(rowExternalInvoiceFile(file_item));
      updateRowNumbers('bud-custom-invoice-file-list');

      $("#file-upload-modal").modal("hide");
      }
    });
  }
}


function rowExternalInvoiceFile(values){
  if(!isset(values['file_action']))values['file_action']='none';
  r="<tr class='ei-file-item cursor-hand' data-id='"+values['id']+"' data-action='"+values['file_action']+"' data-filepath='"+values.filepath+"'>";
  r+="<td class='row-counter' width='30'></td>";
  r+="<td class='file-item-filename' onclick='externalInvoiceFilePreview($(this).closest(\"tr\"))' cursor-hand' >"+values['filename']+"</td>";
  r+="<td class='file-item-delete cursor-hand ui-hover-remove text-center text-middle red-text' onclick='externalInvoicesRemoveFile($(this).closest(\"tr\"))'><i class=\"bi bi-x\"></i></td>";
  r+="</tr>";

  return r;
}

function externalInvoicesRemoveFile(elem){
  Swal.fire({
    heightAuto: false,
    title: dict['remove_file_value'].replace('@value',elem.find('.file-item-filename').text()),
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#3085d6',
    cancelButtonColor: '#d33',
    cancelButtonText: dict['no'],
    confirmButtonText:dict['yes']
  }).then((result) => {
    if (result.value) {
      ei_removed_files.push(elem.attr('data-id'));
      elem.remove();
    }
  });

}


function externalInvoiceFilePreview(file_item){
  local_preview=0;
  filepath=file_item.find('.file-item-filename').text();
  //In TeMP
  if(file_item.attr('data-filepath').split('/')[0]=='upload'){
    filepath="@tmp"+file_item.attr('data-filepath')+'/'+filepath;
    local_preview=1;
  }
  else filepath=file_item.attr('data-filepath')+'/'+file_item.find('.file-item-filename').text();

  fp=filePreview({file_path: filepath, ar:1, local_preview:local_preview});
  fp.done(function(d){
    if(d=='ok')window.open('file_udp/filePreview.php',"_blank");
    else toastr.error(dict['error_occurred']);
  });
}


function externalInvoiceCountTotal(){
  total=0;
  $('.ei-item .ei-price').each(function(){
    if(!$(this).closest('tr').prop('hidden'))
    total+=decimal($(this).text());
  });
  $('#bud-custom-invoice-total').val(total.toFixed(2));
}


function searchExternalInvoices(){
  txt=$('#bud-invoice-search').val().toLowerCase();
  only_paid=$('#bud-invoice-only-paid').prop('checked');

  if(txt.length > 0 || only_paid){
    $('.external-invoice').each(function(){
      show=true;
      if(txt.length > 0){
        if(!$(this).find('.ei-invoice-no').text().toLowerCase().includes(txt))
          show=false;
        }
      if(only_paid && show){
        if($(this).find('.ei-paid').html() == 0)show=false;
      }

      $(this).prop('hidden',!show);
    });
  }
  else{
    $('.external-invoice').prop('hidden',false);
  }
}


function budgetCodeSelectedFromTreeview(elem){
  bc_search=$('#bud-custom-invoice-bCode-treeview .selected-item2');
  if(bc_search.length>0){
    bc_id=getFullClassName(bc_search,"cat_",true);
    tmp=ei_budget_codes.find(x=>x.id == bc_id);
    zacSetContent('bud-custom-invoice-choose-bc',{content:tmp.content, id:bc_id});
    //deckItemInput();
    checkInputFill();
  }
}

function applyExternalBudgetCode(){
  mi={};
  mi.id = zacGetContent('bud-custom-invoice-choose-bc').id;
  mi.invoice_id = $('#bud-custom-invoice-save').val();

  if(mi.id!='-1'){
    $.ajax({
      type:'POST',
      url:'function_call.php?f=132',
      data:{'fName':'applyExternalBudgetCode','mi':mi},
      cache:false,
      error:function(error){if(!JSON.stringify(error).includes('Session ended!'))alert(JSON.stringify(error)); else CallPulse();},
      beforeSend:function(){ ShowLoader();},
      complete:function(){HideLoader();},
      success:function(d){
        if(d.answer == 'ok'){
          bi=ei_budget_codes.find(x=>x.id == mi.id);
          if(isset(bi)){
            $('.ei-item').each(function(){
              $(this).attr('data-budget-code',mi.id);
              $(this).find('.ei-bcode').html(bi.code);
              $(this).find('.ei-bcode-title').html(bi.name);

            });
            toastr.info(dict.budget_code_applied_to_items);

          }

        }


      }
    });

  }

}


function previewInvocieTab() {
  if(!invoice_loaded){
    mi={};
    mi.invoice_id = $('#bud-custom-invoice-save').val();
    $.ajax({
      type:'POST',
      url:'function_call.php?f=132',
      data:{'fName':'preparePreviewInvoice','mi':mi},
      cache:false,
      error:function(error){if(!JSON.stringify(error).includes('Session ended!'))alert(JSON.stringify(error)); else CallPulse();},
      beforeSend:function(){ ShowLoader();},
      complete:function(){HideLoader();},
      success:function(d){
        if(isset(d.filename_path)){
          invoice_loaded=true;
          $("#bud-custom-invoice-preview").css('display','');
          $('#bud-custom-invoice-no-preview').prop('hidden',true);
          $("#bud-custom-invoice-preview").officeToHtml({
            url: d.filename_path,
            imageSetting: {
              frame: ['100%', '100%',false],
              maxZoom: '1100%',
              zoomFactor: '10%',
              mouse: true,
              keyboard: true,
              toolbar: true,
              rotateToolbar: false
            }
          });
        }
        else{
          invoice_loaded=false;
          $("#bud-custom-invoice-preview").css('display','none');
          $('#bud-custom-invoice-no-preview').prop('hidden',false);
        }

      }
    });

  }


}

function previewEmailTab() {
  if(!email_loaded){
    mi={};
    mi.invoice_id = $('#bud-custom-invoice-save').val();
    $.ajax({
      type:'POST',
      url:'function_call.php?f=132',
      data:{'fName':'preparePreviewEmail','mi':mi},
      cache:false,
      error:function(error){if(!JSON.stringify(error).includes('Session ended!'))alert(JSON.stringify(error)); else CallPulse();},
      beforeSend:function(){ ShowLoader();},
      complete:function(){HideLoader();},
      success:function(d){
        if(isset(d.filename_path)){
          email_loaded=true;
          $('#bud-custom-email-no-preview').prop('hidden',true);
          $('#bud-custom-email-iframe').prop('hidden',false);
          $('#bud-custom-email-iframe').attr('src',d.filename_path);
        }
        else {
          email_loaded=false;
          $('#bud-custom-email-no-preview').prop('hidden',false);
          $('#bud-custom-email-iframe').attr('src','');
          $('#bud-custom-email-iframe').prop('hidden',true);
        }

      }
    });

  }


}
