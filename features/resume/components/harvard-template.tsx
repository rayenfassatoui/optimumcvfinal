/* eslint-disable jsx-a11y/alt-text */
import React from 'react';
import { Page, Text, View, Document, StyleSheet, Font } from '@react-pdf/renderer';
import { ProfileData } from '@/features/onboarding/types';

// Register fonts if needed. For now using standard fonts.
// Font.register({ family: 'Times-Roman', src: '...' });

const styles = StyleSheet.create({
    page: {
        padding: 30,
        fontFamily: 'Times-Roman',
        fontSize: 11,
        lineHeight: 1.2,
    },
    header: {
        marginBottom: 10,
        textAlign: 'center',
    },
    name: {
        fontSize: 16,
        fontWeight: 'bold',
        textTransform: 'uppercase',
        marginBottom: 4,
    },
    contact: {
        fontSize: 10,
        marginBottom: 2,
    },
    section: {
        marginBottom: 10,
    },
    sectionTitle: {
        fontSize: 12,
        fontWeight: 'bold',
        textTransform: 'uppercase',
        borderBottomWidth: 1,
        borderBottomColor: '#000',
        marginBottom: 6,
        paddingBottom: 2,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 2,
    },
    bold: {
        fontWeight: 'bold',
    },
    italic: {
        fontStyle: 'italic',
    },
    bulletPoint: {
        flexDirection: 'row',
        marginBottom: 2,
        paddingLeft: 10,
    },
    bullet: {
        width: 10,
        fontSize: 10,
    },
    bulletContent: {
        flex: 1,
        fontSize: 10,
    },
});

interface HarvardTemplateProps {
    data: ProfileData;
}

export const HarvardTemplate = ({ data }: HarvardTemplateProps) => (
    <Document>
        <Page size="A4" style={styles.page}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.name}>{data.fullName}</Text>
                <Text style={styles.contact}>
                    {data.email} | {data.phone} | {data.linkedinUrl}
                </Text>
            </View>

            {/* Education */}
            {data.education && data.education.length > 0 && (
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Education</Text>
                    {data.education.map((edu, index) => (
                        <View key={index} style={{ marginBottom: 4 }}>
                            <View style={styles.row}>
                                <Text style={styles.bold}>{edu.school}</Text>
                                <Text>{edu.startDate} - {edu.endDate || 'Present'}</Text>
                            </View>
                            <View style={styles.row}>
                                <Text style={styles.italic}>{edu.degree}</Text>
                            </View>
                        </View>
                    ))}
                </View>
            )}

            {/* Experience */}
            {data.experience && data.experience.length > 0 && (
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Experience</Text>
                    {data.experience.map((exp, index) => (
                        <View key={index} style={{ marginBottom: 6 }}>
                            <View style={styles.row}>
                                <Text style={styles.bold}>{exp.company}</Text>
                                <Text>{exp.startDate} - {exp.endDate || 'Present'}</Text>
                            </View>
                            <View style={styles.row}>
                                <Text style={styles.italic}>{exp.title}</Text>
                            </View>
                            {/* Split description by newlines or bullets if possible. For now just text */}
                            <View style={styles.bulletPoint}>
                                <Text style={styles.bullet}>•</Text>
                                <Text style={styles.bulletContent}>{exp.description}</Text>
                            </View>
                        </View>
                    ))}
                </View>
            )}

            {/* Projects */}
            {data.projects && data.projects.length > 0 && (
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Projects</Text>
                    {data.projects.map((proj, index) => (
                        <View key={index} style={{ marginBottom: 4 }}>
                            <View style={styles.row}>
                                <Text style={styles.bold}>{proj.name}</Text>
                            </View>
                            <View style={styles.bulletPoint}>
                                <Text style={styles.bullet}>•</Text>
                                <Text style={styles.bulletContent}>{proj.description}</Text>
                            </View>
                            <Text style={{ fontSize: 9, fontStyle: 'italic', marginLeft: 10 }}>
                                Tech Stack: {proj.techStack.join(', ')}
                            </Text>
                        </View>
                    ))}
                </View>
            )}

            {/* Skills */}
            {data.skills && data.skills.length > 0 && (
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Skills</Text>
                    <Text style={{ fontSize: 10 }}>
                        {data.skills.join(' • ')}
                    </Text>
                </View>
            )}
        </Page>
    </Document>
);
