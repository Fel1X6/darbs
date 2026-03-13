
function loadTemplateInterface(){
  //row='';
  //for(i=0;i<cats.length;i++)
    //row+=rowTemplateCategory(cats[i]);

  //$('#bud-template-cat-list').html(row);
  $('#bud-categories').empty();
  for(i=0;i<cats.length;i++){
    if(cats[i].parent_id=='np')
      $('#bud-categories').append(templateItem(cats[i]));
    else{
      if(!$('.template-inter-item[data-id="'+cats[i].parent_id+'"]').hasClass('template-category')){
        convertItemToCategory(cats[i].parent_id);
      }
      $('.template-category-items[data-id="'+cats[i].parent_id+'"]').append(templateItem(cats[i]));
    }

  }

  initTemplateCategoryControl();

  for(i=0;i<cats.length;i++)
    $('.template-inter-item[data-id="'+cats[i].id+'"]').find('.marker').css('background-color',returnLevelColor(cats[i].level));
}

function rowTemplateCategory(values){
  r="<tr class='bud-template-cat-item cursor-hand'>";
  r+="<td class='bud-template-cat-item-id' hidden>"+values.id+"</td>";
  r+="<td class='bud-template-cat-item-code'>"+values.code+"</td>";
  r+="<td class='bud-template-cat-item-title'>"+values.title+"</td>";
  r+="</tr>";
  return r;
}

function initTemplateCategoryControl(){
  $('.bud-template-cat-item').unbind().click(function(){
    selectedItem($(this));
    loadTemplateCategoryItems($(this).find('.bud-template-cat-item-id').text());
  });
  if(sysModuleAccess(true).usr_bn_budget_planning_template=='1'){
    $('.bud-template-cat-item').dblclick(function(){
      loadCategory($(this).find('.bud-template-cat-item-id').text());
    });
  }

}


function rowTemplateItem(values){
  r="<tr class='bud-template-item cursor-hand'>";
  r+="<td class='bud-template-item-id' hidden>"+values.id+"</td>";
  r+="<td class='bud-template-item-code'>"+values.code+"</td>";
  r+="<td class='but-template-item-title'>"+values.title+"</td>";
  r+="</tr>";
  return r;
}

function initTemplateItemsControl(){
  $('.bud-template-item').unbind().click(function(){
    selectedItem($(this));
  });

  $('.bud-template-item').dblclick(function(){
    loadItem($(this).find('.bud-template-item-id').text());
  });

}



function loadTemplateCategoryItems(cat_id){
  if(isset(cat_id) && cat_id.length>0){
  tmp_items=[];
  tmp_items=items.filter(x=>x.category_id == cat_id).sort(function(a,b){ return parseInt(a.order_no) - parseInt(b.order_no) });
  row="";
  for(i=0;i<tmp_items.length;i++)
    row+=rowTemplateItem(tmp_items[i]);
  }
  else row='';
  $('#bud-template-items-list').html(row);
  initTemplateItemsControl();
}




















function newCategory(){
  $('#bud-template-cat-code').val('');
  $('#bud-template-cat-title').val('');
  $('#bud-template-cat-enabled').prop('checked',true);
  $('#bud-template-cat-save').val(uuidv4());
  $('#bud-template-overbudget').prop('cheked',false);

  $('#bud-template-cat-modal').modal('show');
  checkInputFill();
}

function loadCategory(cat_id){
  $.ajax({
    type:'POST',
    url:'function_call.php?f=132',
    data:{'fName':'loadCategory','cat_id':cat_id},
    cache:false,
    error:function(error){if(!JSON.stringify(error).includes('Session ended!'))alert(JSON.stringify(error)); else CallPulse();},
    beforeSend:function(){ ShowLoader();},
    complete:function(){HideLoader();},
    success:function(d){
      $('#bud-template-cat-code').val(d.code);
      $('#bud-template-cat-title').val(d.title);
      $('#bud-template-cat-enabled').prop('checked',true);
      $('#bud-template-cat-save').val(d.id);
      $('#bud-template-overbudget').prop('checked',cIntToBool(d.overbudget_item));

      if(d.level == '1'){
        $('#bud-template-overbudget').css('display',"");
      }
      else $('#bud-template-overbudget').css('display',"none");

      $('#bud-template-cat-modal').modal('show');
      checkInputFill();

   }
  });
}



function saveCategory(){
  error=0;
  if($('#bud-template-cat-code').val().length==0){
    error++;
    toastr.error(dict['code_field_is_empty']);
  }
  if($('#bud-template-cat-title').val().length==0){
    error++;
    toastr.error(dict['title_is_empty']);
  }
  if(isset(cats.find(x=>x.id != $('#bud-template-cat-save').val() && x.code == $('#bud-template-cat-code').val()))){
    error++;
    toastr.errpr(dict['category_already_exists']);
  }

  if(error==0){
    mi={};
    mi['id']=$('#bud-template-cat-save').val();
    mi['code']=$('#bud-template-cat-code').val();
    mi['title']=$('#bud-template-cat-title').val();
    mi['enabled']=cBoolToInt($('#bud-template-cat-enabled').prop('checked'));
    mi.overbudget_item = cBoolToInt($('#bud-template-overbudget').prop('checked'));
    mi['parent_id']='np';
    mi['level']='1'; 
    mi.childs=getAllChilds(mi['id']);

    $.ajax({
      type:'POST',
      url:'function_call.php?f=132',
      data:{'fName':'saveCategory','mi':mi},
      cache:false,
      error:function(error){if(!JSON.stringify(error).includes('Session ended!'))alert(JSON.stringify(error)); else CallPulse();},
      beforeSend:function(){ ShowLoader();},
      complete:function(){HideLoader();},
      success:function(d){
       if(d.answer=='ok'){
         ind=cats.findIndex(x=>x.id == mi.id);
         if(ind!=-1){
           div=$('.template-item[data-id="'+mi.id+'"]');
             cats[ind].code=mi.code;
             cats[ind].title=mi.title;
             cats[ind].overbudget_item = mi.overbudget_item;
             div.find('.template-item-title').html(mi.code+' '+mi.title);

         }
         else{
           item=mi;
           item.order_no='999';
           cats.push(item);
          // $('#bud-template-cat-list').append(rowTemplateCategory(item));
          $('#bud-categories').append(templateItem(item));
         }

         for(i=0;i<cats.length;i++)
           $('.template-inter-item[data-id="'+cats[i].id+'"]').find('.marker').css('background-color',returnLevelColor(cats[i].level));

         toastr.success(dict['category_saved']);
         $('#bud-template-cat-modal').modal('hide');

         $('#bud-templates-tab-classic').attr('data-changed','1');
       }
       else toastr.error(dict['error_occurred']+": "+JSON.stringify(d));

      }
    });
  }


  function getAllChilds(parentId) {
    childIds = [];
 
    // Function to recursively find child IDs
    function findChildren(parentId) {
      children = cats.filter(x=>x.parent_id == parentId)
      children.forEach(function(item) {
        childId = item.id;
        childIds.push(childId);
        // Recursively find children
        findChildren(childId);
      });
    }
  
    findChildren(parentId);
  
    return childIds;
  }
}


function templateItem(values){
  main_cat='0';
  if(values.parent_id=='np') main_cat='1';
  row='<li class="multiexpand-tree__item">';
    row+='<div class="multiexpand-tree__item-inner template-inter-item template-item" data-id="'+values.id+'" data-main-cat="'+main_cat+'">';
      row+='<div class="marker"></div>';
      row+='<a href="#" class="template-title" onclick="if($(this).closest(\'div.template-item\').attr(\'data-main-cat\')==\'1\')loadCategory($(this).closest(\'div.template-item\').attr(\'data-id\')); else loadItem($(this).closest(\'div.template-item\').attr(\'data-id\'))"><strong class="mr-1">'+values.code+'</strong> '+values.title+'</a>';
      row+='<span onclick="newItem($(this).closest(\'.template-item\').attr(\'data-id\'));">'+dict['add_sub_category']+' <i class="bi bi-plus-square"></i></span>';
    row+='</div>';
  row+='</li>';

  return row;
}





function newItem(cat_id){
  $('#bud-template-item-code').val('');
  $('#bud-template-item-title').val('');
  $('#bud-template-item-enabled').prop('checked',true);
  $('#bud-template-item-save').val(uuidv4());
  $('#bud-template-item-save').attr('data-parent-id',cat_id);
  $('.bud-template-item-field-select').html('<i class="bi bi-square"></i>');
  $('.bud-template-item-field').attr('data-origin-value','0');

  if(cat_id == 'np'){
    $('#bud-template-overbudget').css('display',"");
  }
  else $('#bud-template-overbudget').css('display',"none");

  

  opt='';
  for(i=0;i<cats.length;i++)
      opt+="<option value='"+cats[i].id+"'>"+cats[i].code+" - "+cats[i].title+"</option>";

  mdbUpdateSelectContent('bud-template-item-cat',opt);
    mdbSetSelect('bud-template-item-cat',cat_id);

  $('#bud-template-item-modal').modal('show');
  checkInputFill();
}

function loadItem(item_id){
  $.ajax({
    type:'POST',
    url:'function_call.php?f=132',
    data:{'fName':'loadItem', 'item_id':item_id},
    cache:false,
    error:function(error){if(!JSON.stringify(error).includes('Session ended!'))alert(JSON.stringify(error)); else CallPulse();},
    beforeSend:function(){ ShowLoader();},
    complete:function(){HideLoader();},
    success:function(d){
      $('#bud-template-item-code').val(d.code);
      $('#bud-template-item-title').val(d.title);
      $('#bud-template-item-enabled').prop('checked',true);
      $('#bud-template-item-save').val(d.id);
      $('.bud-template-item-field-select').html('<i class="bi bi-square"></i>');
      $('.bud-template-item-field').attr('data-origin-value','0');
      for(i=0;i<d.special_fields.length;i++){
        field=$('.bud-template-item-field[data-field-id="'+d.special_fields[i].field_id+'"]');
        field.find('.bud-template-item-field-select').html('<i class="bi bi-check-square"></i>');
        field.attr('data-origin-value','1');
      }

      opt='';
      for(i=0;i<cats.length;i++)
        if(cats[i].id != d.id)
          opt+="<option value='"+cats[i].id+"'>"+cats[i].code+" - "+cats[i].title+"</option>";

      mdbUpdateSelectContent('bud-template-item-cat',opt);
      mdbSetSelect('bud-template-item-cat',d.parent_id);

      if(cats.filter(x=>x.parent_id == item_id).length>0)
        $('#bud-template-item-sfs').prop('hidden',true);
      else
        $('#bud-template-item-sfs').prop('hidden',false);

      $('#bud-template-item-modal').modal('show');
      checkInputFill();

    }
  });
}



function saveItem(){
  error=0;
  if($('#bud-template-item-code').val().length==0){
    error++;
    toastr.error(dict['code_field_is_empty']);
  }
  if($('#bud-template-item-title').val().length==0){
    error++;
    toastr.error(dict['title_is_empty']);
  }
  if(isset(cats.find(x=>x.id != $('#bud-template-item-save').val() && x.code == $('#bud-template-item-code').val()))){
    error++;
    toastr.error(dict['item_already_exists']);
  }

  if(error==0){
    mi={};
    mi['id']=$('#bud-template-item-save').val();
    mi['code']=$('#bud-template-item-code').val();
    mi['title']=$('#bud-template-item-title').val();
    mi['parent_id']=$('#bud-template-item-cat').val();
    mi['enabled']=cBoolToInt($('#bud-template-item-enabled').prop('checked'));
    mi['spec_fields']=[];
    $('.bud-template-item-field').each(function(){
      item={};
      item.field_id=$(this).attr('data-field-id');
      item.origin=$(this).attr('data-origin-value');
      item.current='0';
      if($(this).find('.bud-template-item-field-select').html()=='<i class="bi bi-check-square"></i>')
        item.current='1';
      mi.spec_fields.push(item);
    });
    mi.childs=getAllChilds(mi['id']);

    $.ajax({
      type:'POST',
      url:'function_call.php?f=132',
      data:{'fName':'saveItem', 'mi':mi},
      cache:false,
      error:function(error){if(!JSON.stringify(error).includes('Session ended!'))alert(JSON.stringify(error)); else CallPulse();},
      beforeSend:function(){ ShowLoader();},
      complete:function(){HideLoader();},
      success:function(d){
        if(d.answer=='ok'){
          mi.level=d.level;
          included_spec_fields=[];
          tmp_list=mi.spec_fields.filter(x=>x.current == '1');
          for(i=0;i<tmp_list.length;i++)
            included_spec_fields.push(tmp_list[i].field_id);


          ind=cats.findIndex(x=>x.id == mi.id);
          if(ind!=-1){
              prev_parent_id=cats[ind].parent_id;
              cats[ind].code=mi.code;
              cats[ind].title=mi.title;
              cats[ind].parent_id=mi.parent_id;
              cats[ind].level=d.level;
              cats[ind].special_fields=included_spec_fields;
              $('.template-inter-item[data-id="'+mi.id+'"]').find('.template-title').html('<strong class="mr-1">'+mi.code+'</strong> '+mi.title);
              //$('.bud-template-item-id:text("'+mi.id+'")').closest('tr').replaceWith(rowTemplateItem(items[ind]));
              //Check if item goes to new parent
              if(prev_parent_id!=mi.parent_id){
                if(!$('.template-inter-item[data-id="'+mi.parent_id+'"]').hasClass('template-category'))
                  convertItemToCategory(mi.parent_id);
                elem=$('.template-inter-item[data-id="'+mi.id+'"]').closest('li').html();
                $('.template-inter-item[data-id="'+mi.id+'"]').closest('li').remove();
                $('.template-category-items[data-id="'+mi.parent_id+'"]').append('<li class="multiexpand-tree__item">'+elem+"</li>");

                //Check if previous childs left
                if($('.template-category-items[data-id="'+prev_parent_id+'"] li').length==0){
                  convertCategoryToItem(prev_parent_id);
                }
              }

          }
          else{
            item.code=mi.code;
            item.title=mi.title;
            item.id=mi.id;
            item.parent_id=mi.parent_id;
            item.level=d.level;
            item.special_fields=included_spec_fields;
            item.order_no='999';
            cats.push(item);
            if(!$('.template-inter-item[data-id="'+mi.parent_id+'"]').hasClass('template-category'))
              convertItemToCategory(mi.parent_id);
            $('.template-category-items[data-id="'+mi.parent_id+'"]').append(templateItem(item));
            //$('#bud-template-items-list').append(rowTemplateItem(item));
          }

          for(i=0;i<cats.length;i++)
            $('.template-inter-item[data-id="'+cats[i].id+'"]').find('.marker').css('background-color',returnLevelColor(cats[i].level));

          toastr.success(dict['item_data_saved']);
          $('#bud-template-item-modal').modal('hide');

          $('#bud-templates-tab-classic').attr('data-changed','1');
        }
        else toastr.error(dict['error_occurred']+": "+JSON.stringify(d));

      }
    });
  }

  function getAllChilds(parentId) {
    childIds = [];
 
    // Function to recursively find child IDs
    function findChildren(parentId) {
      children = cats.filter(x=>x.parent_id == parentId)
      children.forEach(function(item) {
        childId = item.id;
        childIds.push(childId);
        // Recursively find children
        findChildren(childId);
      });
    }
  
    findChildren(parentId);
  
    return childIds;
  }
}


function convertItemToCategory(item_id){
  item_div=$('.template-item[data-id="'+item_id+'"]');


    if(item_div.length>0){
      ca='<span class="me-child-expand" onclick="meExpandToggle($(this))"></span>';
      ca+='<div class="multiexpand-tree__item-inner template-inter-item template-category" data-id="'+item_id+'" data-main-cat="'+item_div.attr('data-main-cat')+'">';
        ca+='<div class="marker"></div>';
        ca+='<a href="#" class="template-title" onclick="if($(this).closest(\'div.template-category\').attr(\'data-main-cat\')==\'1\')loadCategory($(this).attr(\'data-id\')); else loadItem($(this).attr(\'data-id\'))" data-id="'+item_id+'">'+item_div.find('.template-title').html()+'</a>';
        ca+='<span onclick="newItem($(this).attr(\'data-id\'));" data-id="'+item_id+'">'+dict['add_sub_category']+' <i class="bi bi-plus-square"></i></span>';
      ca+='</div>';
      ca+='<ul class="multiexpand-tree__child template-category-items" data-id="'+item_id+'" style="display:none;"></ul>';
      item_div.closest('li').html(ca);
    }
}


function convertCategoryToItem(category_id){
  category_div=$('.template-category[data-id="'+category_id+'"]');

    if(category_div.length>0){
      row='<div class="multiexpand-tree__item-inner template-inter-item template-item" data-id="'+category_id+'" data-main-cat="'+category_div.attr('data-main-cat')+'">';
        row+='<div class="marker"></div>';
        row+='<a href="#" class="template-title" onclick="if($(this).closest(\'div.template-item\').attr(\'data-main-cat\')==\'1\')loadCategory($(this).closest(\'div.template-item\').attr(\'data-id\')); else loadItem($(this).closest(\'div.template-item\').attr(\'data-id\'))">'+category_div.find('.template-title').html()+'</a>';
        row+='<span onclick="newItem($(this).closest(\'.template-item\').attr(\'data-id\'));">'+dict['add_sub_category']+' <i class="bi bi-plus-square"></i></span>';
      row+='</div>';
      category_div.closest('li').html(row);
    }
}




function searchInTemplate(){
  txt=$('#bud-template-search').val().toLowerCase();
  if($('.bud-template-cat-item.selected-item').length>0)
    cat_selected=$('.bud-template-cat-item.selected-item .bud-template-cat-item-id').text();
  else
    cat_selected='-1';
  tmp_cats=[];tmp_items=[];
  if(txt.length==0){
    tmp_cats=cats;
    tmp_items=items.filter(x=>x.category_id == cat_selected);
  }
  else{
    tmp_cats=cats.filter(x=>x.code.toLowerCase().includes(txt) || x.title.toLowerCase().includes(txt));
    tmp_items=items.filter(x=>(x.code.toLowerCase().includes(txt) || x.title.toLowerCase().includes(txt)) && x.category_id == cat_selected);
  }
  row="";
  for(i=0;i<tmp_cats.length;i++)
    row+=rowTemplateCategory(tmp_cats[i]);
  $('#bud-template-cat-list').html(row);
  if($('.bud-template-cat-item-id:text("'+cat_selected+'")').length>0)
    selectedItem($('.bud-template-cat-item-id:text("'+cat_selected+'")').closest('tr'));


  if($('.bud-template-cat-item.selected-item').length==0)
    tmp_items=[];

  row="";
  for(i=0;i<tmp_items.length;i++)
    row+=rowTemplateItem(tmp_items[i]);
  $('#bud-template-items-list').html(row);

  initTemplateItemsControl();
  initTemplateCategoryControl();
}

// Multiexpand Tree
function meExpandToggle(el) {
  el.closest('li.multiexpand-tree__item').find('.multiexpand-tree__child:first').toggle();
  el.toggleClass('expanded');
}

function toggleExpandAll(el) {
  if(el.hasClass('expanded')) {
    $('.multiexpand-tree').find('.multiexpand-tree__child').hide();
    $('.multiexpand-tree').find('.me-child-expand').removeClass('expanded');
    el.html('<i class="bi bi-arrows-expand"></i> ' + dict['expand_all']);
    el.removeClass('expanded');
  } else {
    $('.multiexpand-tree').find('.multiexpand-tree__child').show();
    $('.multiexpand-tree').find('.me-child-expand').addClass('expanded');
    el.html('<i class="bi bi-arrows-collapse"></i> ' + dict['collapse_all']);
    el.addClass('expanded');
  }
}

function expandAllCategories() {
  $('.multiexpand-tree').find('.multiexpand-tree__child').show();
  $('.multiexpand-tree').find('.me-child-expand').addClass('expanded');
}

function collapseAllCategories() {
  $('.multiexpand-tree').find('.multiexpand-tree__child').hide();
  $('.multiexpand-tree').find('.me-child-expand').removeClass('expanded');
}


function returnLevelColor(level){
  if(level=='1')return '#1976D2';
  else if(level=='2')return '#E53935';
  else if(level=='3')return '#512DA8';
  else if(level=='4')return '#0097A7';
  else if(level=='5')return '#00796B';
  else if(level=='6')return '#689F38';
  else if(level=='7')return '#AFB42B';
  else if(level=='8')return '#F57C00';
  else if(level=='9')return '#00E676';
  else if(level=='10')return '#AD1457';
}
