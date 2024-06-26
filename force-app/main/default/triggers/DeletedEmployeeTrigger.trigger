trigger DeletedEmployeeTrigger on Employee__c (After delete,After insert){
	  if (Trigger.isDelete) {    
        if (Trigger.isAfter) {
            Id depId = null; 
            DeletedRecords__c DelRec = new DeletedRecords__c();
              for (Employee__c emp : Trigger.old) {
                  DelRec.Name = emp.Name;
                  DelRec.ObjectName__c = 'Employee';
                  DelRec.RecordID__c = emp.Id;
                  DelRec.DeletedDateTime__c = Datetime.now();
                  DelRec.Contact__c = emp.Contact__c;
                  DelRec.Position__c = emp.Position__c;
                  depId = emp.Department__c;
                  DelRec.Date_of_Joining__c = emp.Date_of_Joining__c;
              }
             DeletedEmployeeClass.deleteEmp(DelRec,depId);
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