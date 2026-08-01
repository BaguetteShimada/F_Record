import * as React from 'react';
import { ActionButton, Tooltip, TooltipTrigger } from '@adobe/react-spectrum';
import { GITHUB_REPOSITORY_URL, openExternalUrl } from './externalLinks';
import GitHubIcon from './GitHubIcon';

interface GitHubLinkButtonProps {
    onError: (error: unknown) => void;
}

function GitHubLinkButton({ onError }: GitHubLinkButtonProps) {
    return (
        <TooltipTrigger delay={0}>
            <ActionButton
                aria-label="GitHub"
                onPress={() => {
                    openExternalUrl(GITHUB_REPOSITORY_URL, onError);
                }}
                UNSAFE_className="fr-icon-button fr-github-button"
            >
                <GitHubIcon />
            </ActionButton>
            <Tooltip>GitHub</Tooltip>
        </TooltipTrigger>
    );
}

export default GitHubLinkButton;
