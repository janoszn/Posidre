import { useState, useEffect } from 'react';
import { api } from '../services/api';

export default function WeatherForecast() {
    const [forecasts, setForecasts] = useState([]);

    useEffect(() => {
        // Ce useEffect ne s'occupe QUE de la météo
        api.getWeather()
            .then(data => setForecasts(data))
            .catch(err => console.error("Erreur météo:", err));
    }, []); // S'exécute une fois à l'affichage du composant

    return (
        <div>
            <h3>Météo</h3>
            <ul>
                {forecasts.map((f, i) => (
                    <li key={i}>{f.date}: {f.temperatureC}°C - {f.summary}</li>
                ))}
            </ul>
        </div>
    );
}
