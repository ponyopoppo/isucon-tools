'use client';
import { Box, Button, Card, CardBody, Flex, Heading } from '@chakra-ui/react';
import InputBlock from './blocks/InputBlock';
import { useState } from 'react';
import { Step } from './types';
import SplitBlock from './blocks/SplitBlock';
import AIConvertBlock from './blocks/AIConvertBlock';
import MergeBlock from './blocks/MergeBlock';

export default function Home() {
    const [steps, setSteps] = useState<Step[]>([
        {
            type: 'input',
            code: '',
        },
    ]);

    const updateStep = (index: number, step: Step | ((step: Step) => Step)) => {
        setSteps((steps) => {
            const newSteps = [...steps];
            if (typeof step === 'function') {
                newSteps[index] = step(newSteps[index]);
            } else {
                newSteps[index] = step;
            }
            return newSteps;
        });
    };

    const addStep = (step: Step) => {
        setSteps((steps) => [...steps, step]);
    };

    const deleteStep = (step: Step) => {
        setSteps((steps) => steps.filter((s) => s !== step));
    };

    return (
        <Box h="100vh" bgColor="gray.100">
            <Button
                onClick={() => {
                    if (confirm('Are you sure?')) {
                        localStorage.setItem('steps', JSON.stringify(steps));
                    }
                }}
            >
                Save
            </Button>
            <Button
                onClick={() => {
                    const steps = localStorage.getItem('steps');
                    if (steps && confirm('Are you sure?')) {
                        setSteps(JSON.parse(steps));
                    }
                }}
            >
                Load
            </Button>
            {steps.map((step, i) => (
                <Box key={i} my="2" mx="1">
                    {step.type === 'input' ? (
                        <InputBlock
                            step={step}
                            steps={steps}
                            index={i}
                            onDelete={deleteStep}
                            onChange={(step) => updateStep(i, step)}
                        />
                    ) : step.type === 'split' ? (
                        <SplitBlock
                            step={step}
                            steps={steps}
                            index={i}
                            onDelete={deleteStep}
                            onChange={(step) => updateStep(i, step)}
                        />
                    ) : step.type == 'ai-convert' ? (
                        <AIConvertBlock
                            step={step}
                            steps={steps}
                            index={i}
                            onDelete={deleteStep}
                            onChange={(step) => updateStep(i, step)}
                        />
                    ) : (
                        <MergeBlock
                            step={step}
                            steps={steps}
                            index={i}
                            onDelete={deleteStep}
                            onChange={(step) => updateStep(i, step)}
                        />
                    )}
                </Box>
            ))}
            <Box m="2">
                <Card>
                    <CardBody>
                        <Flex
                            justifyContent="space-between"
                            alignItems="center"
                        >
                            <Heading size="md">Add</Heading>
                            <Flex gap="2">
                                <Button
                                    onClick={() =>
                                        addStep({
                                            type: 'split',
                                            codes: [],
                                            config: {
                                                endpointAppName: 'app',
                                                endpointMethodNames:
                                                    'get,post,put,delete',
                                                extractEndpoint: true,
                                                extractFunction: true,
                                            },
                                        })
                                    }
                                    isDisabled={
                                        !['input', 'merge'].includes(
                                            steps[steps.length - 1].type
                                        )
                                    }
                                >
                                    Split
                                </Button>
                                <Button
                                    onClick={() =>
                                        addStep({
                                            type: 'ai-convert',
                                            prompt: {
                                                system: '',
                                                history: [],
                                            },
                                            codes: [],
                                        })
                                    }
                                >
                                    AI Convert
                                </Button>
                                <Button
                                    onClick={() =>
                                        addStep({
                                            type: 'merge',
                                            code: '',
                                        })
                                    }
                                >
                                    Merge
                                </Button>
                            </Flex>
                        </Flex>
                    </CardBody>
                </Card>
            </Box>
        </Box>
    );
}
