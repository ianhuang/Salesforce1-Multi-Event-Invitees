@isTest
private class EventUIControllerTest {
    
    static testMethod void testLookupContact() {
        List<Contact> contacts = createAccountContacts();

        Test.setFixedSearchResults(new Id[]{contacts[199].Id});
        
        Test.startTest();
        contacts = EventUIController.lookupContact('Last 199');
        Test.stopTest();
        
        System.assertEquals(1, contacts.size());
        System.assertEquals('Last 199', contacts[0].Name);
    }
    
    static testMethod void testLoadSaveMeetingAttendees() {
        List<Contact> contacts = createAccountContacts();
        List<Id> contactIds = new List<Id>();
        for(Integer i=0;I<50;i++)
            contactIds.add(Contacts[i].Id);
        Event event = new Event(WhatId=contacts[0].AccountId,DurationInMinutes=60,ActivityDateTime=System.Now().addDays(1));
        insert event;
        
        Test.startTest();
        EventUIController.saveMeetingAttendees(event.Id, contactIds);
        List<Contact> meetingAttendees = EventUIController.loadMeetingAttendees(event.Id);
        System.assertEquals(50, meetingAttendees.size());
        Test.stopTest();
    }
    
}    