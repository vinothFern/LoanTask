import { LightningElement, api, track } from 'lwc';

export default class PromotionDropdownMenu extends LightningElement {
    @api currentPosition;
    @api selectedPromotion;
    
    get promotionOptions() {
        const positions = [
            'Manager',
            'Team Lead',
            'Associate Developer',
            'Senior Developer',
            'Junior Developer',
            'Trainee'
        ];

        // Filter out positions higher than the current position
        const availablePromotions = positions.filter(position => {
            const currentPositionIndex = positions.indexOf(this.currentPosition);
            const positionIndex = positions.indexOf(position);
            return positionIndex < currentPositionIndex;
        });

        // Create options for the dropdown menu
        return availablePromotions.map(promotion => {
            return { label: promotion, value: promotion };
        });
    }

    handleChange(event) {
        this.selectedPromotion = event.detail.value;
        // Dispatch event to send selected promotion back to the parent component or flow
        const promotionSelected = new CustomEvent('promotionselected', {
            detail: { selectedPromotion: this.selectedPromotion }
        });
        this.dispatchEvent(promotionSelected);
    }
}