import { LightningElement, track, api } from 'lwc';
import { loadScript } from 'lightning/platformResourceLoader';
import ChartJS from '@salesforce/resourceUrl/ChartJs';
import sendPpfAccountDetails from '@salesforce/apex/PPFAccountController.sendPpfAccountDetails';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class PpfCalculator extends LightningElement {
    @api recordId;
    @track yearlyInvestment = 10000;
    @track timePeriod = 15;
    @track rateOfInterest = 7.1;
    @track isFormVisible = false;

    isChartRendered = false;
    chart;

    get totalInvestedAmount() {
        return parseFloat(this.yearlyInvestment) * parseFloat(this.timePeriod);
    }

    get maturityValue() {
        const principal = parseFloat(this.yearlyInvestment);
        const rate = parseFloat(this.rateOfInterest) / 100;
        const n = parseFloat(this.timePeriod);
        return principal * (((1 + rate) ** n - 1) / rate) * (1 + rate);
    }

    get totalInterest() {
        return this.maturityValue - this.totalInvestedAmount;
    }

    get appliedDate() {
        return new Date().toISOString().split('T')[0];
    }

    get startDate() {
        const date = new Date();
        date.setMonth(date.getMonth() + 1);
        return date.toISOString().split('T')[0];
    }

    get maturityDate() {
        const startDate = new Date(this.startDate);
        startDate.setFullYear(startDate.getFullYear() + this.timePeriod);
        return startDate.toISOString().split('T')[0];
    }

    handleYearlyInvestmentInputChange(event) {
        this.yearlyInvestment = Number(event.target.value);
        this.refreshChart();
    }

    handleTimePeriodSliderChange(event) {
        this.timePeriod = Number(event.target.value);
        this.refreshChart();
    }

    showPpfApplicationForm() {
        this.isFormVisible = true;
    }

    handleFormSuccess(event) {
        console.log('Record saved successfully');
        this.isFormVisible = false;
        const recordId = event.detail.id;
 
        sendPpfAccountDetails({ ppfAccountId: recordId })
            .then(() => {
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Success',
                        message: 'PPF Account created and email sent successfully',
                        variant: 'success'
                    })
                );
            })
            .catch(error => {
                console.error('Error sending email', error);
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Error',
                        message: error.body.message,
                        variant: 'error'
                    })
                );
            });
    }

    handleFormError(event) {
        console.error('Error saving record', event.detail);
    }

    hidePpfApplicationForm() {
        this.isFormVisible = false;
    }

    renderedCallback() {
        if (this.isChartRendered) return;
        Promise.all([loadScript(this, ChartJS)])
            .then(() => {
                this.initializeChart();
                this.isChartRendered = true;
            })
            .catch(error => {
                console.error('Error loading Chart.js', error);
            });
    }

    refreshChart() {
        if (this.chart) {
            this.chart.destroy();
        }
        this.initializeChart();
    }

    initializeChart() {
        const canvas = this.template.querySelector('.doughnut-chart');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        const data = {
            datasets: [{
                data: [this.totalInvestedAmount, this.totalInterest],
                backgroundColor: ['#FFCE56', '#4CAF50']
            }],
            labels: ['Total Investment', 'Total Interest']
        };

        this.chart = new window.Chart(ctx, {
            type: 'doughnut',
            data: data,
            options: {
                responsive: true,
                maintainAspectRatio: false
            }
        });
    }
}