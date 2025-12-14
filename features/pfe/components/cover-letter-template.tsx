import React from 'react';
import { Page, Text, View, Document, StyleSheet } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: 'Times-Roman',
    fontSize: 12,
    lineHeight: 1.5,
  },
  text: {
    marginBottom: 10,
    textAlign: 'justify',
  },
});

interface CoverLetterTemplateProps {
  content: string;
}

export const CoverLetterTemplate = ({ content }: CoverLetterTemplateProps) => {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View>
          <Text style={styles.text}>{content}</Text>
        </View>
      </Page>
    </Document>
  );
};
