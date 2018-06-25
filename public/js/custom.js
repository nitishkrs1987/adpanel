jQuery(document).ready(function(){
  $(".alert").delay(2000).slideUp(500, function() {
      $(this).alert('close');
  });
  /***************** Advertisor ************************/
    jQuery("#advertisor").change(function(){
      var $option = $(this).find('option:selected');
      // alert($option.val());
      // window.location.href = "http://localhost:3000/advertisor/"+$option.val();
      jQuery.get("http://localhost:3000/affiliate/"+$option.val(),function(resp){
        // console.log(resp);
        jQuery("#affiliate").html(resp);
        jQuery("#affiliate").parent().show();
      });
      
      jQuery.get("http://localhost:3000/advertisor_detail/"+$option.val(),function(resp){
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
      jQuery.get("http://localhost:3000/campaign/edit/"+$(this).attr("id"),function(resp){
        // console.log(resp);
        jQuery("#campaign_detail").html(resp);
      });
    });
    
    jQuery(".add_campaign").click(function(){
      jQuery.get("http://localhost:3000/campaign/add",function(resp){
        // console.log(resp);
        jQuery("#campaign_detail").html(resp);
      });
    });

    jQuery(".add_advertisor").click(function(){
      jQuery.get("http://localhost:3000/advertisor/add/"+$(this).attr("id"),function(resp){
        // console.log(resp);
        jQuery("#campaign_detail").html(resp);
      });
    });
    jQuery('body').on("click","#campaign_cancel",function(){
      jQuery("#campaign_detail").text("");
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
        jQuery.get("http://localhost:3000/affiliate/remove/"+affiliate_id,function(resp){
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