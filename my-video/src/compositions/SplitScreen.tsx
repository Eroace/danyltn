import React from 'react';
import {AbsoluteFill, OffthreadVideo, staticFile, useVideoConfig} from 'remotion';

export const SplitScreen: React.FC = () => {
	const {width, height} = useVideoConfig();
	const halfHeight = Math.floor(height / 2);

	return (
		<AbsoluteFill style={{backgroundColor: '#000'}}>
			{/* Top: Dany's video-40.mp4 */}
			<div
				style={{
					position: 'absolute',
					top: 0,
					left: 0,
					width,
					height: halfHeight,
					overflow: 'hidden',
				}}
			>
				<OffthreadVideo
					src={staticFile("Dany's video-40.mp4")}
					style={{
						width: '100%',
						height: '100%',
						objectFit: 'cover',
					}}
				/>
			</div>

			{/* Bottom: IMG_9858.MOV */}
			<div
				style={{
					position: 'absolute',
					top: halfHeight,
					left: 0,
					width,
					height: halfHeight,
					overflow: 'hidden',
				}}
			>
				<OffthreadVideo
					src={staticFile('img_9858.mov')}
					style={{
						width: '100%',
						height: '100%',
						objectFit: 'cover',
					}}
				/>
			</div>
		</AbsoluteFill>
	);
};
