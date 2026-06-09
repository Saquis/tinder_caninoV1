// AnimatedDog — Perro SVG animado que camina y mueve la cola
// Capa: entry-points/mobile/components

import React, { useEffect, useRef } from 'react';
import { Animated, Easing } from 'react-native';
import Svg, {
  G, Ellipse, Circle, Path, Rect, Line
} from 'react-native-svg';

const AnimatedG = Animated.createAnimatedComponent(G);

export default function AnimatedDog({ size = 100 }) {
  const walkAnim = useRef(new Animated.Value(0)).current;
  const tailAnim = useRef(new Animated.Value(0)).current;
  const earAnim = useRef(new Animated.Value(0)).current;
  const bounceAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Perro camina desde afuera
    Animated.timing(walkAnim, {
      toValue: 1,
      duration: 1200,
      easing: Easing.out(Easing.back(1.5)),
      useNativeDriver: true,
    }).start();

    // Cola meneo continuo
    Animated.loop(
      Animated.sequence([
        Animated.timing(tailAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(tailAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Oreja tiembla ocasional
    let active = true;
    const earLoop = () => {
      if (!active) return;
      Animated.sequence([
        Animated.delay(2000 + Math.random() * 3000),
        Animated.timing(earAnim, {
          toValue: 1,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(earAnim, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start(earLoop);
    };
    earLoop();

    // Bounce respiro
    Animated.loop(
      Animated.sequence([
        Animated.timing(bounceAnim, {
          toValue: 1,
          duration: 2000,
          easing: Easing.sin,
          useNativeDriver: true,
        }),
        Animated.timing(bounceAnim, {
          toValue: 0,
          duration: 2000,
          easing: Easing.sin,
          useNativeDriver: true,
        }),
      ])
    ).start();

    return () => { active = false; };
  }, []);

  const translateX = walkAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-150, 0],
  });
  const bounceY = bounceAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -3],
  });
  // Walk-in wobble via parent rotate
  const wobble = walkAnim.interpolate({
    inputRange: [0, 0.3, 0.5, 0.7, 1],
    outputRange: ['-5deg', '3deg', '-2deg', '1deg', '0deg'],
  });
  // SVG rotation strings for tail/ear
  const tailDeg = tailAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['-25deg', '25deg'],
  });
  const earDeg = earAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '-10deg'],
  });

  return (
    <Animated.View style={{
      transform: [
        { translateX },
        { rotate: wobble },
        { translateY: bounceY },
      ],
    }}>
      <Svg width={size} height={size} viewBox="0 0 100 100" fill="none">
        {/* Cuerpo */}
        <Ellipse cx="50" cy="72" rx="26" ry="20" fill="#D4956A" />
        {/* Cola animada */}
        <AnimatedG transform={[{ rotate: tailDeg }]} originX={76} originY={58}>
          <Path d="M76 68 Q92 55 88 44 Q84 36 78 42 Q82 50 76 60Z" fill="#C4622D" />
        </AnimatedG>
        {/* Cabeza */}
        <Ellipse cx="50" cy="48" rx="28" ry="26" fill="#E8AA7A" />
        {/* Oreja izquierda animada */}
        <AnimatedG transform={[{ rotate: earDeg }]} originX={28} originY={35}>
          <Ellipse cx="28" cy="32" rx="11" ry="14" fill="#C4622D" />
        </AnimatedG>
        {/* Oreja derecha */}
        <Ellipse cx="72" cy="32" rx="11" ry="14" fill="#C4622D" />
        {/* Ojos */}
        <Circle cx="40" cy="44" r="5" fill="#3D2B1A" />
        <Circle cx="60" cy="44" r="5" fill="#3D2B1A" />
        <Circle cx="41.5" cy="42.5" r="2" fill="white" />
        <Circle cx="61.5" cy="42.5" r="2" fill="white" />
        {/* Nariz */}
        <Ellipse cx="50" cy="55" rx="6" ry="4" fill="#3D2B1A" />
        <Ellipse cx="50" cy="54" rx="3" ry="1.5" fill="#5A3D2B" />
        {/* Boca */}
        <Path d="M44 59 Q50 65 56 59" stroke="#3D2B1A" strokeWidth="1.8" fill="none" strokeLinecap="round" />
        {/* Lengua */}
        <Ellipse cx="50" cy="63" rx="5" ry="4" fill="#E8627A" />
        <Line x1="50" y1="63" x2="50" y2="67" stroke="#C84060" strokeWidth="1" strokeLinecap="round" />
        {/* Mejillas */}
        <Ellipse cx="34" cy="53" rx="7" ry="4" fill="#E89090" opacity="0.4" />
        <Ellipse cx="66" cy="53" rx="7" ry="4" fill="#E89090" opacity="0.4" />
        {/* Collar */}
        <Rect x="34" y="68" width="32" height="7" rx="3.5" fill="#C4622D" />
        <Circle cx="50" cy="71.5" r="3" fill="#F5C842" />
      </Svg>
    </Animated.View>
  );
}
