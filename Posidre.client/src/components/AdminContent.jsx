import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export default function AdminContent() {
    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <span>👥</span>
                        User Management
                    </CardTitle>
                    <CardDescription>
                        View and manage all users, assign roles, and monitor activity.
                    </CardDescription>
                </CardHeader>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <span>📊</span>
                        Platform Overview
                    </CardTitle>
                    <CardDescription>
                        System stats, course stats, and overall platform health.
                    </CardDescription>
                </CardHeader>
            </Card>

            <Separator />

            <Card>
                <CardHeader>
                    <CardTitle>Weather Forecast</CardTitle>
                </CardHeader>
                <CardContent>
                    <WeatherForecast />
                </CardContent>
            </Card>
        </div>
    );
}