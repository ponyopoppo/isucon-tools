'use client';
import {
    Box,
    Button,
    Card,
    CardBody,
    CardHeader,
    Checkbox,
    Flex,
    FormLabel,
    Heading,
    Input,
    Text,
} from '@chakra-ui/react';
import { InputStep, MergeStep, SplitStep, Step } from '../types';
import { splitCode } from '../utils/splitCode';
import HighlightedCode from '../HighlightedCode/HighlightedCode';

interface Props {
    step: SplitStep;
    onChange: (step: SplitStep) => void;
    onDelete: (step: Step) => void;
    steps: Step[];
    index: number;
}

export default function SplitBlock({
    step,
    onChange,
    steps,
    index,
    onDelete,
}: Props) {
    const { config } = step;
    return (
        <Card borderColor="green.300" borderLeftWidth={2}>
            <CardHeader>
                <Flex justifyContent="space-between">
                    <Button
                        onClick={() => {
                            onChange({
                                ...step,
                                type: 'split',
                                codes: splitCode(
                                    (steps[index - 1] as InputStep | MergeStep)
                                        .code,
                                    step.config
                                ),
                            });
                        }}
                    >
                        Split
                    </Button>
                    <Button colorScheme="red" onClick={() => onDelete(step)}>
                        Delete
                    </Button>
                </Flex>
            </CardHeader>
            <CardBody>
                <Flex flexDir="column">
                    <Checkbox
                        onChange={(e) =>
                            onChange({
                                ...step,
                                config: {
                                    ...(step.config || {}),
                                    extractFunction: e.target.checked,
                                },
                            })
                        }
                        isChecked={step.config?.extractFunction}
                    >
                        Function
                    </Checkbox>
                    <Checkbox
                        onChange={(e) =>
                            onChange({
                                ...step,
                                config: {
                                    ...(step.config || {}),
                                    extractEndpoint: e.target.checked,
                                },
                            })
                        }
                        isChecked={step.config?.extractEndpoint}
                    >
                        Endpoint
                    </Checkbox>
                    {step.config?.extractEndpoint ? (
                        <Flex gap="2">
                            <Box>
                                <FormLabel>App variable name</FormLabel>
                                <Input
                                    size="sm"
                                    value={config?.endpointAppName}
                                    onChange={(e) =>
                                        onChange({
                                            ...step,
                                            config: {
                                                ...config,
                                                endpointAppName: e.target.value,
                                            },
                                        })
                                    }
                                />
                            </Box>
                            <Box>
                                <FormLabel>Methods</FormLabel>
                                <Input
                                    size="sm"
                                    value={config?.endpointMethodNames}
                                    onChange={(e) =>
                                        onChange({
                                            ...step,
                                            config: {
                                                ...config,
                                                endpointMethodNames:
                                                    e.target.value,
                                            },
                                        })
                                    }
                                />
                            </Box>
                        </Flex>
                    ) : null}
                </Flex>
                <Flex flexDir="row" overflowX="scroll" gap="2">
                    {step.codes.map((code, i) => (
                        <Box key={i} maxW="50vw">
                            <Heading size="sm">
                                <Flex justifyContent="space-between">
                                    <Text>
                                        {i} / {step.codes.length}
                                    </Text>
                                    <Flex gap="1">
                                        <Checkbox
                                            isChecked={code.ignored ?? false}
                                            onChange={(e) => {
                                                const newCodes = [
                                                    ...step.codes,
                                                ];
                                                newCodes[i] = {
                                                    ...newCodes[i],
                                                    ignored: e.target.checked,
                                                };
                                                onChange({
                                                    ...step,
                                                    codes: newCodes,
                                                });
                                            }}
                                        />
                                        Ignore
                                    </Flex>
                                </Flex>
                            </Heading>
                            <HighlightedCode code={code.text} />
                        </Box>
                    ))}
                </Flex>
            </CardBody>
        </Card>
    );
}
