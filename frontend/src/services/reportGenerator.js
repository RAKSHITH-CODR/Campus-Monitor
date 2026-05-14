/**
 * Report Generation Service
 * Generates PDF and CSV reports for analytics and audits
 */

export class ReportGenerator {
  /**
   * Generate CSV report
   */
  static generateCSV(data, filename = 'campus-monitor-report.csv') {
    const headers = Object.keys(data[0] || {});
    const csvContent = [
      headers.join(','),
      ...data.map((row) => headers.map((header) => {
        const value = row[header];
        // Escape quotes and wrap in quotes if contains comma
        if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value;
      }).join(',')),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    this.downloadFile(blob, filename);
  }

  /**
   * Generate PDF report (using simple text-based format)
   * For real PDF generation, use libraries like jsPDF or pdfkit
   */
  static generatePDF(title, sections, filename = 'campus-monitor-report.pdf') {
    try {
      // Try to use jsPDF if available
      const { jsPDF } = window.jspdf || {};
      if (jsPDF) {
        const doc = new jsPDF();
        let yPos = 20;

        // Title
        doc.setFontSize(16);
        doc.text(title, 20, yPos);
        yPos += 20;

        // Sections
        doc.setFontSize(10);
        sections.forEach((section) => {
          // Section header
          doc.setTextColor(33, 150, 243); // Blue
          doc.text(section.title, 20, yPos);
          yPos += 10;

          // Section content
          doc.setTextColor(0, 0, 0); // Black
          const lines = doc.splitTextToSize(section.content, 170);
          doc.text(lines, 20, yPos);
          yPos += lines.length * 5 + 10;

          // Page break if needed
          if (yPos > 250) {
            doc.addPage();
            yPos = 20;
          }
        });

        // Footer
        doc.setTextColor(150, 150, 150);
        doc.setFontSize(8);
        doc.text(
          `Generated: ${new Date().toLocaleString()}`,
          20,
          doc.internal.pageSize.height - 10
        );

        doc.save(filename);
        return true;
      } else {
        // Fallback: generate text file
        const content = [
          title,
          '='.repeat(title.length),
          '',
          ...sections.flatMap((section) => [
            section.title,
            '-'.repeat(section.title.length),
            section.content,
            '',
          ]),
          `Generated: ${new Date().toLocaleString()}`,
        ].join('\n');

        const blob = new Blob([content], { type: 'text/plain;charset=utf-8;' });
        this.downloadFile(blob, filename.replace('.pdf', '.txt'));
        return true;
      }
    } catch (error) {
      console.error('Error generating PDF:', error);
      return false;
    }
  }

  /**
   * Generate daily report
   */
  static generateDailyReport(sensorData, alerts, date = new Date()) {
    const dateStr = date.toLocaleDateString();

    // Calculate statistics
    const allSensors = Object.values(sensorData)
      .flatMap((building) => Object.values(building));

    const avgTemp =
      allSensors.reduce((sum, d) => sum + d.sensors.temperature, 0) / allSensors.length;
    const avgAQI =
      allSensors.reduce((sum, d) => sum + d.sensors.aqi, 0) / allSensors.length;
    const totalOccupancy = allSensors.reduce(
      (sum, d) => sum + d.sensors.occupancy,
      0
    );

    const criticalAlerts = alerts.filter((a) => a.severity === 'CRITICAL').length;
    const warningAlerts = alerts.filter((a) => a.severity === 'WARNING').length;

    const sections = [
      {
        title: 'Daily Summary',
        content: `Date: ${dateStr}\nTotal Active Rooms: ${allSensors.length}\nAverage Temperature: ${avgTemp.toFixed(1)}°C\nAverage Air Quality: ${avgAQI.toFixed(0)} AQI\nTotal Campus Occupancy: ${Math.round(totalOccupancy)} people`,
      },
      {
        title: 'Alerts Overview',
        content: `Critical Alerts: ${criticalAlerts}\nWarning Alerts: ${warningAlerts}\nTotal Alerts: ${alerts.length}`,
      },
      {
        title: 'Room Statistics',
        content: allSensors
          .slice(0, 5)
          .map(
            (d) =>
              `${d.roomId}: ${d.sensors.occupancy} occupants, ${d.sensors.temperature}°C, ${d.sensors.aqi} AQI`
          )
          .join('\n'),
      },
    ];

    return { dateStr, sections };
  }

  /**
   * Generate energy efficiency report
   */
  static generateEnergyReport(sensorData) {
    const allSensors = Object.values(sensorData)
      .flatMap((building) => Object.values(building));

    const rooms = allSensors.map((d) => ({
      room: d.roomId,
      occupancy: d.sensors.occupancy,
      power: d.sensors.power,
      efficiency: d.sensors.power > 0 ? (d.sensors.occupancy / d.sensors.power * 100).toFixed(2) : '0',
    }));

    const totalPower = allSensors.reduce((sum, d) => sum + d.sensors.power, 0);
    const avgEfficiency = (
      rooms.reduce((sum, r) => sum + parseFloat(r.efficiency), 0) / rooms.length
    ).toFixed(2);

    return {
      timestamp: new Date().toISOString(),
      totalPower: totalPower.toFixed(2),
      averageEfficiency: avgEfficiency,
      rooms: rooms,
    };
  }

  /**
   * Generate anomaly report
   */
  static generateAnomalyReport(alerts) {
    const anomalies = alerts.filter((a) => a.severity === 'CRITICAL');

    const byType = {};
    anomalies.forEach((a) => {
      const type = a.message.split(' ')[0];
      byType[type] = (byType[type] || 0) + 1;
    });

    return {
      timestamp: new Date().toISOString(),
      totalAnomalies: anomalies.length,
      byType: byType,
      topAnomalies: anomalies.slice(0, 10),
    };
  }

  /**
   * Download file helper
   */
  static downloadFile(blob, filename) {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  /**
   * Export data as JSON
   */
  static exportJSON(data, filename = 'campus-monitor-export.json') {
    const jsonContent = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonContent], {
      type: 'application/json;charset=utf-8;',
    });
    this.downloadFile(blob, filename);
  }
}
