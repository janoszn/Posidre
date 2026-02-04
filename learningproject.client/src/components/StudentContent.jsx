import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import TodoList from './TodoList';
import WeatherForecast from './WeatherForecast';

export default function StudentContent() {
    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <span>📚</span>
                        My Courses
                    </CardTitle>
                    <CardDescription>
                        Courses you're enrolled in and your progress.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-slate-500">No courses yet.</p>
                </CardContent>
            </Card>

            <Separator />

            <Card>
                <CardHeader>
                    <CardTitle>My Tasks</CardTitle>
                </CardHeader>
                <CardContent>
                    <TodoList />
                </CardContent>
            </Card>

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