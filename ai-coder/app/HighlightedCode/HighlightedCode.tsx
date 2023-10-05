// @ts-ignore
import { Box, Checkbox, Flex } from '@chakra-ui/react';
import './prism';
import './prism.css';
import ReactDiffViewer, { DiffMethod } from 'react-diff-viewer';
import { useState } from 'react';

declare global {
    const Prism: any;
}

export default function HighlightedCode({
    code,
    oldCode,
}: {
    code: string;
    oldCode?: string;
}) {
    const [isRaw, setIsRaw] = useState(false);
    const [isSplit, setIsSplit] = useState(false);
    return oldCode ? (
        <>
            <Flex gap="2" p="1">
                <Checkbox
                    isChecked={isRaw}
                    onChange={(e) => setIsRaw(e.target.checked)}
                >
                    Raw
                </Checkbox>
                <Checkbox
                    isChecked={isSplit}
                    onChange={(e) => setIsSplit(e.target.checked)}
                >
                    Split
                </Checkbox>
            </Flex>
            <Box overflow="scroll" minW="32" borderRadius="md" maxH="600px">
                <ReactDiffViewer
                    oldValue={isRaw ? code || '' : oldCode}
                    newValue={code || ''}
                    compareMethod={DiffMethod.WORDS}
                    useDarkTheme
                    hideLineNumbers
                    showDiffOnly={false}
                    splitView={isSplit && !isRaw}
                    renderContent={(code) => (
                        <pre
                            style={{ display: 'inline' }}
                            dangerouslySetInnerHTML={{
                                __html: Prism.highlight(
                                    code || '',
                                    Prism.languages.typescript
                                ),
                            }}
                        />
                    )}
                />
            </Box>
        </>
    ) : (
        <Box
            bg="gray.800"
            color="gray.400"
            overflow="scroll"
            p="2"
            borderRadius="md"
            maxH="600px"
        >
            <pre
                style={{ display: 'inline' }}
                dangerouslySetInnerHTML={{
                    __html: Prism.highlight(
                        code || '',
                        Prism.languages.typescript
                    ),
                }}
            />
        </Box>
    );
}
