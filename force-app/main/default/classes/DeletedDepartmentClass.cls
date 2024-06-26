public class DeletedDepartmentClass {
    public static void deleteDep(List<DeletedRecords__c> DelRec,List<Id> ids){
        
       	  delete [select id from Employee__c where Department__c in :ids];
        
          insert DelRec;
    }
}