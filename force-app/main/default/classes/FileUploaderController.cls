public class FileUploaderController {
    @AuraEnabled
    public static String uploadFile(String fileName, String base64Data, String recordId) {
        try {
            ContentVersion file = new ContentVersion();
            file.Title = fileName;
            file.PathOnClient = fileName;
            file.VersionData = EncodingUtil.base64Decode(base64Data);
            insert file;
            
            // Link the ContentVersion to the specified record
            ContentDocumentLink link = new ContentDocumentLink();
            link.ContentDocumentId = [SELECT ContentDocumentId FROM ContentVersion WHERE Id = :file.Id].ContentDocumentId;
            link.LinkedEntityId = recordId;
            link.ShareType = 'V';
            link.Visibility = 'AllUsers';
            insert link;
            
            return 'File uploaded successfully';
        } catch (Exception e) {
            throw new AuraHandledException('Error uploading file: ' + e.getMessage());
        }
    }
}
