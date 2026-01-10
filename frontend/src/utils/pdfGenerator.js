import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export const generateSessionPDF = (session) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();

  // Header
  doc.setFontSize(14);
  doc.setTextColor(33, 150, 243); // Primary Blue  
  
  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text(`Exam: ${session.exam}`, 14, 10);
  doc.text(`Date: ${new Date(session.date).toLocaleString()}`, 14, 15);

  // Combine correct, incorrect and skipped questions
  const allQuestions = [
    ...session.correct.map(q => ({ ...q, status: 'Correct' })),
    ...session.incorrect.map(q => ({ ...q, status: 'Incorrect' })),
    ...(session.skipped || []).map(q => ({ ...q, status: 'Skipped' }))
  ];

  const tableData = allQuestions.map((q, index) => [
    index + 1,
    q.question,
    q.options[q.correct] || 'N/A',
    q.explanation || 'No reasoning provided.'
  ]);

  autoTable(doc, {
    startY: 20,
    head: [['#', 'Question', 'Correct Answer', 'Reasoning']],
    body: tableData,
    headStyles: { fillColor: [33, 150, 243] },
    columnStyles: {
      0: { cellWidth: 10 },
      1: { cellWidth: 80 },
      2: { cellWidth: 40 },
      3: { cellWidth: 'auto' }
    },
    styles: { overflow: 'linebreak', cellPadding: 1, fontSize: 8 }
  });

  doc.save(`${session.exam}_Session_${new Date(session.date).toLocaleDateString().replace(/\//g, '-')}.pdf`);
};
