public class PPFAccountController {
    @AuraEnabled
    public static void sendPpfAccountDetails(Id ppfAccountId) {
        PPF_Account__c ppfAccount = [SELECT Account__r.Email__c, Yearly_Investment__c, Time_Period__c, Rate_of_Interest__c, Total_Invested_Amount__c, Total_Interest__c, Maturity_Value__c 
                                     FROM PPF_Account__c 
                                     WHERE Id = :ppfAccountId LIMIT 1];
 
        if (ppfAccount.Account__r.Email__c == null) {
            throw new AuraHandledException('Account does not have an email address.');
        }
 
        String subject = 'Your PPF Account Details';
        String body = 'Here are the details of your PPF account:\n\n' +
                      'Yearly Investment: ' + ppfAccount.Yearly_Investment__c + '\n' +
                      'Time Period: ' + ppfAccount.Time_Period__c + '\n' +
                      'Rate of Interest: ' + ppfAccount.Rate_of_Interest__c + '%\n' +
                      'Total Invested Amount: ' + ppfAccount.Total_Invested_Amount__c + '\n' +
                      'Total Interest: ' + ppfAccount.Total_Interest__c + '\n' +
                      'Maturity Value: ' + ppfAccount.Maturity_Value__c;
 
        Messaging.SingleEmailMessage mail = new Messaging.SingleEmailMessage();
        mail.setToAddresses(new String[] { ppfAccount.Account__r.Email__c });
        mail.setSubject(subject);
        mail.setPlainTextBody(body);
 
        Messaging.sendEmail(new Messaging.SingleEmailMessage[] { mail });
    }
}