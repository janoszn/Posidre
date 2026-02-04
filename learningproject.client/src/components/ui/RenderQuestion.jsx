import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";

export default function RenderQuestion({
    q,
    answers,
    handleUpdateAnswer,
    handleMultipleChoiceToggle
}) {
    const options = q.optionsJson ? JSON.parse(q.optionsJson) : [];

    switch (q.type) {
        case 'text':
            return (
                <Input
                    placeholder="Votre réponse ici..."
                    value={answers[q.id] || ''}
                    onChange={(e) => handleUpdateAnswer(q.id, e.target.value)}
                    className="mt-2"
                />
            );

        case 'scale': {
            const min = q.scaleMin ?? 0;
            const max = q.scaleMax ?? 10;
            const scaleValue = answers[q.id] ?? min;

            return (
                <div className="space-y-4 mt-4">
                    <div className="flex justify-between text-sm text-muted-foreground">
                        <span>{q.scaleMinLabel || min}</span>
                        <span className="font-bold text-primary text-lg">{scaleValue}</span>
                        <span>{q.scaleMaxLabel || max}</span>
                    </div>
                    <Slider
                        min={min}
                        max={max}
                        step={1}
                        value={[scaleValue]}
                        onValueChange={(value) => handleUpdateAnswer(q.id, value[0])}
                        className="w-full"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground px-1">
                        {Array.from({ length: (max - min) + 1 }, (_, i) => (
                            <span key={i}>{min + i}</span>
                        ))}
                    </div>
                </div>
            );
        }

        case 'single_choice':
            return (
                <RadioGroup
                    value={answers[q.id] || ''}
                    onValueChange={(value) => handleUpdateAnswer(q.id, value)}
                    className="mt-3 space-y-2"
                >
                    {options.map((option, idx) => (
                        <div key={idx} className="flex items-center space-x-2">
                            <RadioGroupItem value={option} id={`${q.id}-${idx}`} />
                            <Label htmlFor={`${q.id}-${idx}`} className="cursor-pointer">{option}</Label>
                        </div>
                    ))}
                </RadioGroup>
            );

        case 'multiple_choice': {
            const selectedOptions = answers[q.id] || [];
            return (
                <div className="mt-3 space-y-2">
                    {options.map((option, idx) => (
                        <div key={idx} className="flex items-center space-x-2">
                            <Checkbox
                                id={`${q.id}-${idx}`}
                                checked={selectedOptions.includes(option)}
                                onCheckedChange={() => handleMultipleChoiceToggle(q.id, option)}
                            />
                            <Label htmlFor={`${q.id}-${idx}`} className="cursor-pointer">{option}</Label>
                        </div>
                    ))}
                </div>
            );
        }

        default:
            return <p className="text-sm text-red-500">Type de question inconnu</p>;
    }
}