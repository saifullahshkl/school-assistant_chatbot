// src/ReportPDF.jsx
import { Page, Text, View, Document, StyleSheet } from '@react-pdf/renderer';

// Enhanced styles for a modern, card-based report layout
const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontFamily: 'Helvetica',
    backgroundColor: '#ffffff'
  },
  headerContainer: {
    backgroundColor: '#667eea',
    padding: 20,
    borderRadius: 8,
    marginBottom: 20
  },
  headerText: {
    fontSize: 28,
    color: '#fff',
    textAlign: 'center',
    fontWeight: 'bold'
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20
  },
  sectionCard: {
    width: '48%',
    backgroundColor: '#f3f4f6',
    padding: 12,
    borderRadius: 8
  },
  fullSection: {
    backgroundColor: '#f3f4f6',
    padding: 12,
    borderRadius: 8,
    marginBottom: 20
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 8
  },
  itemText: {
    fontSize: 12,
    marginBottom: 4,
    color: '#4b5563'
  }
});

export default function ReportPDF({ student }) {
  const attendance = student.attendance || {};
  const marks = student.marks || {};
  return (
    <Document>
      <Page style={styles.page}>
        {/* Header */}
        <View style={styles.headerContainer}>
          <Text style={styles.headerText}>{student.name}'s Report</Text>
        </View>

        {/* Two-column row: Attendance & Marks */}
        <View style={styles.row}>
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Attendance Records</Text>
            {Object.entries(attendance).map(([date, status]) => (
              <Text key={date} style={styles.itemText}>
                {new Date(date).toLocaleDateString()}: {status}
              </Text>
            ))}
          </View>

          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Academic Marks</Text>
            {Object.entries(marks).map(([exam, score]) => (
              <Text key={exam} style={styles.itemText}>
                {exam.charAt(0).toUpperCase() + exam.slice(1)}: {score}/100
              </Text>
            ))}
          </View>
        </View>

        {/* Behavior */}
        <View style={styles.fullSection}>
          <Text style={styles.sectionTitle}>Behavior Remarks</Text>
          <Text style={styles.itemText}>
            {student.behavior || 'No remarks available'}
          </Text>
        </View>

        {/* Health Issues */}
        <View style={styles.fullSection}>
          <Text style={styles.sectionTitle}>Health Issues</Text>
          <Text style={styles.itemText}>
            {student.health_isseus || 'No recorded health issues.'}
          </Text>
        </View>

        {/* Mental Health Notes */}
        <View style={styles.fullSection}>
          <Text style={styles.sectionTitle}>Mental Health Notes</Text>
          <Text style={styles.itemText}>
            {student.mental_health || 'No mental health notes available.'}
          </Text>
        </View>

        {/* Extracurricular Activities */}
        <View style={styles.fullSection}>
          <Text style={styles.sectionTitle}>Extracurricular Activities</Text>
          <Text style={styles.itemText}>
            {student.extracurricular || 'No extracurricular activities listed.'}
          </Text>
        </View>
      </Page>
    </Document>
  );
}
