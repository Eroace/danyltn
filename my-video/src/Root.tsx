import React from 'react';
import {Composition} from 'remotion';
import {Demo} from './compositions/Demo';

export const RemotionRoot: React.FC = () => {
	return (
		<>
			<Composition
				id="Demo"
				component={Demo}
				durationInFrames={600}
				fps={30}
				width={1920}
				height={1080}
			/>
		</>
	);
};
