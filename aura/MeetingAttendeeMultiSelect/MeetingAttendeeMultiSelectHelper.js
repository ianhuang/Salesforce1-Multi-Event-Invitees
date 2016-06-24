({
    showItem : function (cmp, itemName) {
        var item = cmp.find(itemName);
        if(item != undefined) {
            $A.util.removeClass(item, 'slds-hide');
            $A.util.addClass(item, 'slds-show'); 
        }
    },
    
    hideItem : function (cmp, itemName) {
        var item = cmp.find(itemName);
        if(item != undefined) {
            $A.util.removeClass(item, 'slds-show');
            $A.util.addClass(item, 'slds-hide');
        }    
    },
    
    displayActionError : function (response) {
        var errors = response.getError();
        if (errors) {
            if (errors[0] && errors[0].message) {
            	this.displayToast('Error', errors[0].message);
        	}
        } else {
            this.displayToast('Error', 'An unknown error has occured.');
        }    
    },
    
    displayToast : function (title, message) {
        var toast = $A.get("e.force:showToast");
        if (toast) {
            //fire the toast event in Salesforce1
            toast.setParams({
                "title": title,
                "message": message
            });
            toast.fire();
        }
        else {// otherwise throw an alert
            alert(title + ': ' + message);
        }
    },
})