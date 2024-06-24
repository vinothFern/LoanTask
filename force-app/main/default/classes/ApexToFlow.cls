public class ApexToFlow {
    @InvocableMethod()
    public static List<List<Employee__c>> connectFlow(List<Id> ids) {
        List<List<Employee__c>> masterList = new List<List<Employee__c>>();
        
        if (ids != null && !ids.isEmpty()) {
            List<Employee__c> data= [select Name,Active__c,Position__c,Salary__c,Department__r.Name from Employee__c where Department__c in :ids];
            Map<Id, List<Employee__c>> dataMap = new Map<Id, List<Employee__c>>();
            for (Employee__c employee : data) {
                if (!dataMap.containsKey(employee.Department__c)) {
                    dataMap.put(employee.Department__c, new List<Employee__c>());
                }
                dataMap.get(employee.Department__c).add(employee);
            }
            
            for (Id departmentId : ids) {
                masterList.add(dataMap.get(departmentId));
            }
        }
        
        System.debug('Master List: ' + masterList);
        return masterList;
    }
}