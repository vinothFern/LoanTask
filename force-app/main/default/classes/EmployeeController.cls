public with sharing class EmployeeController {
    @AuraEnabled(cacheable=true)
    public static List<Employee__c> getActiveEmployees(id recordId) {
        return [
            SELECT Id, Name, Age__c, Contact__r.Name, Contact__c, Position__c, Department__r.Name,Department__c,Active__c,Salary__c,Employee_Code__c
            FROM Employee__c
            WHERE department__c=:recordId
        ];
    }
    @AuraEnabled
    public static void updateEmployeeRecords(List<Employee__c> employees) {
        update employees;
    }
    @AuraEnabled
    public static void deleteEmployee(Id employeeId) {
        delete new Employee__c(Id = employeeId);
    }
}