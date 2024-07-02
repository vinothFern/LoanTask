import { LightningElement, track } from 'lwc';
import uploadFile from '@salesforce/apex/FileUploaderController.uploadFile';

export default class FileUploader extends LightningElement {
    @track isLoading = false;
    file;
    recordId;

    handleFileChange(event) {
        this.file = event.target.files[0];
    }

    handleRecordIdChange(event) {
        this.recordId = event.target.value;
    }

    handleUpload() {
        if (this.file && this.recordId) {
            this.isLoading = true;
            let reader = new FileReader();
            reader.onload = () => {
                let base64 = reader.result.split(',')[1];
                this.uploadFile(base64);
            };
            reader.readAsDataURL(this.file);
        }
    }

    uploadFile(base64) {
        uploadFile({ fileName: this.file.name, base64Data: base64, recordId: this.recordId })
            .then(result => {
                this.isLoading = false;
                this.file = null;
                console.log('File uploaded successfully');
            })
            .catch(error => {
                this.isLoading = false;
                console.error('Error uploading file', error);
            });
    }
}
