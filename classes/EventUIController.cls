/*------------------------------------------------------------------------
 * Description:   Apex controller class for Event Lightning components 
 * Test Class:    EventUIControllerTest
 * 
 --------------------------------------------------------------------------*/
public with sharing class EventUIController {

    @AuraEnabled
    public static Contact[] lookupContact(String searchString) {
        String sanitizedSearchString = String.escapeSingleQuotes(searchString);
        // Build SOSL query
        String searchQuery = 'FIND \'' + sanitizedSearchString + '*\' IN ALL FIELDS RETURNING Contact(Id,Name,Account.Name,Title) Limit 50';        
        // Execute the Query
        List<List<SObject>> searchList = search.query(searchQuery);

        return (List<Contact>)searchList[0];
    }

    @AuraEnabled
    public static Contact[] loadMeetingAttendees(String eventId) {
        return [SELECT Id, Name, Title, Email, Account.Name
                FROM   Contact
                WHERE  Id IN (SELECT RelationId FROM EventWhoRelation WHERE EventId = :eventId)];
    }
    
    @AuraEnabled
    public static String saveMeetingAttendees(String eventId, String[] contactIds) {
        String resultMsg = '';
        try {
            Set<Id> newContactIds = new Set<Id>();
            newContactIds.addAll((List<Id>)contactIds);
            
            List<EventRelation> attendeesToInsert = new List<EventRelation>();
            List<EventRelation> attendeesToDelete = new List<EventRelation>();
            
            Set<Id> existingContactIds = new Set<Id>();
            for(EventRelation ew :[SELECT RelationId FROM EventRelation WHERE EventId = :eventId AND IsParent=true AND IsWhat=false]) { 
                if (!newContactIds.contains(ew.RelationId))
                    attendeesToDelete.add(ew);
                else
                    existingContactIds.add(ew.RelationId); 
            }
            
            for(Id cId : newContactIds) {
                if (!existingContactIds.contains(cId))
                    attendeesToInsert.add(new EventRelation(EventId=eventId,RelationId=cId,IsParent=true,IsWhat=false));
            }
            
            if (!attendeesToDelete.isEmpty()) delete attendeesToDelete;
            if (!attendeesToInsert.isEmpty()) insert attendeesToInsert; 
        } catch (Exception ex) {
            resultMsg = 'Error in updating saveMeetingAttendees';
            System.debug(resultMsg + ': ' + ex.getMessage() + ' at line number: ' + ex.getLineNumber());
        }
        return resultMsg;
   } 
  
   
}