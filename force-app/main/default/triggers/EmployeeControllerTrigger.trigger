trigger EmployeeControllerTrigger on Employee__c (before update, after update) {
    if (Trigger.isUpdate) {    
        if (Trigger.isBefore) {
            Employee__c oldManager = null;
            Id depId = null;
            Id conId = null;
            for (Employee__c emp : Trigger.new) {
                if (emp.Position__c == 'Manager' && emp.Active__c) {
                    // Retrieve the current active manager for the department, if any
                    List<Employee__c> oldManagers = [
                        SELECT Active__c 
                        FROM Employee__c 
                        WHERE Department__c = :emp.Department__c 
                          AND Position__c = 'Manager' 
                          AND Active__c = true 
                          AND Id != :emp.Id 
                        LIMIT 1
                    ];
                    if (!oldManagers.isEmpty()) {
                        oldManager = oldManagers[0];
                    }
                    conId = emp.Contact__c;
                    depId = emp.Department__c;
                }
            }
            EmployeeControllerTigApex.empUpdate(oldManager, depId, conId);
        }
    }
}