import React from 'react';
import {
	AbsoluteFill,
	interpolate,
	spring,
	useCurrentFrame,
	useVideoConfig,
} from 'remotion';

// Stylised 4-pointed sparkle – inspired by Anthropic / Claude brand shape
const ClaudeLogo: React.FC<{frame: number; fps: number}> = ({frame, fps}) => {
	const scale = spring({
		frame,
		fps,
		from: 0,
		to: 1,
		durationInFrames: 45,
		config: {damping: 10, stiffness: 90, mass: 0.6},
	});

	const initialSpin = interpolate(frame, [0, 45], [-120, 0], {
		extrapolateRight: 'clamp',
	});

	// Gentle continuous rotation after entry
	const idleSpin = interpolate(frame, [45, 180], [0, 12], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
	});

	const rotation = frame < 45 ? initialSpin : idleSpin;

	// Pulsing glow
	const glowSize = interpolate(
		Math.sin(((frame - 45) / fps) * Math.PI * 1.5),
		[-1, 1],
		[15, 28],
	);

	return (
		<div
			style={{
				width: 320,
				height: 320,
				transform: `scale(${scale}) rotate(${rotation}deg)`,
				position: 'relative',
				display: 'flex',
				alignItems: 'center',
				justifyContent: 'center',
			}}
		>
			{/* Outer radial glow */}
			<div
				style={{
					position: 'absolute',
					inset: 0,
					borderRadius: '50%',
					background:
						'radial-gradient(circle, rgba(245,158,11,0.35) 0%, rgba(217,119,6,0.15) 45%, transparent 70%)',
					filter: `blur(${glowSize}px)`,
					transform: 'scale(1.4)',
				}}
			/>

			<svg
				viewBox="0 0 200 200"
				width="260"
				height="260"
				style={{position: 'relative', zIndex: 1}}
			>
				<defs>
					<radialGradient id="outerGrad" cx="50%" cy="50%" r="50%">
						<stop offset="0%" stopColor="#FDE68A" />
						<stop offset="40%" stopColor="#F59E0B" />
						<stop offset="100%" stopColor="#B45309" />
					</radialGradient>
					<radialGradient id="innerGrad" cx="50%" cy="50%" r="50%">
						<stop offset="0%" stopColor="#FFFBEB" stopOpacity="0.9" />
						<stop offset="100%" stopColor="#FCD34D" stopOpacity="0.3" />
					</radialGradient>
					<filter id="softGlow" x="-20%" y="-20%" width="140%" height="140%">
						<feGaussianBlur stdDeviation="4" result="blur" />
						<feMerge>
							<feMergeNode in="blur" />
							<feMergeNode in="SourceGraphic" />
						</feMerge>
					</filter>
				</defs>

				{/* 4-pointed sparkle shape */}
				<path
					d="M100,8
					   C115,48 152,85 192,100
					   C152,115 115,152 100,192
					   C85,152 48,115 8,100
					   C48,85 85,48 100,8 Z"
					fill="url(#outerGrad)"
					filter="url(#softGlow)"
				/>

				{/* Inner highlight overlay */}
				<path
					d="M100,38
					   C110,65 135,90 162,100
					   C135,110 110,135 100,162
					   C90,135 65,110 38,100
					   C65,90 90,65 100,38 Z"
					fill="url(#innerGrad)"
				/>

				{/* Centre dot */}
				<circle cx="100" cy="100" r="14" fill="#FFFBEB" opacity="0.9" />
			</svg>
		</div>
	);
};

// Animated letter-by-letter title reveal
const AnimatedTitle: React.FC<{frame: number}> = ({frame}) => {
	const text = 'CLAUDE';
	return (
		<div style={{display: 'flex', gap: 6}}>
			{text.split('').map((char, i) => {
				const delay = 60 + i * 6;
				const opacity = interpolate(frame, [delay, delay + 20], [0, 1], {
					extrapolateLeft: 'clamp',
					extrapolateRight: 'clamp',
				});
				const y = interpolate(frame, [delay, delay + 20], [24, 0], {
					extrapolateLeft: 'clamp',
					extrapolateRight: 'clamp',
				});
				return (
					<span
						key={i}
						style={{
							display: 'inline-block',
							color: '#ffffff',
							fontSize: 96,
							fontWeight: 700,
							letterSpacing: 2,
							opacity,
							transform: `translateY(${y}px)`,
							fontFamily: '"SF Pro Display", "Inter", "Helvetica Neue", sans-serif',
						}}
					>
						{char}
					</span>
				);
			})}
		</div>
	);
};

export const ClaudeAnimation: React.FC = () => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();

	const subtitleOpacity = interpolate(frame, [110, 140], [0, 1], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
	});
	const subtitleY = interpolate(frame, [110, 140], [20, 0], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
	});

	// Subtle background particle shimmer
	const shimmer = interpolate(
		Math.sin((frame / fps) * Math.PI * 0.8),
		[-1, 1],
		[0.03, 0.08],
	);

	return (
		<AbsoluteFill
			style={{
				background:
					'radial-gradient(ellipse at 50% 40%, #1c1407 0%, #0f0a02 60%, #050300 100%)',
				display: 'flex',
				flexDirection: 'column',
				alignItems: 'center',
				justifyContent: 'center',
				gap: 0,
				overflow: 'hidden',
			}}
		>
			{/* Ambient background halo */}
			<div
				style={{
					position: 'absolute',
					width: 900,
					height: 900,
					borderRadius: '50%',
					background: `radial-gradient(circle, rgba(245,158,11,${shimmer}) 0%, transparent 65%)`,
					pointerEvents: 'none',
				}}
			/>

			{/* Logo */}
			<ClaudeLogo frame={frame} fps={fps} />

			{/* Title */}
			<div style={{marginTop: 24}}>
				<AnimatedTitle frame={frame} />
			</div>

			{/* Subtitle */}
			<div
				style={{
					opacity: subtitleOpacity,
					transform: `translateY(${subtitleY}px)`,
					marginTop: 16,
					textAlign: 'center',
				}}
			>
				<p
					style={{
						color: 'rgba(253,230,138,0.65)',
						fontSize: 30,
						margin: 0,
						fontWeight: 300,
						letterSpacing: 10,
						textTransform: 'uppercase',
						fontFamily:
							'"SF Pro Display", "Inter", "Helvetica Neue", sans-serif',
					}}
				>
					AI by Anthropic
				</p>
			</div>
		</AbsoluteFill>
	);
};
