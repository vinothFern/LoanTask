public class EmployeeControllerTigApex {
     public static Boolean runTrigger = true;
    public static void empUpdate(Employee__c oldManager, Id depId, Id conId) {
        
        if(runTrigger){
            if (oldManager != null) {
                try {
                    // Set old manager's Active__c to false
                    oldManager.Active__c = false;
                    update oldManager;
    
                    // Update the Department's Manager__c field
                    Department__c department = [
                        SELECT Manager__c 
                        FROM Department__c 
                        WHERE Id = :depId 
                        LIMIT 1
                    ];
                    department.Manager__c = conId;
                    
                    system.debug(department);
                    runTrigger = false;
                   update department;  //looping issue so hold on employee manager update
                } catch (Exception e) {
                    // Log the exception
                    System.debug('Exception: ' + e.getMessage());
                } finally {
                    	runTrigger = true;
                    }
                
            }
        }
    }
}