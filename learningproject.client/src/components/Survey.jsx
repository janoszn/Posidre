import React, { useState } from 'react';
import { Container, Paper, Typography, TextField, Button, Box, Alert } from '@mui/material';
import { api } from '../services/api';

const PublicSurvey = ({ survey, onCancel }) => {
    const [studentName, setStudentName] = useState('');
    // Initialize alreadyDone directly from localStorage to avoid setState in useEffect
    const [alreadyDone, setAlreadyDone] = useState(() => {
        return !!localStorage.getItem(`survey_${survey.id}`);
    });
    const [isStarted, setIsStarted] = useState(false);
    const [answers, setAnswers] = useState({});

    const handleSubmitAnswers = async (answers) => {
        try {
            // 1. On prépare l'objet pour l'API
            const submissionData = {
                surveyId: survey.id,
                studentName: studentName, // Ton state défini plus haut
                answers: answers          // <-- On utilise enfin la variable ici !
            };

            // 2. Appel réel à ton service API (décommente quand tu es prêt)
            await api.submitSurvey(submissionData);

            // 3. Persistance locale
            localStorage.setItem(`survey_${survey.id}`, 'true');
            setAlreadyDone(true);

            alert("Merci ! Vos réponses ont été enregistrées.");
            onCancel();
        } catch (err) {
            console.error("Erreur d'envoi:", err);
            alert("Erreur lors de l'envoi. Veuillez réessayer.");
        }
    };

    const handleUpdateAnswer = (questionId, value) => {
        setAnswers(prev => ({
            ...prev,
            [questionId]: value
        }));
    };

    const prepareAndSubmit = () => {
        // Transformer l'objet { "1": "rep" } en liste [{ questionId: 1, value: "rep" }]
        const formattedAnswers = Object.keys(answers).map(qId => ({
            questionId: parseInt(qId),
            value: answers[qId]
        }));

        // On appelle ta fonction de soumission
        handleSubmitAnswers(formattedAnswers);
    };

    if (alreadyDone) {
        return (
            <Container maxWidth="sm" sx={{ mt: 10 }}>
                <Alert severity="info">Vous avez déjà répondu à ce questionnaire. Merci !</Alert>
                <Button onClick={onCancel} sx={{ mt: 2 }}>Retour</Button>
            </Container>
        );
    }

    return (
        <Container maxWidth="sm" sx={{ mt: 5 }}>
            <Paper sx={{ p: 4, borderRadius: 3 }}>
                {!isStarted ? (
                    <Box textAlign="center">
                        <Typography variant="h4">{survey.title}</Typography>
                        <Typography sx={{ mb: 3 }}>{survey.description}</Typography>
                        <TextField
                            fullWidth
                            label="Votre Nom Complet"
                            value={studentName}
                            onChange={(e) => setStudentName(e.target.value)}
                            sx={{ mb: 2 }}
                        />
                        <Button
                            variant="contained"
                            disabled={!studentName}
                            onClick={() => setIsStarted(true)}
                        >
                            Commencer
                        </Button>
                        <Button color="inherit" onClick={onCancel}>Annuler</Button>
                    </Box>
                ) : (
                    <Box>
                        <Typography variant="h5" sx={{ mb: 3 }}>{survey.title}</Typography>

                        {survey.questions.map((q) => (
                            <Box key={q.id} sx={{ mb: 3 }}>
                                <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                                    {q.text}
                                </Typography>
                                <TextField
                                    fullWidth
                                    variant="outlined"
                                    placeholder="Votre réponse ici..."
                                    value={answers[q.id] || ''}
                                    onChange={(e) => handleUpdateAnswer(q.id, e.target.value)}
                                    sx={{ mt: 1 }}
                                />
                            </Box>
                        ))}

                        <Box sx={{ mt: 4, display: 'flex', gap: 2 }}>
                            <Button
                                variant="contained"
                                color="primary"
                                fullWidth
                                onClick={() => prepareAndSubmit()}
                            >
                                Envoyer mes réponses
                            </Button>
                        </Box>
                    </Box>
                )}
            </Paper>
        </Container>
    );
};

export default PublicSurvey;
