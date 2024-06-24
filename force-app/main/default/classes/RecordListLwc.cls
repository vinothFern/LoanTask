public with sharing class RecordListLwc
{
    @AuraEnabled(cacheable=true)
    public static List<Employee__c> getData(Id recordId) {
        return [SELECT Id, Name,Position__c FROM Employee__c where Department__c = :recordId  LIMIT 100]; // Adjust query as needed
    }
}