import React from 'react';
import {interpolate} from 'remotion';

interface ParticleProps {
	frame: number;
	index: number;
	total: number;
	centerX: number;
	centerY: number;
}

// Deterministic smooth noise using layered sines — no external deps
const smoothNoise = (t: number, seed: number) =>
	Math.sin(t * 2.1 + seed * 5.3) * 0.5 +
	Math.sin(t * 5.7 + seed * 1.9) * 0.25 +
	Math.sin(t * 13.3 + seed * 3.1) * 0.125;

export const Particle: React.FC<ParticleProps> = ({
	frame,
	index,
	total,
	centerX,
	centerY,
}) => {
	// --- Deterministic layout ---
	// Golden-angle spiral distribution for even coverage
	const angle = (index / total) * Math.PI * 2 + index * 2.399963;
	const radius = 520 + ((index * 137) % 380);
	const delay = (index * 11) % 55;
	const size = 2 + ((index * 7) % 5);
	const hue = 246 + ((index * 17) % 50); // indigo → purple range

	const startX = centerX + Math.cos(angle) * radius;
	const startY = centerY + Math.sin(angle) * radius;

	const effectiveFrame = frame - delay;
	const duration = 170;

	// Smoothstep: ease-in-out
	const t01 = interpolate(effectiveFrame, [0, duration], [0, 1], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
	});
	const eased = t01 * t01 * (3 - 2 * t01);

	// Organic wobble perpendicular to the flight path
	const perpAngle = angle + Math.PI / 2;
	const wobbleAmp = (1 - eased) * 18;
	const wobble = smoothNoise(effectiveFrame * 0.04, index) * wobbleAmp;

	const x = startX + (centerX - startX) * eased + Math.cos(perpAngle) * wobble;
	const y = startY + (centerY - startY) * eased + Math.sin(perpAngle) * wobble;

	const opacity = interpolate(
		effectiveFrame,
		[0, 12, duration * 0.72, duration],
		[0, 0.95, 0.7, 0],
		{extrapolateLeft: 'clamp', extrapolateRight: 'clamp'},
	);

	const glowR = size * (1 + (1 - eased) * 2.5);

	return (
		<div
			style={{
				position: 'absolute',
				left: x - size / 2,
				top: y - size / 2,
				width: size,
				height: size,
				borderRadius: '50%',
				backgroundColor: `hsl(${hue}, 82%, 66%)`,
				opacity,
				boxShadow: `0 0 ${glowR * 3}px ${glowR}px hsla(${hue}, 82%, 70%, 0.45)`,
				pointerEvents: 'none',
			}}
		/>
	);
};
