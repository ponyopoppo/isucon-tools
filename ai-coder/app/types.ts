export interface InputStep {
    type: 'input';
    code: string;
    path?: string;
}

export interface SplitStep {
    type: 'split';
    config?: {
        extractFunction?: boolean;
        extractEndpoint?: boolean;
        endpointAppName?: string;
        endpointMethodNames?: string;
    };
    codes: {
        start: number;
        end: number;
        text: string;
        ignored?: boolean;
    }[];
}

export interface AIConvertStep {
    type: 'ai-convert';
    prompt: {
        system: string;
        history: {
            type: 'user' | 'assistant';
            text: string;
        }[];
    };
    codes: {
        text: string;
        ignored?: boolean;
    }[];
}

export interface MergeStep {
    type: 'merge';
    code: string;
}

export type Step = InputStep | SplitStep | AIConvertStep | MergeStep;
