import React from 'react';
import {AbsoluteFill, Video, staticFile, useVideoConfig} from 'remotion';

export const SplitScreen: React.FC = () => {
	const {width, height} = useVideoConfig();
	const half = height / 2;

	return (
		<AbsoluteFill style={{background: '#000'}}>
			{/* Top — Dany's video */}
			<div
				style={{
					position: 'absolute',
					top: 0,
					left: 0,
					width,
					height: half,
					overflow: 'hidden',
				}}
			>
				<Video
					src={staticFile('dany-video.mp4')}
					style={{
						width: '100%',
						height: '100%',
						objectFit: 'cover',
					}}
				/>
			</div>

			{/* Thin separator line */}
			<div
				style={{
					position: 'absolute',
					top: half - 1,
					left: 0,
					width,
					height: 2,
					background: 'rgba(255,255,255,0.15)',
				}}
			/>

			{/* Bottom — IMG_9858 */}
			<div
				style={{
					position: 'absolute',
					top: half,
					left: 0,
					width,
					height: half,
					overflow: 'hidden',
				}}
			>
				<Video
					src={staticFile('img9858.mp4')}
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
