// Automation service for updating student stats
export class StatsUpdater {
  private intervalId: NodeJS.Timeout | null = null;
  private isRunning = false;

  start() {
    if (this.isRunning) {
      console.log('Stats automation already running');
      return;
    }

    this.isRunning = true;
    
    // Delay the first run to avoid conflicts during startup
    setTimeout(() => {
      this.updateAllStudentStats();
      this.detectInactiveStudents();
    }, 5000); // 5 second delay

    // Update stats every 24 hours
    this.intervalId = setInterval(async () => {
      await this.updateAllStudentStats();
      await this.detectInactiveStudents();
    }, 24 * 60 * 60 * 1000); // 24 hours

    console.log('Stats automation started');
  }

  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.isRunning = false;
    console.log('Stats automation stopped');
  }

  private async updateAllStudentStats() {
    if (!this.isRunning) return;
    
    try {
      console.log('Starting daily stats update...');
      // Use a direct fetch to avoid circular dependencies
      const response = await fetch('http://localhost:3000/api/students/update-stats', {
        method: 'GET',
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Daily stats update completed:', data);
      } else {
        console.error('Failed to update stats:', response.statusText);
      }
    } catch (error) {
      console.error('Error updating stats:', error);
    }
  }

  private async detectInactiveStudents() {
    if (!this.isRunning) return;
    
    try {
      console.log('Checking for inactive students...');
      // Use a direct fetch to avoid circular dependencies
      const response = await fetch('http://localhost:3000/api/students/inactive');
      
      if (response.ok) {
        const inactiveStudents = await response.json();
        console.log(`Found ${inactiveStudents.length} inactive students`);
        
        // Here you could send email notifications or take other actions
        // For now, we'll just log the information
        if (inactiveStudents.length > 0) {
          console.log('Inactive students:', inactiveStudents.map(s => s.name));
        }
      } else {
        console.error('Failed to fetch inactive students:', response.statusText);
      }
    } catch (error) {
      console.error('Error detecting inactive students:', error);
    }
  }
}

// Global instance
export const statsUpdater = new StatsUpdater();