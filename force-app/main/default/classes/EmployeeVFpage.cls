public without sharing class EmployeeVFpage {
    public Employee__c employee { get; private set; }
 
    public EmployeeVFpage(ApexPages.StandardController stdController) {
        String recordId = ApexPages.currentPage().getParameters().get('recordId');
        
        if (recordId != null) {
            employee = [SELECT Name, Position__c, Date_of_Joining__c, Department__r.Name, Salary__c, Experience__c
                        FROM Employee__c
                        WHERE Id = :recordId
                        LIMIT 1];
        } else {
            stdController.addFields(new List<String>{'Name', 'Position__c', 'Date_of_Joining__c', 'Department__r.Name', 'Salary__c', 'Experience__c'});
            this.employee = (Employee__c)stdController.getRecord();
        }
    }
}