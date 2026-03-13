(function($){
    $(document).ready(function(){

checkInputFill();
});
})(jQuery);



function checkInputFill(){
  $('label').each(function(){
    if('#'+$(this).prop('for')!='#'){
      elem=$('input#'+$(this).prop('for')+'.form-control, textarea#'+$(this).prop('for')+'.form-control');
      if(elem.length>0 && !elem.is('select') && $(this).prop('for')!='usr' && $(this).prop('for')!='pwd'){
        if(elem.val().length>0 || elem.attr('placeholder')){
          $(this).addClass('active');
        }
        else{
          $(this).removeClass('active');
        }
      }
    }
  });
}



function initMDB(singleSelect='',by_Class=''){
  if(singleSelect==''){
  select_exist=document.getElementsByTagName('select');
  if(select_exist!=null){
    $('.mdb-select').materialSelect();
  }

  date_exist=document.getElementsByClassName("datepicker");
  if(date_exist!=null){
    $('.datepicker').pickadate({
      format:"dd.mm.yyyy",
      firstDay:1
    });
  }
  }
  else{
      if(by_Class=='')singleSelect='#'+singleSelect;
      else singleSelect='.'+singleSelect;

    if($(singleSelect).is("select"))
      $(singleSelect).materialSelect();
    else{
      $(singleSelect).pickadate({
        format:"dd.mm.yyyy",
        firstDay:1
      });
      $('.datepicker-preload').each(function(){
        mdbSetDate($(this).attr('id'),$(this).attr('data-preload'));
      });
      $('.datepicker-preload').removeClass('datepicker-preload');
    }
  }
}

function destroyMDB(singleSelect=''){
  if(singleSelect==''){
  select_exist=document.getElementsByTagName('select');
  if(select_exist!=null){
    $('.mdb-select').materialSelect({
      destroy: true
    });
  }
  }
  else{
    $('#'+singleSelect).materialSelect({
      destroy: true
    });
  }
}

function mdbSetSelect(element,value,first='none'){
  destroyMDB(element);
  $('#'+element+' option:selected').removeAttr('selected');
  if(first=='none')
  $('#'+element+' option[value="'+value+'"]').prop('selected',true);
  else
  $('#'+element+' option:first').prop('selected',true);
  initMDB(element);

  $('#' + element).one('open', function() {
    $('ul.dropdown-content[data-mdb-selectid="'+element+'"]').find('li[data-value="'+value+'"]').addClass('active');
  });
}

function mdbSetMultiSelect(element, values, first = 'none') {
  destroyMDB(element);
  $('#' + element + ' option:selected').prop('selected', false);
  if (first == 'none'){
    for(vi=0;vi<values.length;vi++){
      $('#' + element + ' option[value="' + values[vi] + '"]').prop('selected', true);
    }
    if(values.length == 0){
      $('#' + element + ' option').each(function(){
        $(this).prop('selected', false);
      })
    }
  }
    
  else
    $('#' + element + ' option:first').prop('selected', true);
  initMDB(element);
}

function mdbUpdateSelectContent(element,content,keepSearch=false){
  if(keepSearch) {
    keepSearch = $('ul.dropdown-content[data-mdb-selectid="'+element+'"]').find('input.search').val();
  }

  destroyMDB(element);
  $('#'+element).html(content);
  initMDB(element);

  if (keepSearch){
    $('#' + element).one('open', function() {
      $('ul.dropdown-content[data-mdb-selectid="'+element+'"]').find('input.search').val(keepSearch);
      $('ul.dropdown-content[data-mdb-selectid="'+element+'"]').find('input.search').trigger('keyup');
    });
  }
}

function mdbSelectState(element,state){
  destroyMDB(element);
    $('#'+element).closest('div').find('input').prop('disabled',!state);
    if(!state)
      $('#'+element).attr('disabled',!state);
    else $('#'+element).removeAttr('disabled');
    initMDB(element);
}

function mdbSetDate(element,value){
  picker=$('#'+element).pickadate('picker');
  picker.set('select',value,{format:'yyyy-mm-dd'});
}


function mdbGetDate(element,format='DB'){
  picker=$('#'+element).pickadate('picker');
  if(format=='DB')format='yyyy-mm-dd';
  else format='dd.mm.yyyy';
  return picker.get('select',format);
}


function mdbClearDate(element){
  picker=$('#'+element).pickadate('picker');
  picker.set('clear');
}


function mdbRequiredField(elem){
  elem=$('#'+elem);
  //For Inputs & Textareas
  if(elem.is('input') || elem.is('textarea')){
    if(elem.val().length==0){
      elem.closest('div').removeClass('md-empty-req-field').addClass('md-empty-req-field');
      return false;
    }
    else{
      elem.closest('div').removeClass('md-empty-req-field');
      return true;
    }
  }
}
function mdbRequiredFieldsClear(){
  $('.md-empty-req-field').removeClass('md-empty-req-field');
}

function markFieldInvalid(input){
  $('#'+input).addClass('is-invalid');
  $('#'+input).one('change', function(){
    $('#'+input).removeClass('is-invalid');
  });
}

function resetFieldInvalid(parent = false){
  if (parent && $('#'+parent).length > 0){
    $('#'+parent).find('.form-control.is-invalid').removeClass('is-invalid');
  } else {
    $('.form-control.is-invalid').removeClass('is-invalid');
  }
}