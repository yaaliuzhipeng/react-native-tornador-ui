import React, { useEffect, useMemo } from "react";
import { View, StyleSheet, TextStyle, Pressable } from "react-native";
import { BaseContainerInjectedProps } from "./BaseContainer";
import Animated, { interpolate, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

type DefActive = { default: string; active: string; };
export type TabBarDataItem = {
    key: string;
    label?: string;
    image?: { default: string; active: string };
}
export type BottomTabBarPlainContentProps = {
    data: Array<TabBarDataItem>;
    type: 'image' | 'label' | 'image-label';
    currentIndex: number;
    onPressItem: (index: number) => void;
    colors?: DefActive
}

type BottomTabBarPlainContentComposeProps = BottomTabBarPlainContentProps & BaseContainerInjectedProps;

const DEF_COLORS = { default: '#969697', active: '#000000' }

const AnimatedLabel = (props: {
    isActive: boolean;
    label: string;
    colors: DefActive;
    textStyle: TextStyle;
}) => {
    const { colors, isActive, label, textStyle } = props;

    const opacity = useSharedValue(isActive ? 1.0 : 0.0);
    const activeAnimatedStyle = useAnimatedStyle(() => ({
        opacity: opacity.value
    }))
    const defaultAnimatedStyle = useAnimatedStyle(() => ({
        opacity: interpolate(opacity.value, [0, 1], [1, 0])
    }))
    useEffect(() => {
        opacity.value = withTiming(isActive ? 1.0 : 0.0)
    }, [isActive])

    return (
        <View style={{}}>
            <Animated.Text style={[activeAnimatedStyle, { color: colors.active }, textStyle]}>
                {label}
            </Animated.Text>
            <Animated.Text style={[defaultAnimatedStyle, { color: colors.default }, textStyle, styles.abs_under]}>
                {label}
            </Animated.Text>
        </View>
    )
}
const AnimatedImage = (props: {
    isActive: boolean;
    height: number;
    sources: { default: any; active: any },
}) => {
    const { isActive, height, sources } = props;
    const isURISource = useMemo(() => (typeof sources.default == 'string'), [sources])
    const size = useMemo(() => ({ height: height * 0.8, width: height * 0.8 }), [height]);
    const opacity = useSharedValue(isActive ? 1.0 : 0.0);
    const activeAnimatedStyle = useAnimatedStyle(() => ({
        opacity: opacity.value
    }))
    const defaultAnimatedStyle = useAnimatedStyle(() => ({
        opacity: interpolate(opacity.value, [0, 1], [1, 0])
    }))
    useEffect(() => {
        opacity.value = withTiming(isActive ? 1.0 : 0.0)
    }, [isActive])

    return (
        <View style={{ height: height, width: size.width }}>
            <Animated.Image source={isURISource ? { uri: sources.active } : sources.active} style={[
                size,
                activeAnimatedStyle,
                styles.abs_under
            ]} resizeMode={'contain'} />
            <Animated.Image source={isURISource ? { uri: sources.default } : sources.default} style={[
                size,
                defaultAnimatedStyle,
                styles.abs_under
            ]} resizeMode={'contain'} />
        </View>
    )
}

const BottomTabBarPlainContent = (props: BottomTabBarPlainContentComposeProps) => {
    const {
        size,
        abs,
        height,
        insets,
        zIndex,
        data = [],
        type = 'image-label',
        currentIndex,
        onPressItem,
        colors = DEF_COLORS
    } = props;

    const labelStyle:TextStyle = useMemo(() => {
        if (type == 'image-label') return ({ fontSize: font(12) })
        if (type == 'label') return ({ fontSize: font(17), fontWeight: '500' })
        return {}
    }, [type])

    return (
        <View style={[size, abs, styles.row_vc, { zIndex, paddingBottom: insets.bottom }]}>
            {data.map((item, index) => {
                let isActive = index === currentIndex;
                return (
                    <Pressable key={item.key} onPress={() => {
                        onPressItem(index);
                    }} style={[{ flex: 1, alignItems: 'center' }]}>
                        {(type == 'image' || type == 'image-label') && (
                            <AnimatedImage
                                isActive={isActive}
                                height={height * 0.5}
                                sources={item.image}
                            />
                        )}
                        {(type == 'label' || type == 'image-label') && (
                            <AnimatedLabel
                                isActive={isActive}
                                colors={colors}
                                label={item.label ?? index.toString()}
                                textStyle={labelStyle}
                            />
                        )}
                    </Pressable>
                )
            })}
        </View>
    )
}
export default BottomTabBarPlainContent;

const styles = StyleSheet.create({
    row_vc: {
        flexDirection: 'row', alignItems: 'center'
    },
    c: {
        justifyContent: 'center',
        alignItems: 'center'
    },
    abs_under: {
        position: 'absolute',
        zIndex: -1
    }
})