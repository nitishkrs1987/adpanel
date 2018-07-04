jQuery(document).ready(function(){
  $(".alert").delay(2000).slideUp(500, function() {
      $(this).alert('close');
  });

  
  jQuery('body').on("click","#gen_new_links",function(){
    var adv_id = $(this).attr('rel');
    jQuery.get("/update_plinks/"+adv_id,function(resp){
      // console.log(resp);
      if(resp)
      {
        alert("Update Successfully");
      }
    });
  });
  


  /***************** Advertisor ************************/
    jQuery("#advertisor").change(function(){
      var $option = $(this).find('option:selected');
      var $type = $option.attr("option-type");
      
      if($type == 3)
      {
        jQuery("#gen_new_links").attr("rel",$option.val());
        jQuery("#gen_new_links").parent().show();
        jQuery("#affiliate").parent().hide();
      }else{
        jQuery("#gen_new_links").parent().hide();
        jQuery.get("/affiliate/"+$option.val(),function(resp){
          // console.log(resp);
          jQuery("#affiliate").html(resp);
          jQuery("#affiliate").parent().show();
        });
      }
     

      jQuery.get("/advertisor_detail/"+$option.val(),function(resp){
        // console.log(resp);
        jQuery("#advertisor_details").html(resp);
        jQuery(".adv_column").show();
      });
    });
    jQuery("body").on('click',"#edit_adv_button",function(){
      $("input").prop("readonly", false);
      $("button").prop("disabled", false);
      $("select").prop("disabled", false);
      $(this).prop("disabled", true);
    })
    jQuery('body').on("click","#advertisor_cancel",function(){
      jQuery("#campaign_detail").text("");
    });
    jQuery('body').on("change","#adv_country",function(){
      var $country = $(this).find('option:selected');
      // alert($country.val());
      $("div#advertisor select#advertisor_select_by_country option").each(function(){
        if($(this).attr("rel") != $country.val() && $(this).val()!=""){
            $(this).attr("disabled","disabled");
        }else{
          $(this).removeAttr("disabled");
        }
      });
    });
    /***************** Campaign ************************/
    jQuery(".edit_campaign").click(function(){
      jQuery.get("/campaign/edit/"+$(this).attr("id"),function(resp){
        // console.log(resp);
        jQuery("#campaign_detail").html(resp);
      });
    });

    jQuery(".add_campaign").click(function(){
      jQuery.get("/campaign/add",function(resp){
        // console.log(resp);
        jQuery("#campaign_detail").html(resp);
      });
    });

    jQuery(".add_advertisor").click(function(){
      jQuery.get("/advertisor/add/"+$(this).attr("id"),function(resp){
        // console.log(resp);
        jQuery("#campaign_detail").html(resp);
      });
    });
    jQuery('body').on("click","#campaign_cancel",function(){
      jQuery("#campaign_detail").text("");
    });

    // jQuery('body').on("click",".gen_download_files",function(){
    //   jQuery(".download_files").attr("disabled","disabled");
    // });
    jQuery('body').on("click",".download_files",function(){
      jQuery.get("/files_in_output",function(files){
        files = JSON.parse(files);
        console.log(files);
        multiDownload(files);
      });
      // files = new Array("/output/promo_img_in.js");
      // console.log(files);
      // multiDownload(files);
    });
    /************** Affiliate ************************/
    jQuery('body').on("click","#add_link",function(){
      var newrow = jQuery(this).prev().clone();
      newrow.find("input").attr("id",(parseInt(newrow.find("input").attr("id"))+1));
      newrow.find("input[type='text']").attr("value","");
      newrow.find("input[type='number']").attr("value","1");
      // alert(newrow.find("input").attr("id"));
      jQuery(this).prev().after(newrow);
      return false;
    });
    jQuery('body').on("click",".remove_link",function(){
      if (window.confirm("Are you sure?")) {
        var remove_link = jQuery(this);
        var affiliate_id = remove_link.attr("rel");
        jQuery.get("/affiliate/remove/"+affiliate_id,function(resp){
          remove_link.parent().parent().parent().remove();
        });
      }
      return false;
    });


  });
function getText(num)
{
  if(num == 0)
    return "No";

  return "Yes";
}
