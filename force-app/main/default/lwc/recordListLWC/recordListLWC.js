import { LightningElement, api, track } from 'lwc';
import { loadScript } from 'lightning/platformResourceLoader';
import ChartJS from '@salesforce/resourceUrl/ChartJs';
// import jsPDF from '@salesforce/resourceUrl/jsPDF'; // Replace 'jsPDF' with your Static Resource name

export default class RecordListLWC extends LightningElement {
    @api ListOfData = [];
    @track data = [];
    @track columns = [];
    @track title = 'Employee Records';
    @track showChartSection = false;
    chart;
    chartjsInitialized = false;

    connectedCallback() {
        if (this.ListOfData.length > 0) {
            const fieldsToExclude = ['Id', 'Department__c'];

            const firstRecord = this.ListOfData[0];
            this.columns = Object.keys(firstRecord)
                .filter(fieldName => !fieldsToExclude.includes(fieldName) && !fieldName.endsWith('C'))
                .map(fieldName => ({
                    label: fieldName === 'Department__r' ? 'Department Name' : this.formatLabel(fieldName),
                    fieldName: fieldName,
                    type: fieldName === 'Department__r' ? 'text' : undefined 
                }));

            this.columns.push({
                type: 'action',
                typeAttributes: {
                    rowActions: this.getRowActions,
                    menuAlignment: 'right'
                }
            });

            this.data = this.ListOfData.map(record =>
                Object.keys(record).reduce((obj, key) => {
                    if (!fieldsToExclude.includes(key) && !key.endsWith('C')) {
                        obj[key] = key === 'Department__r' ? (record[key]?.Name || '') : record[key];
                    }
                    return obj;
                }, {})
            );
        }
    }

    formatLabel(fieldName) {
        return fieldName.replace(/_/g, ' ').replace(/\b\w/g, char => char.toUpperCase());
    }

    get recordCount() {
        return this.data.length;
    }

    getRowActions(row, doneCallback) {
        doneCallback([{ label: 'Chart', name: 'chart' }]);
    }

    handleRowAction(event) {
        if (event.detail.action.name === 'chart') {
            this.showChart(event.detail.row);
        } else if (event.detail.action.name === 'pdf') {
            this.generatePDF();
        }
    }

    // loadExternalScript() {
    //     loadScript(this, jsPDF)
    //         .then(() => {
    //             this.handleScriptLoad();
    //         })
    //         .catch(error => {
    //             console.error('Error loading jsPDF:', error);
    //         });
    // }

    // handleScriptLoad() {
    //     // Initialize jsPDF object
    //     const doc = new window.jspdf.jsPDF();

    //     // Add content to the PDF
    //     doc.text('Hello World!', 10, 10);

    //     // Save the PDF
    //     doc.save('MyDocument.pdf');
    // }

    async showChart(row) {
        let salary = row.Salary__c || 1000; // Set default salary value to 10 if empty
        const maxSalary = 100000;

        this.showChartSection = true;

        if (!this.chartjsInitialized) {
            await loadScript(this, ChartJS);
            this.chartjsInitialized = true;
        }

        const ctx = this.template.querySelector('canvas.chart').getContext('2d');
        if (this.chart) {
            this.chart.destroy();
        }

        const percentage = (salary / maxSalary) * 100;

        this.chart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Current Salary', 'Remaining'],
                datasets: [{
                    data: [salary, maxSalary - salary],
                    backgroundColor: ['darkgreen', 'darkyellow'],
                    borderColor: ['darkgreen', 'darkyellow'],
                    borderWidth: 1
                }]
            },
            options: {
                plugins: {
                    tooltip: {
                        callbacks: {
                            label: tooltipItem => {
                                const value = tooltipItem.raw;
                                const percentage = ((value / maxSalary) * 100).toFixed(2);
                                return `${tooltipItem.label}: ${value.toLocaleString()} (${percentage}%)`;
                            }
                        }
                    }
                }
            }
        });
    }
}