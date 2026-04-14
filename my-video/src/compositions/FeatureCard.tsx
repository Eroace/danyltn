import React from 'react';
import {interpolate, spring} from 'remotion';

interface FeatureCardProps {
	frame: number;
	fps: number;
	enterFrame: number;
	title: string;
	description: string;
	icon: React.ReactNode;
	accentColor: string;
}

export const FeatureCard: React.FC<FeatureCardProps> = ({
	frame,
	fps,
	enterFrame,
	title,
	description,
	icon,
	accentColor,
}) => {
	const rel = frame - enterFrame;

	const translateY = spring({
		frame: Math.max(0, rel),
		fps,
		from: 70,
		to: 0,
		config: {damping: 20, stiffness: 80, mass: 1},
	});

	const scale = spring({
		frame: Math.max(0, rel),
		fps,
		from: 0.88,
		to: 1,
		config: {damping: 20, stiffness: 80, mass: 1},
	});

	const opacity = interpolate(rel, [0, 18], [0, 1], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
	});

	// Animated SVG draw for the top accent line
	const lineProgress = interpolate(rel, [10, 50], [0, 1], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
	});

	return (
		<div
			style={{
				transform: `translateY(${translateY}px) scale(${scale})`,
				opacity,
				width: 460,
				background:
					'linear-gradient(160deg, rgba(14,12,26,0.97) 0%, rgba(10,8,20,0.99) 100%)',
				border: `1px solid ${accentColor}35`,
				borderRadius: 20,
				padding: '44px 40px 48px',
				position: 'relative',
				overflow: 'hidden',
				boxShadow: `0 0 0 1px ${accentColor}18, 0 24px 64px rgba(0,0,0,0.55), 0 0 80px ${accentColor}12`,
			}}
		>
			{/* Animated top accent bar */}
			<svg
				style={{position: 'absolute', top: 0, left: 0, right: 0, width: '100%'}}
				height="2"
				preserveAspectRatio="none"
			>
				<defs>
					<linearGradient id={`barGrad-${accentColor.replace('#', '')}`} x1="0%" x2="100%">
						<stop offset="0%" stopColor="transparent" />
						<stop offset="40%" stopColor={accentColor} stopOpacity="0.9" />
						<stop offset="100%" stopColor="transparent" />
					</linearGradient>
				</defs>
				<rect
					x="0"
					y="0"
					width={`${lineProgress * 100}%`}
					height="2"
					fill={`url(#barGrad-${accentColor.replace('#', '')})`}
				/>
			</svg>

			{/* Corner glow */}
			<div
				style={{
					position: 'absolute',
					top: -60,
					right: -60,
					width: 160,
					height: 160,
					borderRadius: '50%',
					background: `radial-gradient(circle, ${accentColor}22 0%, transparent 65%)`,
					pointerEvents: 'none',
				}}
			/>

			{/* Icon */}
			<div style={{marginBottom: 26}}>{icon}</div>

			{/* Title */}
			<h3
				style={{
					color: '#f0f0f8',
					fontSize: 24,
					fontWeight: 700,
					margin: '0 0 12px',
					letterSpacing: -0.4,
					fontFamily:
						"-apple-system, 'SF Pro Display', 'Inter', system-ui, sans-serif",
					lineHeight: 1.25,
				}}
			>
				{title}
			</h3>

			{/* Description */}
			<p
				style={{
					color: 'rgba(200,200,220,0.5)',
					fontSize: 15.5,
					margin: 0,
					lineHeight: 1.68,
					fontFamily:
						"-apple-system, 'SF Pro Text', 'Inter', system-ui, sans-serif",
					fontWeight: 400,
				}}
			>
				{description}
			</p>
		</div>
	);
};
