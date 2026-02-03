import React, { useState } from 'react';
import { Accordion, AccordionSummary, AccordionDetails, Typography, Box, Tabs, Tab } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ListIcon from '@mui/icons-material/List';
import BarChartIcon from '@mui/icons-material/BarChart';

const SurveyAnswers = ({ submissions }) => {
    const [tabValue, setTabValue] = useState(0);

    if (submissions.length === 0) {
        return <Typography sx={{ mt: 2 }}>Aucune réponse pour le moment.</Typography>;
    }

    const handleTabChange = (event, newValue) => {
        setTabValue(newValue);
    };

    return (
        <Box>
            {/* Barre d'onglets pour basculer entre Liste et Stats */}
            <Tabs
                value={tabValue}
                onChange={handleTabChange}
                sx={{ mb: 3, borderBottom: 1, borderColor: 'divider' }}
            >
                <Tab icon={<ListIcon />} label="Réponses" iconPosition="start" />
                <Tab icon={<BarChartIcon />} label="Statistiques" iconPosition="start" />
            </Tabs>

            {/* ONGLET 0 : LISTE DES RÉPONSES (Ton code actuel) */}
            {tabValue === 0 && (
                <Box>
                    <Typography variant="h6" sx={{ mb: 2, color: 'text.secondary' }}>
                        {submissions.length} élève(s) ont répondu
                    </Typography>
                    {submissions.map((sub) => (
                        <Accordion key={sub.id} sx={{ mb: 1 }}>
                            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                <Typography sx={{ fontWeight: 'bold' }}>{sub.studentName}</Typography>
                            </AccordionSummary>
                            <AccordionDetails>
                                {sub.answers.map((a) => (
                                    <Box key={a.id} sx={{ mb: 2 }}>
                                        <Typography variant="subtitle2" color="primary">{a.questionText}</Typography>
                                        <Typography variant="body1">{a.value}</Typography>
                                    </Box>
                                ))}
                            </AccordionDetails>
                        </Accordion>
                    ))}
                </Box>
            )}

            {/* ONGLET 1 : STATISTIQUES (Futur composant) */}
            {tabValue === 1 && (
                <Box sx={{ p: 2, textAlign: 'center' }}>
                    <Typography variant="h6" gutterBottom>Analyse des données</Typography>
                    <Typography variant="body2" color="text.secondary">
                        Les graphiques de synthèse s'afficheront ici bientôt.
                    </Typography>
                    {/* On pourra y insérer un composant de type <SurveyChart data={submissions} /> */}
                </Box>
            )}
        </Box>
    );
};

export default SurveyAnswers;
