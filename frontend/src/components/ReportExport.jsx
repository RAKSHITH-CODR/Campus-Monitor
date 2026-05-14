/**
 * Report Export Component
 * Provides export functionality for reports
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, FileText, Table, BarChart3 } from 'lucide-react';
import { ReportGenerator } from '../services/reportGenerator';

export default function ReportExport({ sensorData, alerts }) {
  const [isOpen, setIsOpen] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [exportStatus, setExportStatus] = useState('');

  const handleExportCSV = async () => {
    setExporting(true);
    try {
      const energyReport = ReportGenerator.generateEnergyReport(sensorData);
      const csvData = energyReport.rooms.map((room) => ({
        Room: room.room,
        Occupancy: room.occupancy,
        'Power (W)': room.power,
        'Efficiency %': room.efficiency,
      }));

      ReportGenerator.generateCSV(csvData, `energy-report-${new Date().toISOString().split('T')[0]}.csv`);
      setExportStatus('✓ CSV exported successfully');
      setTimeout(() => setExportStatus(''), 2000);
    } catch (error) {
      console.error('Export error:', error);
      setExportStatus('✗ Export failed');
    } finally {
      setExporting(false);
    }
  };

  const handleExportPDF = async () => {
    setExporting(true);
    try {
      const { dateStr, sections } = ReportGenerator.generateDailyReport(sensorData, alerts);
      ReportGenerator.generatePDF(
        `Campus Monitor Daily Report - ${dateStr}`,
        sections,
        `daily-report-${dateStr}.pdf`
      );
      setExportStatus('✓ PDF exported successfully');
      setTimeout(() => setExportStatus(''), 2000);
    } catch (error) {
      console.error('Export error:', error);
      setExportStatus('✗ Export failed');
    } finally {
      setExporting(false);
    }
  };

  const handleExportJSON = async () => {
    setExporting(true);
    try {
      ReportGenerator.exportJSON(
        {
          sensors: sensorData,
          alerts: alerts,
          timestamp: new Date().toISOString(),
        },
        `campus-data-${new Date().toISOString().split('T')[0]}.json`
      );
      setExportStatus('✓ JSON exported successfully');
      setTimeout(() => setExportStatus(''), 2000);
    } catch (error) {
      console.error('Export error:', error);
      setExportStatus('✗ Export failed');
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="relative">
      {/* Export Button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        disabled={exporting}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500 to-teal-600 text-white rounded-lg font-medium hover:shadow-lg transition-shadow disabled:opacity-50"
      >
        <Download className="w-4 h-4" />
        {exporting ? 'Exporting...' : 'Export Report'}
      </motion.button>

      {/* Status Message */}
      {exportStatus && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="absolute top-12 right-0 z-50 px-4 py-2 bg-slate-800 text-white rounded-lg text-sm whitespace-nowrap"
        >
          {exportStatus}
        </motion.div>
      )}

      {/* Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="absolute top-12 right-0 z-50 w-48 bg-slate-800 rounded-lg shadow-xl border border-slate-700 overflow-hidden"
          >
            <div className="p-3 border-b border-slate-700">
              <p className="text-xs font-semibold text-slate-400 uppercase">Export Format</p>
            </div>

            {[
              {
                icon: Table,
                label: 'CSV (Energy Data)',
                description: 'Spreadsheet format',
                onClick: handleExportCSV,
              },
              {
                icon: FileText,
                label: 'PDF (Daily Report)',
                description: 'Document format',
                onClick: handleExportPDF,
              },
              {
                icon: BarChart3,
                label: 'JSON (Raw Data)',
                description: 'Data format',
                onClick: handleExportJSON,
              },
            ].map((option, idx) => (
              <motion.button
                key={idx}
                onClick={() => {
                  option.onClick();
                  setIsOpen(false);
                }}
                disabled={exporting}
                whileHover={{ backgroundColor: 'rgba(59, 130, 246, 0.1)' }}
                className="w-full px-4 py-3 text-left hover:bg-slate-700 transition-colors disabled:opacity-50 flex items-center gap-3"
              >
                <option.icon className="w-4 h-4 text-blue-400" />
                <div className="flex-1">
                  <div className="text-sm font-medium text-white">{option.label}</div>
                  <div className="text-xs text-slate-400">{option.description}</div>
                </div>
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
