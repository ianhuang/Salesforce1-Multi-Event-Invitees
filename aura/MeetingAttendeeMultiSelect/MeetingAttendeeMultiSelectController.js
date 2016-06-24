({
	doInit : function(cmp, event, helper) {
        helper.showItem(cmp, '_spinner');
        
        var eventId = cmp.get("v.eventId");
        if (eventId == null || eventId == '') return;
        var existingItems = cmp.find('existingitems');
       
        // Show the lookuplist
        $A.util.removeClass(existingItems, 'slds-hide');

        // Create an Apex action
        var action = cmp.get('c.' + cmp.get('v.loadMethod'));

        // Set the parameters
        action.setParams({"eventId" : eventId});
        
        // Define the callback
        action.setCallback(this, function(response) {
            var state = response.getState();
            
            if (cmp.isValid() && state === "SUCCESS") {
                var items = response.getReturnValue();
                
                helper.hideItem(cmp, '_spinner');

                if (items.length == 0) {
                    cmp.set('v.items', null);
                    return;
                }
                cmp.set('v.items', items);
            } else if (state === "ERROR") {
                helper.displayActionError(response);
            }
        });
        
        helper.hideItem(cmp, '_spinner');
        //set init flag to true
        cmp.set('v.isInitialized', true);
        // Enqueue the action                  
        $A.enqueueAction(action);
	},
    
    doSave : function(cmp, event, helper) {
        var isInitialized = cmp.get("v.isInitialized");
        var isDirty = cmp.get("v.isDirty");
        if (!isInitialized || !isDirty) return '';
        
        var eventId = cmp.get("v.eventId");
        var items = cmp.get('v.items');
        if (!items) return;
        
        var contactIds = items.map(function(item){
					     return item.Id;
		              })
        
        var action = cmp.get('c.saveMeetingAttendees');
        //action.setParams({"eventId" : eventId});
        action.setParams({"eventId" : eventId,
                          "contactIds" : contactIds});

        //alert('eventId = ' + eventId);
        //alert('action = ' + action);
        
        action.setCallback(this, function(response) {
            var state = response.getState();
            
            //alert('state = ' + state);
            if (cmp.isValid() && state === "SUCCESS") {
                //$A.get('e.force:refreshView').fire();
                cmp.set('v.isDirty', false);
                return '';
            } else if (state === "ERROR") {
                helper.displayActionError(response);
                return 'Error';
            } else if (state === "INCOMPLETE") {
                helper.displayActionError(response);
                return 'Error';
            }
        });
        cmp.set('v.isDirty', false);
        $A.enqueueAction(action);                
	},

    doSearch : function(cmp, event, helper) {
        var searchString = cmp.get('v.searchString');
        var inputElement = cmp.find('lookup');
        var lookupList = cmp.find('lookuplist');

        // Clear any errors and destroy the old lookup items container
        inputElement.set('v.errors', null);
        
        // We need at least 2 characters for an effective search
        if (typeof searchString === 'undefined' || searchString.length < 2)
        {
            // Hide the lookuplist
            $A.util.addClass(lookupList, 'slds-hide');
            return;
        }

        // Show the lookuplist
        $A.util.removeClass(lookupList, 'slds-hide');
        
        // Create an Apex action
        var action = cmp.get('c.lookupContact');

        // Mark the action as abortable, this is to prevent multiple events from the keyup executing
        action.setAbortable();

        // Set the parameters
        action.setParams({ "searchString" : searchString});
                          
        // Define the callback
        action.setCallback(this, function(response) {
            var state = response.getState();
            // Callback succeeded
            if (cmp.isValid() && state === "SUCCESS") {
                // Get the search matches
                var matches = response.getReturnValue();

                // If we have no matches, return nothing
                if (matches.length == 0) {
                    cmp.set('v.matches', null);
                    return;
                }
                // Store the results
                cmp.set('v.matches', matches);
            } else if (state === "ERROR") {
                helper.displayActionError(response);
            }
        });
        // Enqueue the action                  
        $A.enqueueAction(action);                  
    },
    
    doBlur : function(cmp, event, helper) {
        var searchString = cmp.get("v.searchString");
        if (searchString == '') {
        	var lookupList = cmp.find("lookuplist");
        	$A.util.addClass(lookupList, 'slds-hide');
    	}
    },
    
    addItem : function(cmp, event, helper) {
        var recordId = event.currentTarget.id;
        //console.log('adduser:recordId = ' + recordId);
        var matches = cmp.get('v.matches');
        //console.log('addUser:matches = ' + matches);
        
        var selectedItem = _.find(matches, function(item) {
            return item.Id == recordId;
        });
        
        var items = cmp.get('v.items');
        if (!items) items = []; 
        items.push(selectedItem);
	    items = _.uniqBy(items, 'Id');
        cmp.set("v.items", items);
        cmp.set('v.isDirty', true);
        
        // Hide the Lookup List
        var lookupList = cmp.find("lookuplist");
        $A.util.addClass(lookupList, 'slds-hide');

        // Show the Lookup pill
        var lookupPill = cmp.find("lookup-pill");
        $A.util.removeClass(lookupPill, 'slds-hide');

        // Clear the Search string
        cmp.set("v.searchString", '');     
    },
    
    doRemove: function(cmp, event, helper) {
    	var id = event.currentTarget.id;
        var items = cmp.get('v.items');
        
        if (items.length > 0) {
           var removeItem = _.remove(items,function(item){
				return item.Id == id;
		   })
           cmp.set("v.items", items);
           cmp.set('v.isDirty', true); 
        }
    },
})