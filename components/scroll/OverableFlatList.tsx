import React, { MutableRefObject, useMemo, useRef } from 'react';
import { FlatList, FlatListProps, NativeScrollEvent, Dimensions, Platform } from 'react-native';
import useRestProps from '../hooks/useRestProps'
import Animated, { SharedValue, interpolate, runOnJS, useAnimatedScrollHandler, useAnimatedStyle, useDerivedValue, useSharedValue, withSpring } from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler'
const AnimatedFlatList = Animated.createAnimatedComponent(FlatList);

const { width, height } = Dimensions.get('window');
const sh = Math.max(width, height);

type ItemT = any;

interface OverableFlatListProps extends Omit<FlatListProps<ItemT>,
    'onScroll' | 'onScrollEndDrag' | 'scrollEnabled' | 'bounces'> {
    scrollableRef?: MutableRefObject<any>;
    scrollableGestureRef?: MutableRefObject<any>;
    panGestureRef?: MutableRefObject<any>;
    panSimultaneousHandlers?: any[];
    scrollOffset?: SharedValue<number>;
    onScroll?: (event: NativeScrollEvent) => void;
    scrollOffsetUpdateEnabled?: boolean;
}

const OverableFlatListAndroid = (props: OverableFlatListProps) => {
    const { onScroll, onMomentumScrollEnd } = props;
    const scrollOffsetUpdateEnabled = useMemo(() => props.scrollOffsetUpdateEnabled ?? true, [props.scrollOffsetUpdateEnabled])
    const restProps = useRestProps(props, [
        'scrollableRef',
        'scrollableGestureRef',
        'panGestureRef',
        'panSimultaneousHandlers',

        'scrollOffset',
        'onScroll',
        'onMomentumScrollEnd',
        'scrollOffsetUpdateEnabled',
    ])
    const _onScroll = (event: any) => {
        if (onScroll) onScroll(event);
    }
    const scrollEnabled = useRef(true);
    const dragOffset = useSharedValue(0);
    const scrollOffset = useSharedValue(0);
    const totalScrollOffset = useDerivedValue(() => {
        let limitedDragOffset = interpolate(
            dragOffset.value,
            [-Number.MAX_SAFE_INTEGER, 0, sh, Number.MAX_SAFE_INTEGER],
            [-Number.MAX_SAFE_INTEGER, 0, sh * 0.36, sh * 0.38]
        )
        let offset = scrollOffset.value + Math.min(0, -limitedDragOffset);
        if (props.scrollOffset) props.scrollOffset.value = offset;
        return offset;
    })
    const scrollHandler = useAnimatedScrollHandler({
        onScroll: event => {
            if (scrollOffsetUpdateEnabled) {
                scrollOffset.value = event.contentOffset.y;
                runOnJS(_onScroll)(event);
            }
        }
    }, [scrollOffsetUpdateEnabled])

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ translateY: -Math.min(totalScrollOffset.value, 0) }]
    }))
    const panSimultaneousHandlers = props.panSimultaneousHandlers ?? [];
    const panGestureRef = props.panGestureRef ?? useRef();
    const scrollableGestureRef = props.scrollableGestureRef ?? useRef();
    const scrollableRef: MutableRefObject<FlatList | any> = props.scrollableRef ?? useRef();
    const toggleScrollEnabled = (enabled: boolean) => {
        if (enabled && !scrollEnabled.current) {
            scrollEnabled.current = true;
            scrollableRef.current?.setNativeProps && scrollableRef.current.setNativeProps({ scrollEnabled: true })
            console.log('解锁滚动');

        } else if (!enabled && scrollEnabled.current) {
            scrollEnabled.current = false;
            scrollableRef.current?.setNativeProps && scrollableRef.current.setNativeProps({ scrollEnabled: false })
            console.log('禁用滚动');

        }
    }
    const _onMomentumScrollEnd = (event) => {
        if (onMomentumScrollEnd) onMomentumScrollEnd(event);
        if (dragOffset.value > 0) {
            console.log('animate drag to 0');
            dragOffset.value = withSpring(0, { mass: 0.42 }, (finished) => {
                runOnJS(toggleScrollEnabled)(true);
            })
        }
    }

    const panGesture = Gesture.Pan()
        .onUpdate(event => {
            if (scrollOffset.value > 0) {
                runOnJS(toggleScrollEnabled)(true);
                return;
            } else {
                dragOffset.value = event.translationY
                if (event.translationY >= 0) {
                    runOnJS(toggleScrollEnabled)(false);
                } else {
                    runOnJS(toggleScrollEnabled)(true);
                }
            }
        })
        .onEnd((event, success) => {
            if (dragOffset.value > 0) {
                dragOffset.value = withSpring(0, { mass: 0.42 }, (finished) => {
                    runOnJS(toggleScrollEnabled)(true);
                })
            }
        })
        .simultaneousWithExternalGesture(scrollableGestureRef, ...panSimultaneousHandlers)
        .withRef(panGestureRef)

    const nativeGesture = Gesture.Native()
        .disallowInterruption(true)
        .withRef(scrollableGestureRef)
        .simultaneousWithExternalGesture(panGestureRef)

    return (
        <GestureDetector gesture={panGesture}>
            <Animated.View style={[{ flex: 1 }, animatedStyle]}>
                <GestureDetector gesture={nativeGesture}>
                    <AnimatedFlatList
                        ref={scrollableRef}
                        onScroll={scrollHandler}
                        overScrollMode={'never'}
                        onMomentumScrollEnd={_onMomentumScrollEnd}
                        {...restProps}
                    />
                </GestureDetector>
            </Animated.View>
        </GestureDetector>
    )
}

const OverableFlatListIOS = (props: OverableFlatListProps) => {
    const { onScroll } = props;
    const scrollOffsetUpdateEnabled = useMemo(() => props.scrollOffsetUpdateEnabled ?? true, [props.scrollOffsetUpdateEnabled])
    const restProps = useRestProps(props, [
        'viewRef',
        'scrollOffset',
        'onScroll',
        'scrollOffsetUpdateEnabled',
    ])
    const _onScroll = (event: any) => {
        if (onScroll) onScroll(event);
    }
    const scrollOffset = props.scrollOffset ?? useSharedValue(0);
    const scrollHandler = useAnimatedScrollHandler({
        onScroll: event => {
            if (scrollOffsetUpdateEnabled) {
                scrollOffset.value = event.contentOffset.y;
                runOnJS(_onScroll)(event);
            }
        }
    }, [scrollOffsetUpdateEnabled])
    const scrollViewRef: MutableRefObject<FlatList | any> = props.scrollableRef ?? useRef();

    return (
        <AnimatedFlatList
            ref={scrollViewRef}
            onScroll={scrollHandler}
            overScrollMode={'never'}
            {...restProps}
        />
    )
}

const OverableFlatList = (props: OverableFlatListProps) => {

    if (Platform.OS == 'ios') return <OverableFlatListIOS {...props} />
    return <OverableFlatListAndroid {...props} />
}

export default OverableFlatList;


