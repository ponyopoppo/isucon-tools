'use client';
import { Card, CardBody, Text, Textarea } from '@chakra-ui/react';
import { InputStep, Step } from '../types';

interface Props {
    step: InputStep;
    onChange: (step: InputStep) => void;
    onDelete: (step: Step) => void;
    steps: Step[];
    index: number;
}

export default function InputBlock({ step, onChange }: Props) {
    return (
        <Card>
            <CardBody>
                <Text>Input</Text>
                <Textarea
                    minH="60"
                    value={step.code}
                    onChange={(e) =>
                        onChange({ ...step, code: e.target.value })
                    }
                ></Textarea>
                <Text>
                    {step.code.length} characters,{' '}
                    {step.code.split('\n').length} lines
                </Text>
            </CardBody>
        </Card>
    );
}
