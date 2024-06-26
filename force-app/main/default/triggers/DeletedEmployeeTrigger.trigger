trigger DeletedEmployeeTrigger on Employee__c (After delete,After insert){
	  if (Trigger.isDelete) {    
        if (Trigger.isAfter) {
            List<Id> ids = new List<Id>(); 
            List<DeletedRecords__c> Del = new List<DeletedRecords__c>();
              for (Employee__c emp : Trigger.old) {
                  DeletedRecords__c DelRec = new DeletedRecords__c();
                  DelRec.Name = emp.Name;
                  DelRec.ObjectName__c = 'Employee';
                  DelRec.RecordID__c = emp.Id;
                  DelRec.DeletedDateTime__c = Datetime.now();
                  DelRec.Contact__c = emp.Contact__c;
                  DelRec.Position__c = emp.Position__c;
                  ids.add(emp.Department__c);
                  DelRec.Department__c = emp.Department__c;
                  DelRec.Date_of_Joining__c = emp.Date_of_Joining__c;
                  
                  Del.add(DelRec);
              }
             DeletedEmployeeClass.deleteEmp(Del,ids);
        }
      }
    if (Trigger.isInsert){  
        if (Trigger.isAfter) {
            List<Id> ids = new List<Id>();
              for (Employee__c emp : Trigger.New) {
                  ids.add(emp.Department__c);
              }
            DeletedEmployeeClass.insertEmp(ids);
           }
      }
}