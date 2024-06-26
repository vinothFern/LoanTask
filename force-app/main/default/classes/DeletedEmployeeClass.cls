public class DeletedEmployeeClass {
    public static void deleteEmp(DeletedRecords__c DelRec,Id depId){
        
        	List<Department__c> depList = [select id,Name from Department__c where id = :depId];
            DelRec.Department__c = 	depList[0].Name;
            insert DelRec;
    }
    
    public static void insertEmp(List<Id> ids){
        try{
            if(ids.size()>0){
                List<Department__c> department = [select Emp_Count__c,(select id from Employees__r) from Department__c where Id in :ids];
                for(Department__c dep: department){
                    dep.Emp_Count__c = dep.Employees__r.size();
                }
                if(department.size()>0)
                    update department;
            }
        }
        catch(Exception e){}
    }
}