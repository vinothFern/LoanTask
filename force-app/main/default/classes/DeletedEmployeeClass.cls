public class DeletedEmployeeClass {
    public static void deleteEmp(List<DeletedRecords__c> Del,List<Id> ids){
        
        	List<Department__c> depList = [select id,Name from Department__c where id in :ids];
            for(Department__c dep: depList){
                for(DeletedRecords__c delRec: Del){
                    if(delRec.Department__c.equals(dep.id.toString())){
                        delRec.Department__c = dep.Name;
                    }
                }
            }
            insert Del;
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