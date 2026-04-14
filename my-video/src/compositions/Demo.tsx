import React from 'react';
import {
	AbsoluteFill,
	interpolate,
	spring,
	useCurrentFrame,
	useVideoConfig,
} from 'remotion';
import {FeatureCard} from './FeatureCard';
import {Particle} from './Particle';

// ─── Timing map (30 fps) — total 600 frames = 20 s ──────────────────
const T = {
	// Intro  0 → 150 (5 s)
	PARTICLES_END: 128,
	TITLE_START: 18,
	SUBTITLE_START: 60,
	SUBTITLE_END: 115,
	INTRO_OUT: [132, 152] as [number, number],

	// Features  150 → 450 (10 s)
	FEAT_IN: [150, 172] as [number, number],
	CARD_1: 162,
	CARD_2: 196,
	CARD_3: 230,
	LINE_1: [258, 308] as [number, number],
	LINE_2: [278, 328] as [number, number],
	DOT_IN: [250, 274] as [number, number],
	FEAT_OUT: [412, 450] as [number, number],

	// Outro  450 → 600 (5 s)
	OUTRO_IN: [450, 478] as [number, number],
	LOGO_START: 458,
	PULSE_START: 516,
	FADE_BLACK: [558, 600] as [number, number],
} as const;

const PARTICLE_COUNT = 42;
const FONT = "-apple-system,'SF Pro Display','Inter',system-ui,sans-serif";

// ─── SVG Icons ────────────────────────────────────────────

const IconBolt: React.FC<{progress: number}> = ({progress}) => (
	<svg width="48" height="48" viewBox="0 0 24 24" fill="none">
		<defs>
			<linearGradient id="boltGrad" x1="0" y1="0" x2="1" y2="1">
				<stop offset="0%" stopColor="#818cf8" />
				<stop offset="100%" stopColor="#a855f7" />
			</linearGradient>
		</defs>
		<path
			d="M13 2 L4.5 13.5 H11 L10 22 L19.5 10.5 H13 Z"
			fill="url(#boltGrad)"
			opacity={progress}
		/>
	</svg>
);

const IconNetwork: React.FC<{progress: number}> = ({progress}) => (
	<svg width="48" height="48" viewBox="0 0 24 24" fill="none">
		<defs>
			<linearGradient id="netGrad" x1="0" y1="0" x2="1" y2="1">
				<stop offset="0%" stopColor="#818cf8" />
				<stop offset="100%" stopColor="#a855f7" />
			</linearGradient>
		</defs>
		<circle cx="12" cy="4.5" r="2.2" fill="url(#netGrad)" opacity={progress} />
		<circle cx="4.5" cy="17" r="2.2" fill="url(#netGrad)" opacity={progress} />
		<circle cx="19.5" cy="17" r="2.2" fill="url(#netGrad)" opacity={progress} />
		<line x1="12" y1="6.7" x2="4.5" y2="14.8" stroke="url(#netGrad)" strokeWidth="1.4" opacity={progress} />
		<line x1="12" y1="6.7" x2="19.5" y2="14.8" stroke="url(#netGrad)" strokeWidth="1.4" opacity={progress} />
		<line x1="6.7" y1="17" x2="17.3" y2="17" stroke="url(#netGrad)" strokeWidth="1.4" opacity={progress} />
	</svg>
);

const IconSparkle: React.FC<{progress: number; rotation: number}> = ({progress, rotation}) => (
	<svg
		width="48"
		height="48"
		viewBox="0 0 24 24"
		fill="none"
		style={{transform: `rotate(${rotation}deg)`}}
	>
		<defs>
			<linearGradient id="sparkGrad" x1="0" y1="0" x2="1" y2="1">
				<stop offset="0%" stopColor="#818cf8" />
				<stop offset="100%" stopColor="#c084fc" />
			</linearGradient>
		</defs>
		<path
			d="M12 2 C12 2 13.1 8.6 17.2 10.8 C13.1 13 12 19 12 19 C12 19 10.9 13 6.8 10.8 C10.9 8.6 12 2 12 2Z"
			fill="url(#sparkGrad)"
			opacity={progress}
		/>
		<path
			d="M19.5 6 C19.5 6 20 8.8 21.5 9.7 C20 10.6 19.5 13 19.5 13 C19.5 13 19 10.6 17.5 9.7 C19 8.8 19.5 6 19.5 6Z"
			fill="url(#sparkGrad)"
			opacity={progress * 0.65}
		/>
		<path
			d="M5 3 C5 3 5.5 5.4 7 6.3 C5.5 7.2 5 9.2 5 9.2 C5 9.2 4.5 7.2 3 6.3 C4.5 5.4 5 3 5 3Z"
			fill="url(#sparkGrad)"
			opacity={progress * 0.45}
		/>
	</svg>
);

// ─── Animated icon wrapper (spring scale) ───────────────────────────
const AnimatedIcon: React.FC<{
	frame: number;
	fps: number;
	startFrame: number;
	children: React.ReactNode;
}> = ({frame, fps, startFrame, children}) => {
	const sc = spring({
		frame: Math.max(0, frame - startFrame),
		fps,
		from: 0,
		to: 1,
		config: {damping: 18, stiffness: 120},
	});
	return (
		<div style={{transform: `scale(${sc})`, transformOrigin: 'left center', display: 'inline-block'}}>
			{children}
		</div>
	);
};

// ─── Main composition ─────────────────────────────────────────────
export const Demo: React.FC = () => {
	const frame = useCurrentFrame();
	const {fps, width, height} = useVideoConfig();

	// --- Phase opacities ---
	const introOp = interpolate(frame, T.INTRO_OUT, [1, 0], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
	});
	const featOp = interpolate(frame, [...T.FEAT_IN, ...T.FEAT_OUT], [0, 1, 1, 0], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
	});
	const outroOp = interpolate(frame, T.OUTRO_IN, [0, 1], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
	});

	// --- Background gradient shift during features ---
	const bgIntensity = interpolate(frame, [...T.FEAT_IN, ...T.FEAT_OUT], [0, 1, 1, 0], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
	});

	// --- Intro: animated title ---
	const TITLE = 'DANYLTN';

	// --- Intro: subtitle ---
	const subOpacity = interpolate(frame, [T.SUBTITLE_START, T.SUBTITLE_END], [0, 1], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
	});
	const subBlur = interpolate(frame, [T.SUBTITLE_START, T.SUBTITLE_END], [14, 0], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
	});

	// --- Intro: central burst when particles arrive ---
	const burstOp = interpolate(frame, [100, 110, 132], [0, 0.7, 0], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
	});
	const burstSc = interpolate(frame, [100, 110, 132], [0.3, 1.6, 0.1], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
	});

	// --- Feature cards layout ---
	const CARD_W = 460;
	const GAP = 56;
	const totalW = 3 * CARD_W + 2 * GAP;
	const marginL = (width - totalW) / 2; // (1920-1488)/2 = 216
	const CARD_TOP = 318;
	const LINE_Y = 490; // ≈ card visual center

	const cx1 = marginL + CARD_W / 2;          // 216+230 = 446
	const cx2 = marginL + CARD_W + GAP + CARD_W / 2; // 446+516 = 962
	const cx3 = cx2 + CARD_W + GAP;             // 962+516 = 1478

	const lineLen = cx2 - cx1; // ≈ 516

	const line1P = interpolate(frame, T.LINE_1, [0, 1], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
	});
	const line2P = interpolate(frame, T.LINE_2, [0, 1], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
	});
	const dotOp = interpolate(frame, T.DOT_IN, [0, 1], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
	});

	// --- Icon animation progress ---
	const iconP = (startF: number) =>
		interpolate(frame - startF, [0, 20], [0, 1], {
			extrapolateLeft: 'clamp',
			extrapolateRight: 'clamp',
		});
	const sparkRot = interpolate(frame - T.CARD_3, [0, 660], [0, 22], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
	});

	// --- Outro: logo spring + pulse ---
	const logoSc = spring({
		frame: Math.max(0, frame - T.LOGO_START),
		fps,
		from: 0,
		to: 1,
		config: {damping: 20, stiffness: 80},
	});
	const pulseSc = interpolate(
		Math.sin(((frame - T.PULSE_START) / fps) * Math.PI * 2.8),
		[-1, 1],
		[0.96, 1.06],
	);
	const outroSc = frame >= T.PULSE_START ? logoSc * pulseSc : logoSc;

	// --- Fade to black ---
	const fadeBlack = interpolate(frame, T.FADE_BLACK, [0, 1], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
	});

	// Feature section header spring
	const headerY = spring({
		frame: Math.max(0, frame - T.FEAT_IN[0]),
		fps,
		from: 30,
		to: 0,
		config: {damping: 20, stiffness: 80},
	});
	const headerOp = interpolate(frame, T.FEAT_IN, [0, 1], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
	});

	return (
		<AbsoluteFill
			style={{
				background: '#0a0a0a',
				overflow: 'hidden',
				fontFamily: FONT,
			}}
		>
			{/* ── Dynamic background radial during features ── */}
			<div
				style={{
					position: 'absolute',
					inset: 0,
					background: `radial-gradient(ellipse 1400px 700px at 50% 52%,
						rgba(99,102,241,${bgIntensity * 0.055}) 0%,
						rgba(168,85,247,${bgIntensity * 0.03}) 40%,
						transparent 70%)`,
					pointerEvents: 'none',
				}}
			/>

			{/* ══════════════ INTRO ══════════════ */}
			<div style={{position: 'absolute', inset: 0, opacity: introOp}}>
				{/* Particles */}
				{Array.from({length: PARTICLE_COUNT}, (_, i) => (
					<Particle
						key={i}
						frame={frame}
						index={i}
						total={PARTICLE_COUNT}
						centerX={width / 2}
						centerY={height / 2}
					/>
				))}

				{/* Central burst flash */}
				<div
					style={{
						position: 'absolute',
						left: width / 2 - 120,
						top: height / 2 - 120,
						width: 240,
						height: 240,
						borderRadius: '50%',
						background:
							'radial-gradient(circle, rgba(168,85,247,0.7) 0%, rgba(99,102,241,0.35) 45%, transparent 70%)',
						transform: `scale(${burstSc})`,
						opacity: burstOp,
						filter: 'blur(10px)',
						pointerEvents: 'none',
					}}
				/>

				{/* Title + subtitle block */}
				<div
					style={{
						position: 'absolute',
						top: '50%',
						left: '50%',
						transform: 'translate(-50%, -46%)',
						display: 'flex',
						flexDirection: 'column',
						alignItems: 'center',
						gap: 22,
					}}
				>
					{/* Letter-by-letter title */}
					<div style={{display: 'flex', gap: 2}}>
						{TITLE.split('').map((char, i) => {
							const delay = T.TITLE_START + i * 9;
							const rel = frame - delay;
							const sc = spring({
								frame: Math.max(0, rel),
								fps,
								from: 0,
								to: 1,
								config: {damping: 20, stiffness: 80},
							});
							const op = interpolate(rel, [0, 18], [0, 1], {
								extrapolateLeft: 'clamp',
								extrapolateRight: 'clamp',
							});
							const ty = interpolate(rel, [0, 28], [32, 0], {
								extrapolateLeft: 'clamp',
								extrapolateRight: 'clamp',
							});
							return (
								<span
									key={i}
									style={{
										display: 'inline-block',
										fontSize: 118,
										fontWeight: 800,
										letterSpacing: -3,
										lineHeight: 1,
										background:
											'linear-gradient(160deg, #ffffff 30%, rgba(180,170,255,0.75) 100%)',
										WebkitBackgroundClip: 'text',
										WebkitTextFillColor: 'transparent',
										backgroundClip: 'text',
										opacity: op,
										transform: `translateY(${ty}px) scale(${sc})`,
									}}
								>
									{char}
								</span>
							);
						})}
					</div>

					{/* Subtitle — blur to sharp */}
					<p
						style={{
							margin: 0,
							color: 'rgba(180,170,255,0.55)',
							fontSize: 21,
							fontWeight: 300,
							letterSpacing: 9,
							textTransform: 'uppercase',
							opacity: subOpacity,
							filter: `blur(${subBlur}px)`,
						}}
					>
						Créateur. Bâtisseur. Visionnaire.
					</p>
				</div>
			</div>

			{/* ══════════════ FEATURES ══════════════ */}
			<div style={{position: 'absolute', inset: 0, opacity: featOp}}>
				{/* Section header */}
				<div
					style={{
						position: 'absolute',
						top: 110,
						left: '50%',
						transform: `translateX(-50%) translateY(${headerY}px)`,
						textAlign: 'center',
						opacity: headerOp,
					}}
				>
					<p
						style={{
							margin: '0 0 14px',
							color: '#818cf8',
							fontSize: 12,
							fontWeight: 600,
							letterSpacing: 5,
							textTransform: 'uppercase',
						}}
					>
						À propos
					</p>
					<h2
						style={{
							margin: 0,
							color: '#f0f0f8',
							fontSize: 50,
							fontWeight: 700,
							letterSpacing: -1.5,
						}}
					>
						Ce que j'apporte
					</h2>
				</div>

				{/* Card 1 */}
				<div style={{position: 'absolute', left: marginL, top: CARD_TOP}}>
					<FeatureCard
						frame={frame}
						fps={fps}
						enterFrame={T.CARD_1}
						title="Vision"
						description="Je ne suis pas les tendances — je les crée. Chaque projet commence par une idée claire et se termine par un impact réel."
						accentColor="#6366f1"
						icon={
							<AnimatedIcon frame={frame} fps={fps} startFrame={T.CARD_1 + 12}>
								<IconBolt progress={iconP(T.CARD_1 + 12)} />
							</AnimatedIcon>
						}
					/>
				</div>

				{/* Card 2 */}
				<div style={{position: 'absolute', left: marginL + CARD_W + GAP, top: CARD_TOP}}>
					<FeatureCard
						frame={frame}
						fps={fps}
						enterFrame={T.CARD_2}
						title="Exécution"
						description="Les idées ne valent rien sans action. Je vais vite, j'itère sans relâche et je tiens toujours mes engagements."
						accentColor="#8b5cf6"
						icon={
							<AnimatedIcon frame={frame} fps={fps} startFrame={T.CARD_2 + 12}>
								<IconNetwork progress={iconP(T.CARD_2 + 12)} />
							</AnimatedIcon>
						}
					/>
				</div>

				{/* Card 3 */}
				<div style={{position: 'absolute', left: marginL + 2 * (CARD_W + GAP), top: CARD_TOP}}>
					<FeatureCard
						frame={frame}
						fps={fps}
						enterFrame={T.CARD_3}
						title="Impact"
						description="Le meilleur travail laisse une trace. Je construis des choses qui comptent — des projets mémorables, des expériences durables."
						accentColor="#a855f7"
						icon={
							<AnimatedIcon frame={frame} fps={fps} startFrame={T.CARD_3 + 12}>
								<IconSparkle progress={iconP(T.CARD_3 + 12)} rotation={sparkRot} />
							</AnimatedIcon>
						}
					/>
				</div>

				{/* ── SVG connection lines ── */}
				<svg
					style={{position: 'absolute', inset: 0, pointerEvents: 'none'}}
					width={width}
					height={height}
				>
					<defs>
						<linearGradient id="lineGrad" x1="0%" y1="0%" x2="100%" y2="0%">
							<stop offset="0%" stopColor="#6366f1" stopOpacity="0.55" />
							<stop offset="50%" stopColor="#a855f7" stopOpacity="0.8" />
							<stop offset="100%" stopColor="#6366f1" stopOpacity="0.55" />
						</linearGradient>
					</defs>

					{/* Line card1 → card2 */}
					<line
						x1={cx1}
						y1={LINE_Y}
						x2={cx2}
						y2={LINE_Y}
						stroke="url(#lineGrad)"
						strokeWidth="1.5"
						strokeDasharray={lineLen}
						strokeDashoffset={lineLen * (1 - line1P)}
					/>
					{/* Line card2 → card3 */}
					<line
						x1={cx2}
						y1={LINE_Y}
						x2={cx3}
						y2={LINE_Y}
						stroke="url(#lineGrad)"
						strokeWidth="1.5"
						strokeDasharray={lineLen}
						strokeDashoffset={lineLen * (1 - line2P)}
					/>

					{/* Node dots */}
					{([cx1, cx2, cx3] as number[]).map((cx, i) => (
						<circle
							key={i}
							cx={cx}
							cy={LINE_Y}
							r={4.5}
							fill={['#6366f1', '#a855f7', '#6366f1'][i]}
							opacity={dotOp * (i === 1 ? 1 : 0.75)}
						/>
					))}

					{/* Glow rings on dots */}
					{([cx1, cx2, cx3] as number[]).map((cx, i) => (
						<circle
							key={`ring-${i}`}
							cx={cx}
							cy={LINE_Y}
							r={10}
							fill="none"
							stroke={['#6366f1', '#a855f7', '#6366f1'][i]}
							strokeWidth="1"
							opacity={dotOp * 0.25}
						/>
					))}
				</svg>
			</div>

			{/* ══════════════ OUTRO ══════════════ */}
			<div
				style={{
					position: 'absolute',
					inset: 0,
					opacity: outroOp,
					display: 'flex',
					flexDirection: 'column',
					alignItems: 'center',
					justifyContent: 'center',
					gap: 20,
				}}
			>
				<div
					style={{
						transform: `scale(${outroSc})`,
						display: 'flex',
						flexDirection: 'column',
						alignItems: 'center',
						gap: 26,
					}}
				>
					{/* Logo mark — 4-pointed sparkle */}
					<svg width="88" height="88" viewBox="0 0 80 80">
						<defs>
							<radialGradient id="outroGrad" cx="50%" cy="50%" r="50%">
								<stop offset="0%" stopColor="#c4b5fd" />
								<stop offset="55%" stopColor="#818cf8" />
								<stop offset="100%" stopColor="#6366f1" />
							</radialGradient>
							<filter id="glow">
								<feGaussianBlur stdDeviation="3" result="blur" />
								<feMerge>
									<feMergeNode in="blur" />
									<feMergeNode in="SourceGraphic" />
								</feMerge>
							</filter>
						</defs>
						<path
							d="M40 4 C50 28 52 30 76 40 C52 50 50 52 40 76 C30 52 28 50 4 40 C28 30 30 28 40 4 Z"
							fill="url(#outroGrad)"
							filter="url(#glow)"
						/>
					</svg>

					{/* Brand name */}
					<div
						style={{
							fontSize: 78,
							fontWeight: 800,
							letterSpacing: -2.5,
							background:
								'linear-gradient(135deg, #ffffff 20%, rgba(168,85,247,0.75) 100%)',
							WebkitBackgroundClip: 'text',
							WebkitTextFillColor: 'transparent',
							backgroundClip: 'text',
							lineHeight: 1,
						}}
					>
						DANYLTN
					</div>

					{/* Tagline */}
					<p
						style={{
							margin: 0,
							color: 'rgba(180,170,255,0.38)',
							fontSize: 15,
							fontWeight: 400,
							letterSpacing: 4.5,
							textTransform: 'uppercase',
						}}
					>
						Construisons quelque chose de grand.
					</p>
				</div>
			</div>

			{/* ── Fade to black ── */}
			<div
				style={{
					position: 'absolute',
					inset: 0,
					backgroundColor: '#000000',
					opacity: fadeBlack,
					pointerEvents: 'none',
				}}
			/>
		</AbsoluteFill>
	);
};
