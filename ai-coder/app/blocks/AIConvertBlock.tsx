'use client';
import { useState } from 'react';
import {
    Box,
    Button,
    Card,
    CardBody,
    CardHeader,
    Flex,
    Heading,
    Select,
    Tab,
    TabIndicator,
    TabList,
    TabPanel,
    TabPanels,
    Tabs,
    Textarea,
} from '@chakra-ui/react';
import { AIConvertStep, Step } from '../types';
import HighlightedCode from '../HighlightedCode/HighlightedCode';
interface Props {
    step: AIConvertStep;
    onChange: (step: AIConvertStep | ((step: Step) => Step)) => void;
    onDelete: (step: Step) => void;
    steps: Step[];
    index: number;
}
function getStepCodes(step: Step): string[] {
    if (step.type === 'input' || step.type === 'merge') {
        return [step.code];
    }
    if (step.type === 'split' || step.type === 'ai-convert') {
        return step.codes.map((code) => code.text);
    }
    return [];
}
async function fetchAIConvert(
    prompt: AIConvertStep['prompt'],
    prevStepCode: string
) {
    const res = await fetch('/api/aiconvert', {
        method: 'POST',
        body: JSON.stringify({
            prompt,
            prevStepCode,
        }),
        headers: {
            'Content-Type': 'application/json',
        },
    });
    const reader = res.body?.pipeThrough(new TextDecoderStream()).getReader();
    if (!reader) {
        throw new Error('No reader');
    }
    return reader;
}
function updatedNthElement<T>(array: T[], index: number, newValue: T) {
    return [
        ...array.slice(0, index),
        newValue,
        ...array.slice(index + 1, array.length),
    ];
}
export default function AIConvertBlock({
    step,
    steps,
    onChange,
    onDelete,
    index,
}: Props) {
    const prevStepCodes = getStepCodes(steps[index - 1]);
    const [loading, setLoading] = useState(false);
    const handlePressConvert = async () => {
        try {
            setLoading(true);
            onChange({
                ...step,
                codes: prevStepCodes.map(() => ({ text: '' })),
            });
            for (
                let codeIndex = 0;
                codeIndex < prevStepCodes.length;
                codeIndex++
            ) {
                const reader = await fetchAIConvert(
                    step.prompt,
                    prevStepCodes[codeIndex]
                );
                let combinedValue = '';
                while (true) {
                    const { value, done } = (await reader.read()) ?? {};
                    if (value) {
                        combinedValue += value;
                    }
                    onChange((step) => {
                        if (step.type !== 'ai-convert') {
                            return step;
                        }
                        const codes = [...step.codes];
                        codes[codeIndex] = { text: combinedValue };
                        return { ...step, codes };
                    });
                    if (done) {
                        break;
                    }
                }
            }
        } finally {
            setLoading(false);
        }
    };
    const handlePromptSystemChange = (
        e: React.ChangeEvent<HTMLTextAreaElement>
    ) => {
        onChange({
            ...step,
            prompt: {
                ...step.prompt,
                system: e.target.value,
            },
        });
    };
    const handleChatHistoryChange = (
        entity: { type: 'user' | 'assistant'; text: string },
        i: number
    ) => {
        onChange({
            ...step,
            prompt: {
                ...step.prompt,
                history: updatedNthElement(step.prompt.history, i, {
                    type: entity.type,
                    text: entity.text,
                }),
            },
        });
    };
    const handleDeleteChatHistory = (i: number) => {
        onChange({
            ...step,
            prompt: {
                ...step.prompt,
                history: [...step.prompt.history].splice(i, 1),
            },
        });
    };
    const handleAddChatHistory = () => {
        onChange({
            ...step,
            prompt: {
                ...step.prompt,
                history: [
                    ...step.prompt.history,
                    {
                        type: 'user',
                        text: '',
                    },
                ],
            },
        });
    };
    return (
        <Card borderColor="red.300" borderLeftWidth={2}>
            <CardHeader>
                <Flex justifyContent="space-between">
                    <Button onClick={handlePressConvert} isLoading={loading}>
                        Convert with AI
                    </Button>
                    <Button colorScheme="red" onClick={() => onDelete(step)}>
                        Delete
                    </Button>
                </Flex>
            </CardHeader>
            <CardBody>
                <Tabs position="relative" variant="unstyled">
                    <TabList>
                        <Tab>Prompt</Tab>
                        <Tab>Result</Tab>
                    </TabList>
                    <TabIndicator
                        height="0.5"
                        bg="blue.500"
                        borderRadius="1px"
                    />
                    <TabPanels>
                        <TabPanel>
                            <Flex gap="2">
                                <Box flex="1">
                                    <Heading size="md" mb="4">
                                        System
                                    </Heading>
                                    <Textarea
                                        minH="32"
                                        value={step.prompt.system}
                                        onChange={handlePromptSystemChange}
                                        placeholder="System prompt"
                                    />
                                </Box>
                                <Flex flex="1" gap="4" flexDirection="column">
                                    <Heading size="md">Chat History</Heading>
                                    {step.prompt.history.map((entity, i) => (
                                        <Flex
                                            flexDirection="column"
                                            key={i}
                                            gap="2"
                                        >
                                            <Select
                                                onChange={(e) =>
                                                    handleChatHistoryChange(
                                                        {
                                                            type: e.target
                                                                .value as
                                                                | 'user'
                                                                | 'assistant',
                                                            text: entity.text,
                                                        },
                                                        i
                                                    )
                                                }
                                                value={entity.type}
                                            >
                                                <option value="user">
                                                    User
                                                </option>
                                                <option value="assistant">
                                                    Assistant
                                                </option>
                                            </Select>
                                            <Textarea
                                                minH="32"
                                                value={entity.text}
                                                onChange={(e) =>
                                                    handleChatHistoryChange(
                                                        {
                                                            type: entity.type,
                                                            text: e.target
                                                                .value,
                                                        },
                                                        i
                                                    )
                                                }
                                                placeholder=""
                                            />
                                            <Button
                                                colorScheme="red"
                                                size="xs"
                                                onClick={() =>
                                                    handleDeleteChatHistory(i)
                                                }
                                            >
                                                Delete
                                            </Button>
                                        </Flex>
                                    ))}
                                    <Button onClick={handleAddChatHistory}>
                                        Add
                                    </Button>
                                </Flex>
                            </Flex>
                        </TabPanel>
                        <TabPanel>
                            <Flex flexDir="row" overflowX="scroll" gap="2">
                                {step.codes.map((code, i) => (
                                    <Box key={i} maxW="50vw">
                                        <Heading size="sm">
                                            {i} / {step.codes.length}
                                        </Heading>
                                        <HighlightedCode
                                            code={code.text}
                                            oldCode={prevStepCodes[i]}
                                        />
                                    </Box>
                                ))}
                            </Flex>
                        </TabPanel>
                    </TabPanels>
                </Tabs>
            </CardBody>
        </Card>
    );
}
