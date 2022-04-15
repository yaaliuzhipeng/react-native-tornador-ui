import React, { MutableRefObject, useEffect, useMemo, useRef, useState } from 'react';
import { Platform, StyleSheet, useWindowDimensions, View } from 'react-native';
import Animated, { cancelAnimation, SharedValue, useAnimatedReaction, useAnimatedStyle, useSharedValue, withSpring, runOnJS, useEvent } from 'react-native-reanimated';
import { Gesture, GestureDetector, GestureUpdateEvent, PanGestureHandlerEventPayload, GestureStateChangeEvent } from 'react-native-gesture-handler';

const SpringConfig = { mass: 0.5, damping: 12 };
const PageSwiper = React.memo((props: {
    gestureRef?: any;
    simultaneousGestures?: any[];

    onPageChanged?: (page: number) => void;
    onPageWillChange?: (currentPage: number, targetPage: number) => void;
    onMoveOverflow?: (event: GestureUpdateEvent<PanGestureHandlerEventPayload>, side: 'left' | 'right') => void;
    onMoveEnd?: (event: GestureStateChangeEvent<PanGestureHandlerEventPayload>) => void;
    offset?: SharedValue<number>;
    itemSize?: { width: number; height: number };
    children?: any[];
    initialIndex?: number;
}) => {

    const { onPageChanged, onPageWillChange, onMoveOverflow, onMoveEnd } = props;
    const gestureRef = props.gestureRef ?? useRef();
    const offset = props.offset ?? useSharedValue(0);
    const simultaneousGestures = props.simultaneousGestures ?? []
    const children = props.children ?? [];
    const initialIndex = useMemo(() => {
        let i = Math.max(0, (props.initialIndex ?? 0));
        return Math.min(i, (children.length - 1));
    }, []);
    const dimens = useWindowDimensions();
    const itemContainerWidth = useMemo(() => Number.parseFloat(dimens.width.toFixed(3)), [dimens.width])

    // const [itemLayout, setItemLayout] = useState(props.itemSize ?? { width: 0, height: 0 });
    const itemSize = useSharedValue(props.itemSize ?? { width: 0, height: 0 })
    const childrenCount = useSharedValue(children.length);

    const transX = useSharedValue(-(props.itemSize?.width ?? 0) * initialIndex);
    const savedX = useSharedValue(-(props.itemSize?.width ?? 0) * initialIndex);
    const targetX = useSharedValue(-(props.itemSize?.width ?? 0) * initialIndex);

    const animatedStyle = useAnimatedStyle(() => ({ transform: [{ translateX: transX.value }] }))

    useAnimatedReaction(
        () => -transX.value,
        (v) => { offset.value = v / itemSize.value.width; },
        [])

    useEffect(() => {
        childrenCount.value = children.length;
    }, [children])

    const runMoveAnimation = (ltr: boolean, back?: boolean) => {
        'worklet';
        // ltr is true : 👉🏻 , edge is 0 
        // or the edge is itemSize.value.width * (length - 1)
        // back is true : animate back to the pre target position
        let w = itemSize.value.width;
        let t = targetX.value;
        if (!back) {
            if (ltr) {
                t = Math.min(targetX.value + w, 0);
            } else {
                t = Math.max(targetX.value - w, -w * (childrenCount.value - 1));
            }
            targetX.value = t;
        }// else back : t is targetX.value
        transX.value = withSpring(t, SpringConfig, (finished) => {
            savedX.value = transX.value;
            if (finished && onPageChanged) {
                runOnJS(onPageChanged)(Math.abs(Math.round(transX.value / itemSize.value.width)));
            }
        });
    }
    const touchStartXY = useSharedValue({ x: 0, y: 0 })
    const isPanGranted = useSharedValue(false);
    const panGesture = Gesture.Pan()
        .averageTouches(true)
        .manualActivation(true)
        .maxPointers(1)
        .onTouchesDown((event, stateManager) => {
            touchStartXY.value = { x: event.allTouches[0].x, y: event.allTouches[0].y }
        })
        .onTouchesMove((event, stateManager) => {
            if (isPanGranted.value === false) {
                let diffx = event.allTouches[0].x - touchStartXY.value.x;
                let diffy = event.allTouches[0].y - touchStartXY.value.y;
                if (Math.abs(diffx) > 2 && Math.abs(diffy) < 3) {
                    isPanGranted.value = true;
                    stateManager.activate();
                }
            }
        })
        .onTouchesUp((event, stateManager) => {
            isPanGranted.value = false;
        })
        .onTouchesCancelled((event, stateManager) => {
            isPanGranted.value = false;
        })
        .onBegin(event => {
            cancelAnimation(transX);
        })
        .onStart(event => {
            // console.log('page swiper pan start');
        })
        .onUpdate(event => {
            let tx = savedX.value + event.translationX;
            if (tx > 0) {
                //reached the edge of the left side
                onMoveOverflow && runOnJS(onMoveOverflow)(event, 'left');
                tx = 0;
            } else if (tx < -itemSize.value.width * (childrenCount.value - 1)) {
                //reached the edge of the right side
                onMoveOverflow && runOnJS(onMoveOverflow)(event, 'right');
                tx = -itemSize.value.width * (childrenCount.value - 1);
            }
            transX.value = tx;
        })
        .onEnd((event, success) => {
            let { velocityX, translationX } = event;
            onMoveEnd && runOnJS(onMoveEnd)(event);
            if (success) {
                if (translationX >= 0) {
                    //current gesture is moving from left to right 👉🏻
                    if (velocityX >= 0) {
                        if (velocityX > itemSize.value.width) {
                            //fast swipe , move to next item
                            runMoveAnimation(true)
                        } else {
                            //slow swipe, move to next item if crossed the center point
                            runMoveAnimation(true, !(Math.abs(transX.value - savedX.value) > itemSize.value.width * 0.5))
                        }
                    } else { // velocityX < 0
                        //on the end ,swipe back to right👉🏻
                        if (velocityX < -itemSize.value.width) {
                            runMoveAnimation(true, true)
                        } else {
                            //slow swipe, move to next item if crossed the center point
                            runMoveAnimation(true, !(Math.abs(transX.value - savedX.value) > itemSize.value.width * 0.5))
                        }
                    }
                } else {
                    //current gesture is moving from right to left 👈🏻
                    if (velocityX <= 0) {
                        if (velocityX < -itemSize.value.width) {
                            //fast swipe , move to next item
                            runMoveAnimation(false)
                        } else {
                            //slow swipe , move to next item if crossed the center point
                            runMoveAnimation(false, !(Math.abs(transX.value - savedX.value) > itemSize.value.width * 0.5))
                        }
                    } else {
                        //on the end ,swipe back to right👉🏻
                        if (velocityX > itemSize.value.width) {
                            //reset
                            runMoveAnimation(false, true)
                        } else {
                            //slow swipe , depends on position
                            runMoveAnimation(false, !(Math.abs(transX.value - savedX.value) > itemSize.value.width * 0.5))
                        }
                    }
                }
            }
        })
        .onFinalize((event, success) => {
            if (!success) {
                /**
                * pan gesture failed when finger just touched down , no moving action
                */
                let ind = 1;
                while (true) {
                    if (savedX.value > -itemSize.value.width * ind) break;
                    ind += 1;
                }
                let start = (ind - 1) * -itemSize.value.width;
                let end = ind * -itemSize.value.width;
                if (savedX.value < (start + end) / 2) {
                    //align to end
                    if (onPageWillChange) {
                        runOnJS(onPageWillChange)(Math.abs(targetX.value / itemSize.value.width), Math.abs(end / itemSize.value.width));
                    }
                    transX.value = withSpring(end, SpringConfig, (finished) => {
                        savedX.value = transX.value;
                        if (onPageChanged) {
                            runOnJS(onPageChanged)(end / itemSize.value.width)
                        }
                    });
                    targetX.value = end;
                } else {
                    //align to start
                    if (onPageWillChange) {
                        runOnJS(onPageWillChange)(Math.abs(targetX.value / itemSize.value.width), Math.abs(start / itemSize.value.width));
                    }
                    transX.value = withSpring(start, SpringConfig, (finished) => {
                        savedX.value = transX.value;
                        if (onPageChanged) {
                            runOnJS(onPageChanged)(end / itemSize.value.width)
                        }
                    });
                    targetX.value = start;
                }
            }
        })
        .simultaneousWithExternalGesture(...simultaneousGestures)
        .withRef(gestureRef)

    /**
     * 测量得到的布局高度是ITEM的高度、宽度为所有ITEM宽度之和。
     * 这里主要负责测量更新 itemSize 的值。
     */
    const onItemContainerLayout = React.useCallback(e => {
        let { width, height } = e.nativeEvent.layout;
        if (children.length === 0) return;
        let itemWidth = Number.parseFloat((width / children.length).toFixed(3))
        let propItemWidth = Number.parseFloat((props.itemSize?.width ?? 0).toFixed(3))
        let itemHeight = Number.parseFloat(height.toFixed(3))
        let propItemHeight = Number.parseFloat((props.itemSize?.height ?? 0).toFixed(3))

        let diffW = itemWidth - propItemWidth;
        let diffH = itemHeight - propItemHeight;
        /**
         * 使用diff来判断传入itemSize 与测量得到的size 是因为Android上拿到的windowDimensions
         * 可能为浮点数, 例如: 392.72727272727275
         */
        if (diffW > 1 && diffH > 1) {
            // setItemLayout({width: itemWidth,height: itemHeight});
            itemSize.value = { width: itemWidth, height: itemHeight }
            let tx = -itemWidth * initialIndex;
            transX.value = tx;
            savedX.value = tx;
            targetX.value = tx;
        }
    }, [])

    return (
        <GestureDetector gesture={panGesture}>
            <Animated.View onLayout={onItemContainerLayout} style={[styles.container, animatedStyle]}>
                {children.map((item, index) => {
                    return (
                        <View key={item?.key ?? index} style={{ width: itemContainerWidth, height: '100%' }}>{item}</View>
                    )
                })}
            </Animated.View>
        </GestureDetector>
    )
});
export default PageSwiper;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: 'row'
    }
})