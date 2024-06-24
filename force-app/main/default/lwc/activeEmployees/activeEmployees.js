import { LightningElement, wire, track, api } from 'lwc';
import { refreshApex } from '@salesforce/apex';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { NavigationMixin } from 'lightning/navigation';
import getActiveEmployees from '@salesforce/apex/EmployeeController.getActiveEmployees';
import deleteEmployee from '@salesforce/apex/EmployeeController.deleteEmployee';

const COLUMNS = [
    {
        label: 'Name',
        fieldName: 'employeeDetailUrl',
        type: 'url',
        typeAttributes: { label: { fieldName: 'Name' }, target: '_blank' },
        sortable: true
    },
    { label: 'Age', fieldName: 'Age__c', type: 'number', sortable: true, cellAttributes: { alignment: 'left' } },
    {
        label: 'Contact',
        fieldName: 'contactDetailUrl',
        type: 'url',
        typeAttributes: { label: { fieldName: 'contactName' }, target: '_blank' },
        sortable: true,
    },
    { label: 'Position', fieldName: 'Position__c', type: 'text', sortable: true },
    {
        label: 'Department',
        fieldName: 'departmentUrl',
        type: 'url',
        typeAttributes: { label: { fieldName: 'departmentName' }, target: '_blank' },
        sortable: true,
    },
    { label: 'Employee Code', fieldName: 'Employee_Code__c', type: 'text', sortable: true },
    { label: 'Active', fieldName: 'Active__c', type: 'text', sortable: true },
    { label: 'Salary', fieldName: 'Salary__c', type: 'text', sortable: true },
    {
        type: 'action',
        typeAttributes: { rowActions: getRowActions }
    }
];

function getRowActions(row, doneCallback) {
    const actions = [
        { 'label': 'Edit', 'name': 'edit' },
        { 'label': 'Delete', 'name': 'delete' }
    ];
    doneCallback(actions);
}

export default class ActiveEmployees extends NavigationMixin(LightningElement) {
    @api recordId;
    @track employees = [];
    @track columns = COLUMNS;
    @track showForm = false;
    @track formTitle = '';
    @track selectedEmployeeId = '';
    @track isEditForm = false;
    sortedBy;
    sortedDirection;
    wiredEmployeesResult;

    @wire(getActiveEmployees, { recordId: '$recordId' })
    wiredEmployees(result) {
        this.wiredEmployeesResult = result;
        const { data, error } = result;
        if (data) {
            this.employees = data.map(emp => ({
                ...emp,
                employeeDetailUrl: `/lightning/r/Employee__c/${emp.Id}/view`,
                contactDetailUrl: emp.Contact__c ? `/lightning/r/Contact/${emp.Contact__c}/view` : '',
                contactName: emp.Contact__r ? emp.Contact__r.Name : '',
                departmentUrl: emp.Department__c ? `/lightning/r/Contact/${emp.Department__c}/view` : '',
                departmentName: emp.Department__r ? emp.Department__r.Name : ''
            }));
            this.error = undefined;
        } else if (error) {
            this.error = error;
            this.employees = undefined;
        }
    }

    handleRefresh() {
        return refreshApex(this.wiredEmployeesResult)
            .then(() => {
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Success',
                        message: 'Employee data refreshed',
                        variant: 'success'
                    })
                );
            })
            .catch(error => {
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Error refreshing data',
                        message: error.body.message,
                        variant: 'error'
                    })
                );
            });
    }

    handleAddEmployee() {
        this.formTitle = 'Add Employee';
        this.selectedEmployeeId = '';
        this.isEditForm = false;
        this.showForm = true;
    }

    handleViewAll() {
        this[NavigationMixin.Navigate]({
            type: 'standard__recordRelationshipPage',
            attributes: {
                recordId: this.recordId,
                objectApiName: 'Department__c',
                relationshipApiName: 'Employees__r',
                actionName: 'view'
            },
        });
    }

    handleSuccess() {
        this.showForm = false;
        this.dispatchEvent(
            new ShowToastEvent({
                title: 'Success',
                message: 'Employee saved',
                variant: 'success'
            })
        );
        return refreshApex(this.wiredEmployeesResult);
    }

    handleError(event) {
        this.dispatchEvent(
            new ShowToastEvent({
                title: 'Error',
                message: event.detail.message,
                variant: 'error'
            })
        );
    }

    handleRowAction(event) {
        const actionName = event.detail.action.name;
        const row = event.detail.row;
        switch (actionName) {
            case 'edit':
                this.handleEditEmployee(row);
                break;
            case 'delete':
                this.handleDeleteEmployee(row);
                break;
            default:
        }
    }

    handleEditEmployee(row) {
        this.formTitle = 'Edit Employee';
        this.selectedEmployeeId = row.Id;
        this.isEditForm = true;
        this.showForm = true;
    }

    handleDeleteEmployee(row) {
        deleteEmployee({ employeeId: row.Id })
            .then(() => {
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Success',
                        message: 'Employee deleted',
                        variant: 'success'
                    })
                );
                return refreshApex(this.wiredEmployeesResult);
            })
            .catch(error => {
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Error deleting record',
                        message: error.body.message,
                        variant: 'error'
                    })
                );
            });
    }

    handleCancel() {
        this.showForm = false;
    }

    handleSaveEmployee() {
        const inputFields = this.template.querySelectorAll('lightning-input-field');
        let allValid = true;
        inputFields.forEach(field => {
            if (!field.reportValidity()) {
                allValid = false;
            }
        });
        if (allValid) {
            this.template.querySelector('lightning-record-edit-form').submit();
        } else {
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Error',
                    message: 'Please check your input and try again.',
                    variant: 'error'
                })
            );
        }
    }

    handleSort(event) {
        const { fieldName, sortDirection } = event.detail;
        this.sortedBy = fieldName;
        this.sortedDirection = sortDirection;
        this.employees = this.sortData(fieldName, sortDirection);
    }

    sortData(fieldname, direction) {
        let parseData = JSON.parse(JSON.stringify(this.employees));
        let keyValue = (a) => {
            return a[fieldname] || '';
        };
        let isReverse = direction === 'asc' ? 1 : -1;
        parseData.sort((x, y) => {
            x = keyValue(x) ? keyValue(x) : '';
            y = keyValue(y) ? keyValue(y) : '';
            return isReverse * ((x > y) - (y > x));
        });
        return parseData;
    }
}