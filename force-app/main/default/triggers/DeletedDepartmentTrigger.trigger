trigger DeletedDepartmentTrigger on Department__c (Before delete) {
	  if (Trigger.isDelete) {    
        if (Trigger.isBefore) {
            List<DeletedRecords__c> DelRec = new List<DeletedRecords__c>();
            List<Id> ids = new List<Id>(); 
              for (Department__c dep : Trigger.old) {
                  DeletedRecords__c del = new DeletedRecords__c();
                  del.Name = dep.Name;
                  del.ObjectName__c = 'Department';
                  del.RecordID__c = dep.Id;
                  ids.add(dep.Id);
                  del.DeletedDateTime__c = Datetime.now();
                  del.Contact__c = dep.Manager__c;
                  DelRec.add(del);
              }
            DeletedDepartmentClass.deleteDep(DelRec,ids);
        }
      }
}