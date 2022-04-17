import React, { MutableRefObject, useEffect, useRef } from 'react';
import { View, Pressable, StyleSheet, ViewStyle, DeviceEventEmitter } from 'react-native';
import Animated, { interpolate, useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { PanGestureHandler, PanGestureHandlerEventPayload, GestureEvent, HandlerStateChangeEvent, State } from 'react-native-gesture-handler';

const UUID = () => Date.now().toString();

export function makeSwipeableItem(WrapperedComponent, config: { key: string, width: number }) {
    return function (props) {
        const { width, key } = config;
        const { offsetX, stopEdge, onPress, containerStyles = [] } = props;

        const boxAnimatedStyle = useAnimatedStyle(() => ({
            transform: [{
                translateX: interpolate(
                    offsetX.value,
                    [-Number.MAX_SAFE_INTEGER, stopEdge, 0, Number.MAX_SAFE_INTEGER],
                    [0, 0, width, width]
                )
            }]
        }))
        const _onPress = () => {
            onPress(key)
        }
        return (
            <Animated.View style={[boxAnimatedStyle, { height: '100%', width }, ...containerStyles]}>
                <Pressable onPress={_onPress} style={{ flex: 1 }}>
                    <WrapperedComponent />
                </Pressable>
            </Animated.View>
        )
    }
}

const Swipeable = React.memo((props: {
    controller?: MutableRefObject<any>;
    RightUnderneathWidth: number;
    RightUnderneathComponents: any[];
    onUnderneathComponentPressed?: (key: string) => void;
    children?: any;
    containerStyles?: ViewStyle[];
}) => {
    const { children, containerStyles = [], RightUnderneathComponents = [], onUnderneathComponentPressed, RightUnderneathWidth } = props;
    const controller = props.controller ?? useRef();
    const uuid = useRef(UUID()).current;
    const offsetX = useSharedValue(0);
    const savedOffsetX = useSharedValue(0);
    const animatedStyle = useAnimatedStyle(() => {
        return {
            transform: [
                { translateX: offsetX.value }
            ]
        }
    }, [])
    const isOpened = useSharedValue(false);

    const runAnimation = (close?: boolean) => {
        offsetX.value = withSpring(close ? 0 : -RightUnderneathWidth, { mass: 0.5, damping: 20, stiffness: 200 })
        savedOffsetX.value = close ? 0 : -RightUnderneathWidth;
        isOpened.value = close ? false : true;
    }
    const close = () => {
        runAnimation(true);
    }
    const requestOtherSwipeableToClose = () => {
        DeviceEventEmitter.emit('SWIPEABLE_CLOSE_OTHERS', uuid)
    }
    useEffect(() => {
        controller.current = {
            close
        }
        const sub = DeviceEventEmitter.addListener('SWIPEABLE_CLOSE_OTHERS', (data) => {
            requestAnimationFrame(() => {
                if (isOpened.value && uuid != data) {
                    close();
                }
            })
        })
        return () => {
            sub.remove();
        }
    }, [])

    const onGestureEvent = (event: GestureEvent<PanGestureHandlerEventPayload>) => {
        let tx = interpolate(
            event.nativeEvent.translationX + savedOffsetX.value,
            [-Number.MAX_SAFE_INTEGER, -(RightUnderneathWidth + 200), -RightUnderneathWidth, 0, 100, Number.MAX_SAFE_INTEGER],
            [-(RightUnderneathWidth + 20), -(RightUnderneathWidth + 20), -RightUnderneathWidth, 0, 20, 20]);
        offsetX.value = tx;
    }
    const onHandlerStateChange = (event: HandlerStateChangeEvent<PanGestureHandlerEventPayload>) => {
        let { state, velocityX, translationX } = event.nativeEvent;
        if (state == State.ACTIVE) {
            requestOtherSwipeableToClose()
        } else if (state == State.END) {
            if (velocityX < -RightUnderneathWidth || translationX < -RightUnderneathWidth * 0.5) {
                runAnimation(false);
            } else {
                runAnimation(true)
            }
        }
    }

    return (
        <PanGestureHandler activeOffsetX={[-5, 5]} onHandlerStateChange={onHandlerStateChange} onGestureEvent={onGestureEvent}>
            <View style={[{ width: '100%', overflow: 'hidden' }, ...containerStyles]}>
                <Animated.View style={[animatedStyle]}>
                    {children}
                </Animated.View>
                <View style={[StyleSheet.absoluteFillObject, styles.right]}>
                    {RightUnderneathComponents.map((Child, index) => {
                        const onPressItem = (key: string) => {
                            if (onUnderneathComponentPressed) onUnderneathComponentPressed(key);
                        }
                        return <Child
                            key={index.toString()}
                            offsetX={offsetX}
                            stopEdge={-RightUnderneathWidth}
                            onPress={onPressItem}
                        />
                    })}
                </View>
                <View style={[StyleSheet.absoluteFillObject, styles.left]}>
                </View>
            </View>
        </PanGestureHandler>
    )
});

export default Swipeable;

const styles = StyleSheet.create({
    right: {
        zIndex: -1,
        flexDirection: 'row',
        justifyContent: 'flex-end'
    },
    left: {
        zIndex: -2,
        flexDirection: 'row',
        justifyContent: 'flex-start'
    }
})