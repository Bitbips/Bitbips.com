jQuery(document).ready(function() {

    var cvvname = "";
    if (jQuery("#cccvv").length) {
        cvvname = "#cccvv";
    } else {
        cvvname = "#cardcvv";
    }

    function isAmex()
    {
        // Check if AMEX was selected from the dropdown.
        var cc = jQuery("#cctype").val();
        if (cc.toLowerCase().indexOf("american express") !== -1) {
            return true;
        }
        
        return false;
    }

    jQuery(cvvname).focus(function() {
        if (isAmex()) {
            jQuery(cvvname).attr("maxlength", "4");
        } else {
            jQuery(cvvname).attr("maxlength", "3");
        }
    });

    jQuery("#cctype").change(function() {
        var cardcvv = jQuery(cvvname).val();
        if (!isAmex() && cardcvv.length > 3) {
            // Reset the CVV, since it's too long now.
            jQuery(cvvname).val("");
        } 
    });
});

