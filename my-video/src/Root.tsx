import React from 'react';
import {Composition} from 'remotion';
import {ClaudeAnimation} from './ClaudeAnimation';

export const RemotionRoot: React.FC = () => {
	return (
		<>
			<Composition
				id="ClaudeAnimation"
				component={ClaudeAnimation}
				durationInFrames={180}
				fps={30}
				width={1920}
				height={1080}
			/>
		</>
	);
};
