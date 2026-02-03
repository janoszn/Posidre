import React, { useState, useEffect } from 'react';
import { Box, Typography, Card, IconButton, CardActionArea, Grid, CircularProgress, Fade } from '@mui/material';
import SurveyAnswers from './SurveyAnswers'; // Le nouveau composant
import { api } from '../services/api';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

const TeacherContent = () => {
    const [surveys, setSurveys] = useState([]);
    const [selectedSurvey, setSelectedSurvey] = useState(null); // On stocke l'objet complet
    const [submissions, setSubmissions] = useState([]);
    const [loading, setLoading] = useState(false);

    const loadSurveys = async () => {
        setLoading(true);
        try {
            const data = await api.getTeacherSurveys();
            setSurveys(data);
        } catch (err) {
            console.error("Erreur:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadSurveys();
    }, []);

    const handleSelectSurvey = async (survey) => {
        setLoading(true);
        try {
            const data = await api.getSurveySubmissions(survey.id);
            setSubmissions(data);
            setSelectedSurvey(survey);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box sx={{ p: 2 }}>
            {/* EN-TÊTE STABLE : La hauteur ne change JAMAIS */}
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 4, minHeight: '40px' }}>
                {selectedSurvey && (
                    <Fade in={Boolean(selectedSurvey)}>
                        <IconButton
                            onClick={() => setSelectedSurvey(null)}
                            edge="start"
                            sx={{ mr: 1 }}
                        >
                            <ArrowBackIcon />
                        </IconButton>
                    </Fade>
                )}

                <Typography
                    variant="h5"
                    sx={{
                        fontWeight: 'bold',
                        transition: 'margin-left 0.3s ease-in-out',
                    }}
                >
                    {selectedSurvey ? selectedSurvey.title : "Mes Questionnaires"}
                </Typography>
            </Box>

            {/* CONTENU */}
            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 5 }}><CircularProgress /></Box>
            ) : selectedSurvey ? (
                <SurveyAnswers submissions={submissions} />
            ) : (
                <Grid container spacing={3}>
                    {surveys.map((s) => (
                        <Grid size={{ xs: 12, sm: 6 }} key={s.id}>
                            <Card onClick={() => handleSelectSurvey(s)}>
                                <CardActionArea sx={{ p: 2 }}>
                                    <Typography variant="h6">{s.title}</Typography>
                                    <Typography variant="caption" color="text.secondary">Code PIN: {s.pinCode}</Typography>
                                </CardActionArea>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            )}
        </Box>
    );
};

export default TeacherContent;
