'use client';
import {
    Box,
    Button,
    Flex,
    Input,
    Modal,
    ModalBody,
    ModalContent,
    ModalFooter,
    ModalHeader,
    ModalOverlay,
    Text,
} from '@chakra-ui/react';
import { AIConvertStep } from '../types';
import { useState, useEffect } from 'react';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onClickUse: (prompt: AIConvertStep['prompt']) => void;
    currentPrompt: AIConvertStep['prompt'];
}

interface Prompt {
    name: string;
    createdAt: number;
    prompt: AIConvertStep['prompt'];
}

export default function PromptManager({
    isOpen,
    onClose,
    currentPrompt,
    onClickUse,
}: Props) {
    const [prompts, setPrompts] = useState<Prompt[]>([]);
    const [name, setName] = useState<string>('');

    useEffect(() => {
        setPrompts(JSON.parse(localStorage.getItem('prompts') || '[]'));
    }, []);

    const savePrompts = (prompts: Prompt[]) => {
        localStorage.setItem('prompts', JSON.stringify(prompts));
    };

    const handleClickSave = () => {
        setPrompts((prompts) => {
            const newPrompts = [
                ...prompts,
                { name, prompt: currentPrompt, createdAt: Date.now() },
            ];
            savePrompts(newPrompts);
            setName('');
            return newPrompts;
        });
    };

    const handleClickDelete = (i: number) => () => {
        if (!confirm('Are you sure?')) {
            return;
        }
        setPrompts((prompts) => {
            const newPrompts = [...prompts];
            newPrompts.splice(i, 1);
            savePrompts(newPrompts);
            return newPrompts;
        });
    };

    const handleClickUse = (prompt: AIConvertStep['prompt']) => () => {
        onClickUse(prompt);
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <ModalOverlay />
            <ModalContent>
                <ModalHeader>Manage prompts</ModalHeader>
                <ModalBody>
                    <Flex flexDir="column" gap="4" py="2">
                        {prompts.map((prompt, i) => (
                            <Flex
                                key={i}
                                justifyContent="space-between"
                                alignItems="center"
                            >
                                <Flex flexDir="column" gap="1">
                                    <Text>{prompt.name}</Text>
                                    <Text color="gray.500">
                                        {new Date(
                                            prompt.createdAt
                                        ).toLocaleDateString()}
                                    </Text>
                                </Flex>
                                <Flex>
                                    <Button
                                        size="sm"
                                        colorScheme="red"
                                        mr="1"
                                        onClick={handleClickDelete(i)}
                                    >
                                        Delete
                                    </Button>
                                    <Button
                                        size="sm"
                                        colorScheme="blue"
                                        onClick={handleClickUse(prompt.prompt)}
                                    >
                                        Use
                                    </Button>
                                </Flex>
                            </Flex>
                        ))}
                    </Flex>
                    <Flex>
                        <Input
                            flex="1"
                            size="sm"
                            value={name}
                            placeholder="prompt name"
                            onChange={(e) => setName(e.target.value)}
                        />
                        <Button
                            size="sm"
                            onClick={handleClickSave}
                            isDisabled={!name || !currentPrompt}
                        >
                            Save current prompt
                        </Button>
                    </Flex>
                </ModalBody>
                <ModalFooter>
                    <Button variant="ghost" onClick={onClose}>
                        Close
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
}
