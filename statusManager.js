// Complete implementation code for R3 status management and transitions

class StatusManager {
    constructor() {
        this.status = 'idle';
    }

    setStatus(newStatus) {
        this.status = newStatus;
        this.handleStatusChange();
    }

    handleStatusChange() {
        switch (this.status) {
            case 'loading':
                console.log('Loading...');
                break;
            case 'success':
                console.log('Success!');
                break;
            case 'error':
                console.log('Error occurred!');
                break;
            default:
                console.log('Idle');
        }
    }
}

const statusManager = new StatusManager();
// Usage
statusManager.setStatus('loading');
statusManager.setStatus('success');
