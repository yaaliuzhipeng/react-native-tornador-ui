import React, { MutableRefObject, useEffect, useMemo, useRef } from 'react';
import { StyleSheet, View, FlatListProps, ScrollViewProps, ViewStyle } from 'react-native';
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler'
import Animated, { useAnimatedStyle, useSharedValue, withTiming, runOnJS, useAnimatedScrollHandler, cancelAnimation, withSpring } from 'react-native-reanimated';
function nothing() { return; }
type ScrollableComponent = React.ReactElement<Animated.AnimateProps<FlatListProps<unknown>>, any> | React.ReactElement<Animated.AnimateProps<ScrollViewProps>, any>;
type VRef = MutableRefObject<{
    close: () => void;
    show: () => void;
}>;
const DraggableListBox = (props: {
    renderScrollable: (props: any) => ScrollableComponent;
    enableShowOnMounted?: boolean;
    vref?: VRef;
    HeaderComponent?: any;
    FooterComponent?: any;
    boxHeight: number;
    containerStyles?: ViewStyle[];
    boxStyles?: ViewStyle[];
    boxContainerStyles?: ViewStyle[];
    onClosed?: () => void;
    configs?: {
        collapseThreshold?: number;
        collapseDuration?: number;
        backDuration?: number;
    }
}) => {

    const { HeaderComponent, FooterComponent, renderScrollable, boxHeight = 0, containerStyles = [], boxStyles = [], boxContainerStyles = [], onClosed = nothing, configs = {}, enableShowOnMounted = false } = props;

    const collapseThreshold = boxHeight * 0.5;
    const collapseDuration = configs?.collapseDuration ?? 150;
    const backDuration = configs?.backDuration ?? 120;

    const panGestureRef = useRef();
    const listGestureRef = useRef();

    const transY = useSharedValue(boxHeight);
    const scrollOffset = useSharedValue(0);
    const panOffset = useSharedValue(0);

    const animatedStyle = useAnimatedStyle(() => {
        let dy = panOffset.value - scrollOffset.value;
        dy = Math.max(0, dy);
        return {
            transform: [
                { translateY: transY.value },
                { translateY: dy }
            ]
        }
    })
    const runAnimation = (close: boolean) => {
        'worklet';
        panOffset.value = withTiming(close ? boxHeight : 0, { duration: close ? collapseDuration : backDuration }, (finished) => {
            //time to hide
            if (close) runOnJS(onClosed)();
        })
    }
    const close = () => {
        panOffset.value = withTiming(boxHeight, { duration: collapseDuration }, (finished) => {
            //time to hide
            runOnJS(onClosed)();
        })
    }
    const show = () => {
        transY.value = withSpring(0, { mass: 0.5, damping: 16, stiffness: 180 })
    }
    useEffect(() => {
        if (props.vref) {
            props.vref.current = { show, close }
        }
    }, [])
    useEffect(() => {
        requestAnimationFrame(() => {
            if (enableShowOnMounted) {
                show();
            }
        })
    }, [])
    const scrollHandler = useAnimatedScrollHandler({
        onScroll: (event) => {
            scrollOffset.value = event.contentOffset.y;
        }
    })
    const touchStartXY = useSharedValue({ x: 0, y: 0 })
    const listGesture = Gesture.Native()
        .simultaneousWithExternalGesture(panGestureRef)
        .withRef(listGestureRef);
    const panGesture = Gesture.Pan()
        .manualActivation(true)
        .minPointers(1)
        .onTouchesDown(event => {
            cancelAnimation(transY)
            touchStartXY.value = { x: event.allTouches[0].x, y: event.allTouches[0].y }
        })
        .onTouchesMove((event, stateManager) => {
            let dx = event.allTouches[0].x - touchStartXY.value.x;
            let dy = event.allTouches[0].y - touchStartXY.value.y;
            if (Math.abs(dy) > 3 && Math.abs(dx) < 3 && scrollOffset.value < 1 && dy > 0) {
                stateManager.activate();
            }
        })
        .onUpdate(event => {
            panOffset.value = event.translationY;
        })
        .onEnd(event => {
            let v = Math.max(0, event.translationY - scrollOffset.value);
            if (v > collapseThreshold) {
                //collapse the sheet
                runAnimation(true);
            } else {
                runAnimation((event.velocityY > boxHeight && scrollOffset.value < 1));
            }
        })
        .simultaneousWithExternalGesture(listGestureRef)
        .withRef(panGestureRef)

    const scrollableProps = useMemo(() => ({
        onScroll: scrollHandler,
        bounces: false,
    }), [])

    return (
        <GestureHandlerRootView style={[styles.container, ...containerStyles]}>
            <GestureDetector gesture={panGesture}>
                <Animated.View style={[{ height: boxHeight }, styles.box, ...boxStyles, animatedStyle]}>
                    {HeaderComponent && React.cloneElement(HeaderComponent, { close })}
                    <View style={[{ flex: 1 }, ...boxContainerStyles]}>
                        <GestureDetector gesture={listGesture}>
                            {renderScrollable(scrollableProps)}
                        </GestureDetector>
                    </View>
                    {FooterComponent && React.cloneElement(FooterComponent, { close })}
                </Animated.View>
            </GestureDetector>
        </GestureHandlerRootView>
    )
}

export default DraggableListBox;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'flex-end'
    },
    box: {
        backgroundColor: '#FFF',
        borderTopLeftRadius: 12,
        borderTopRightRadius: 12
    }
})