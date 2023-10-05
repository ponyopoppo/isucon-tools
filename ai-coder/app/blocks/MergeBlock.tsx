'use client';
import {
    Button,
    Card,
    CardBody,
    CardHeader,
    Flex,
    Text,
    Textarea,
} from '@chakra-ui/react';
import { MergeStep, Step } from '../types';
import HighlightedCode from '../HighlightedCode/HighlightedCode';

interface Props {
    step: MergeStep;
    onChange: (step: MergeStep) => void;
    onDelete: (step: Step) => void;
    steps: Step[];
    index: number;
}

function getLastMergedCode(steps: Step[], currentIndex: number) {
    for (let i = currentIndex - 1; i >= 0; i--) {
        const step = steps[i];
        if (step.type === 'merge' || step.type === 'input') {
            return { code: step.code, index: i };
        }
    }
    throw new Error('No merge or input step found');
}

export default function MergeBlock({
    step,
    steps,
    onChange,
    onDelete,
    index,
}: Props) {
    const { code: lastMergedCode, index: lastMergedIndex } = getLastMergedCode(
        steps,
        index
    );
    const handleClickMerge = () => {
        const splitStep = steps[lastMergedIndex + 1];
        if (splitStep.type !== 'split') {
            throw new Error('Expected split step');
        }
        const lastStep = steps[index - 1];
        if (lastStep.type !== 'ai-convert' && lastStep.type !== 'split') {
            throw new Error('Expected ai-convert or split step');
        }

        // Check if some code ranges are overlapping in splitStep
        for (let i = 0; i < splitStep.codes.length; i++) {
            const code = splitStep.codes[i];
            for (let j = i + 1; j < splitStep.codes.length; j++) {
                const otherCode = splitStep.codes[j];
                if (
                    (code.start >= otherCode.start &&
                        code.start <= otherCode.end) ||
                    (code.end >= otherCode.start && code.end <= otherCode.end)
                ) {
                    alert('Overlapping code ranges');
                }
            }
        }

        const replaces = splitStep.codes
            .map((code, i) => ({
                start: code.start,
                end: code.end,
                oldText: code.text,
                newText: lastStep.codes[i].text,
            }))
            .sort((a, b) => b.start - a.start);

        let newCode = lastMergedCode;
        for (const replace of replaces) {
            newCode =
                newCode.slice(0, replace.start) +
                replace.newText +
                newCode.slice(replace.end);
        }
        onChange({
            ...step,
            code: newCode,
        });
    };

    return (
        <Card borderColor="blue.300" borderLeftWidth={2}>
            <CardHeader>
                <Flex justifyContent="space-between">
                    <Button onClick={handleClickMerge}>Merge</Button>
                    <Button colorScheme="red" onClick={() => onDelete(step)}>
                        Delete
                    </Button>
                </Flex>
            </CardHeader>
            <CardBody>
                {step.code ? (
                    <HighlightedCode
                        code={step.code}
                        oldCode={lastMergedCode}
                    />
                ) : null}
            </CardBody>
        </Card>
    );
}
