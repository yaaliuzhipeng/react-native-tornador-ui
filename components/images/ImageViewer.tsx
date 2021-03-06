import React, { MutableRefObject, useMemo, useRef, useState } from 'react';
import { View, FlatList, Image, StyleSheet, LayoutChangeEvent, NativeSyntheticEvent, NativeScrollEvent } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, cancelAnimation, SharedValue, withTiming, interpolate, withDecay, useDerivedValue, runOnJS } from 'react-native-reanimated';
import { GestureDetector, Gesture, NativeGesture } from 'react-native-gesture-handler'
import { GestureHandlerRootView } from 'react-native-gesture-handler'

const AnimatableImage = (props: {
    src: string;
    currentIndex: number;
    requestScrollEnable: (enabled: boolean) => void;
    nativeGesture: NativeGesture;
    containerSize: { width: number; height: number };
    containerLayout: MutableRefObject<{ width: number; height: number; x: number; y: number }>;
    backgroundOpacity: SharedValue<number>;
    onCloseCompleted: () => void;
    fromPosition?: { x: number; y: number; width: number; height: number };
    maxScale?: number;
}) => {

    const { containerSize, currentIndex, containerLayout, nativeGesture, requestScrollEnable, backgroundOpacity } = props;
    const fromPosition = props.fromPosition;
    const maxScale = props.maxScale ?? 6;

    const slideY = useSharedValue(0);
    const slideX = useSharedValue(0);
    const isSliding = useSharedValue(false);
    const slideScale = useSharedValue(1.0);

    const offsetx = useSharedValue(0);
    const offsety = useSharedValue(0);
    const savedOffset = useSharedValue({ x: 0, y: 0 });
    const scale = useSharedValue(1);
    const savedScale = useSharedValue(1);

    const focal = useSharedValue({ x: 0, y: 0 })
    const numberOfPointers = useSharedValue(0);

    const scaleOffsetX = useSharedValue(0);
    const scaleOffsetY = useSharedValue(0);

    const savedScaleOffset = useSharedValue({ x: 0, y: 0 });

    const ox = useDerivedValue(() => offsetx.value + scaleOffsetX.value + slideX.value, [scaleOffsetX, offsetx, slideX]);
    const oy = useDerivedValue(() => offsety.value + scaleOffsetY.value + slideY.value, [scaleOffsetY, offsety, slideY]);

    const isDecaying = useSharedValue(false);

    const isPanLocked = useSharedValue(true);
    const imgScale = useSharedValue(1.0);
    const imgSnSize = useSharedValue({ width: 0, height: 0 });

    const animatedStyles = useAnimatedStyle(() => {
        return {
            transform: [
                { translateX: ox.value },
                { translateY: oy.value },
                { scale: interpolate(scale.value, [0, 0.1, 0.5, maxScale, 100], [0.45, 0.45, 0.5, maxScale, maxScale]) },
                { scale: slideScale.value },
            ],
        };
    });

    const updateSavedOffset = (x: number | undefined, y: number | undefined) => {
        if (x != undefined && y != undefined) {
            savedOffset.value = { x, y }
        } else if (x != undefined) { // x != undefined , y == undefined
            let so = { ...savedOffset.value }
            so.x = x;
            savedOffset.value = so;
        } else if (y != undefined) { // x == undefined, y != undefined
            let so = { ...savedOffset.value }
            so.y = y;
            savedOffset.value = so;
        }
    }


    /**
     *  @dragGesture
     *  ??????????????????
     * 
     *  @Func handleTwoFingerReleased
     *      ??????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????
     *      ????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????
     *  @Func handleSlideEnd
     *      ??????????????????????????????????????????Y???????????????????????????????????????????????????????????????????????????
     */
    const handleTwoFingerReleased = (scale, xAxis, yAxis) => {
        numberOfPointers.value = 0;
        // ?????? x ???????????????, ???????????? 1.0 ?????????0, ?????????????????????
        if (scale <= 1.0) {
            offsetx.value = withTiming(0, { duration: 100 }, (isFinished) => {
                runOnJS(updateSavedOffset)(0, undefined)
            })
            scaleOffsetX.value = withTiming(0, { duration: 100 })
        } else {
            let ov = Math.abs(xAxis.ox) - Math.abs((scale - 1.0) * imgSnSize.value.width * 0.5);
            if (ov > 0) { //????????????, ?????????????????????????????????
                offsetx.value = withTiming((xAxis.offsetx + (xAxis.ox > 0 ? -1 : 1) * ov), { duration: 100 }, (isFinished) => {
                    runOnJS(updateSavedOffset)(offsetx.value, undefined)
                })
            }
        }
        // ?????? y ???????????????, ???????????? ????????????????????????0, ?????????????????????
        if (scale <= imgScale.value) {
            offsety.value = withTiming(0, { duration: 100 }, (isFinished) => {
                runOnJS(updateSavedOffset)(undefined, 0)
            })
            scaleOffsetY.value = withTiming(0, { duration: 100 })
        } else {
            let ovy = Math.abs(yAxis.oy) - Math.abs((scale - imgScale.value) * imgSnSize.value.height * 0.5);
            if (ovy > 0) {
                offsety.value = withTiming((yAxis.offsety + (yAxis.oy > 0 ? -1 : 1) * ovy), { duration: 100 }, (isFinished) => {
                    runOnJS(updateSavedOffset)(undefined, offsety.value)
                })
            }
        }
    }
    const handleSlideEnd = () => {
        if (slideY.value >= containerSize.height * 0.15) {
            let duration = 360;
            if (fromPosition !== undefined) {

            } else {
                slideY.value = withTiming(containerSize.height * 0.5, { duration })
                slideX.value = withTiming(0, { duration })
                backgroundOpacity.value = withTiming(0.0, { duration });
                slideScale.value = withTiming(0.5, { duration }, (isFinished) => {

                })
            }
            if (isSliding.value) isSliding.value = false;
            slideX.value = withTiming(0);
            slideY.value = withTiming(0);
            backgroundOpacity.value = withTiming(1);
        } else {
            //??????
            if (isSliding.value) isSliding.value = false;
            slideX.value = withTiming(0);
            slideY.value = withTiming(0);
            backgroundOpacity.value = withTiming(1);
        }
    }

    const dragGesture = Gesture.Pan()
        .averageTouches(true)
        .onTouchesDown(e => {
            numberOfPointers.value = e.numberOfTouches;
            if (e.numberOfTouches === 2) isPanLocked.value = false;
            if (isDecaying.value) {
                savedOffset.value = { x: offsetx.value, y: offsety.value }
                cancelAnimation(offsetx);
                cancelAnimation(offsety);
            }
        })
        .onStart(e => {
            if (e.numberOfPointers === 1 && e.velocityY > 100 && Math.abs(e.velocityX) < 50 && scale.value === 1.0) {
                isSliding.value = true;
                runOnJS(requestScrollEnable)(false);
            }
        })
        .onUpdate((e) => {
            if (isPanLocked.value) {
                if (isSliding.value) {
                    slideY.value = e.translationY;
                    slideX.value = e.translationX;
                    backgroundOpacity.value = interpolate(e.translationY, [0, containerSize.height * 0.3], [1.0, 0])
                }
                return;
            }
            if (scale.value >= 1.0) {
                switch (e.numberOfPointers) {
                    case 1:
                        if (numberOfPointers.value === 1) {
                            //?????????????????????
                            let offy = e.translationY + savedOffset.value.y;
                            let offx = e.translationX + savedOffset.value.x;

                            let halfExtWidth = (scale.value - 1.0) * imgSnSize.value.width * 0.5;
                            if ((offx + scaleOffsetX.value) > halfExtWidth) {
                                offx = halfExtWidth - scaleOffsetX.value;
                                // console.log('???x????????????????????????');
                                runOnJS(requestScrollEnable)(true);
                            } else if ((offx + scaleOffsetX.value) < -halfExtWidth) {
                                offx = -halfExtWidth - scaleOffsetX.value;
                                // console.log('???x????????????????????????');
                                runOnJS(requestScrollEnable)(true);
                            } else {
                                //?????????????????????
                                runOnJS(requestScrollEnable)(false);
                            }
                            offsetx.value = offx

                            if (scale.value >= imgScale.value && Math.abs(offy + scaleOffsetY.value) <= Math.abs((scale.value - imgScale.value) * imgSnSize.value.height * 0.5)) {
                                offsety.value = offy;
                            } else {
                                console.log('???????????????y?????????????????????');
                                let preTranslationY = offy - savedOffset.value.y;
                                if (e.translationY > 0) {
                                    slideY.value = e.translationY - preTranslationY;
                                }
                            }
                        } else if (numberOfPointers.value === 2) {
                            //??????????????????????????????
                            runOnJS(handleTwoFingerReleased)(scale.value, { ox: ox.value, offsetx: offsetx.value }, { oy: oy.value, offsety: offsety.value });
                        }
                        break;
                    case 2:
                        offsety.value = e.translationY + savedOffset.value.y;
                        offsetx.value = e.translationX + savedOffset.value.x;
                        break;
                    default:
                        break;
                }
            } else {
                offsety.value = e.translationY + savedOffset.value.y;
                offsetx.value = e.translationX + savedOffset.value.x;
            }
        })
        .onEnd((e) => {
            isPanLocked.value = savedScale.value !== 1.0 ? false : true;
            if (numberOfPointers.value === 1) {
                savedOffset.value = {
                    x: offsetx.value,
                    y: offsety.value,
                };
                if (isSliding.value) {
                    runOnJS(handleSlideEnd)();
                }
                if (savedScale.value > 1.0) {
                    let halfExtWidth = (scale.value - 1.0) * imgSnSize.value.width * 0.5;
                    if (Math.abs(offsetx.value) < (halfExtWidth - scaleOffsetX.value)) {
                        isDecaying.value = true;
                        offsetx.value = withDecay({ velocity: e.velocityX, clamp: [-halfExtWidth - scaleOffsetX.value, halfExtWidth - scaleOffsetX.value] }, (isFinished) => {
                            isDecaying.value = false;
                            runOnJS(updateSavedOffset)(offsetx.value, undefined);
                        })
                    }
                    if (savedScale.value > imgScale.value) {
                        let halfExtHeight = (scale.value - imgScale.value) * imgSnSize.value.height * 0.5;
                        if (Math.abs(offsety.value) < (halfExtHeight - scaleOffsetY.value)) {
                            isDecaying.value = true;
                            offsety.value = withDecay({ velocity: e.velocityY, clamp: [-halfExtHeight - scaleOffsetY.value, halfExtHeight - scaleOffsetY.value] }, (isFinished) => {
                                isDecaying.value = false;
                                runOnJS(updateSavedOffset)(undefined, offsety.value);
                            })
                        }
                    }
                }
            } else if (numberOfPointers.value === 2) {
                runOnJS(handleTwoFingerReleased)(scale.value, { ox: ox.value, offsetx: offsetx.value }, { oy: oy.value, offsety: offsety.value })
            }
        })

    const zoomGesture = Gesture.Pinch()
        .onTouchesDown(e => {
            savedScaleOffset.value = { x: scaleOffsetX.value, y: scaleOffsetY.value }
            if (e.numberOfTouches == 2) {
                let abx = (e.allTouches[1].absoluteX + e.allTouches[0].absoluteX) / 2;
                let aby = (e.allTouches[1].absoluteY + e.allTouches[0].absoluteY) / 2;

                let fox = ((abx + (savedScale.value - 1.0) * containerSize.width * 0.5) - ox.value) / savedScale.value;
                let foy = ((aby + (savedScale.value - 1.0) * containerSize.height * 0.5) - oy.value) / savedScale.value;

                focal.value = { x: fox, y: foy }
            }
        })
        .onStart((e) => {
            runOnJS(requestScrollEnable)(false);
            numberOfPointers.value = e.numberOfPointers;
        })
        .onUpdate((event) => {
            // console.log(event.focalX,event.focalY);
            let newScale = savedScale.value * event.scale;
            if (newScale > maxScale) newScale = maxScale;

            scale.value = newScale;
            // ??????????????????Drag??????
            if (scale.value < 1.0 && isPanLocked.value) {
                isPanLocked.value = false;
            }
            // ???????????????????????????

            let halfExtSizeX = imgSnSize.value.width * (newScale - savedScale.value) * 0.5;
            let extOffX = halfExtSizeX * (focal.value.x - imgSnSize.value.width * 0.5) / (imgSnSize.value.width * 0.5);
            scaleOffsetX.value = -extOffX + savedScaleOffset.value.x;

            let halfExtSizeY = containerSize.height * (newScale - savedScale.value) * 0.5;
            let extOffY = halfExtSizeY * (focal.value.y - containerSize.height * 0.5) / (containerSize.height * 0.5);
            scaleOffsetY.value = -extOffY + savedScaleOffset.value.y;
        })
        .onEnd((event) => {
            savedScale.value = scale.value;

            if (scale.value <= 1.0) {
                scale.value = withTiming(1.0);
                savedScale.value = 1.0;

                scaleOffsetX.value = withTiming(0);
                scaleOffsetY.value = withTiming(0);
                offsetx.value = withTiming(0);
                offsety.value = withTiming(0);
                savedOffset.value = { x: 0, y: 0 }
            } else {
                if (numberOfPointers.value === 2) {
                    runOnJS(handleTwoFingerReleased)(scale.value, { ox: ox.value, offsetx: offsetx.value }, { oy: oy.value, offsety: offsety.value })
                }
            }
        });

    const composed = Gesture.Simultaneous(zoomGesture, dragGesture, nativeGesture);

    const onImageLoad = e => {
        let imgh = e.nativeEvent.source.height;
        let imgw = e.nativeEvent.source.width;
        let sn_h = containerSize.width * imgh / imgw

        if (sn_h < containerSize.height) { //???????????????????????????????????????????????????
            imgSnSize.value = { width: containerSize.width, height: sn_h };
            imgScale.value = containerSize.height / sn_h; //????????????????????????????????????
        }
    }

    return (
        <GestureDetector gesture={composed}>
            <Animated.View collapsable={false} style={[containerSize, animatedStyles]}>
                <Image
                    source={{ uri: props.src }}
                    onLoad={onImageLoad}
                    style={containerSize}
                    resizeMode={'contain'}
                />
            </Animated.View>
        </GestureDetector>
    )
}
interface _ImageViewerProps {
    data: string[];
    initialIndex?: number;
    fromPosition?: { x: number; y: number; width: number; height: number }; //??????width,height???????????????????????????????????????????????????????????????x,y?????????????????????????????????
    onCloseCompleted?: () => void;
}

const _ImageViewer = (props: _ImageViewerProps) => {
    const data = props.data ?? [];
    const initialIndex = props.initialIndex ?? 0;
    const [containerSize, setContainerSize] = useState({ width: 0, height: 0 })
    const containerLayout = useRef({ width: 0, height: 0, x: 0, y: 0 })
    const [currentIndex, setCurrentIndex] = useState(initialIndex)

    const opacity = useSharedValue(1.0);
    const opacityStyle = useAnimatedStyle(() => ({
        opacity: opacity.value,
    }))

    const onContainerLayout = (e: LayoutChangeEvent) => {
        setContainerSize({ width: e.nativeEvent.layout.width, height: e.nativeEvent.layout.height })
        containerLayout.current = e.nativeEvent.layout;
    }

    const flatlist: MutableRefObject<FlatList | any> = useRef();
    const nativeGesture: NativeGesture = Gesture.Native();
    const isScrollEnabled = useRef(true);
    const requestScrollEnable = (enabled: boolean) => {
        if (enabled) {
            if (isScrollEnabled.current === false) {
                isScrollEnabled.current = true;
                flatlist.current && flatlist.current.setNativeProps({ scrollEnabled: true })
            }
        } else {
            if (isScrollEnabled.current === true) {
                isScrollEnabled.current = false;
                flatlist.current && flatlist.current.setNativeProps({ scrollEnabled: false })
            }
        }
    }

    const onMomentumScrollEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
        let p = Math.round(event.nativeEvent.contentOffset.x / event.nativeEvent.layoutMeasurement.width);
        if (p !== initialIndex) setCurrentIndex(p);
    }

    const onCloseCompleted = () => {
        props.onCloseCompleted && props.onCloseCompleted();
    }

    const renderItem = ({ item, index }) => {
        return <AnimatableImage
            src={item}
            containerSize={containerSize}
            containerLayout={containerLayout}
            nativeGesture={nativeGesture}
            requestScrollEnable={requestScrollEnable}
            backgroundOpacity={opacity}
            currentIndex={currentIndex}
            fromPosition={props.fromPosition}
            onCloseCompleted={onCloseCompleted}
        />
    }

    return (
        <GestureHandlerRootView
            onLayout={onContainerLayout}
            style={[StyleSheet.absoluteFill, { zIndex: 9999 }]}
        >
            <Animated.View style={[StyleSheet.absoluteFill, { zIndex: -1, backgroundColor: '#000' }, opacityStyle]} />
            <GestureDetector gesture={nativeGesture}>
                <FlatList
                    ref={flatlist}
                    keyExtractor={(item, index) => index.toString()}
                    data={data}
                    collapsable={false}
                    renderItem={renderItem}
                    horizontal
                    initialScrollIndex={initialIndex}
                    removeClippedSubviews={false}
                    showsHorizontalScrollIndicator={false}
                    pagingEnabled
                    getItemLayout={(data, index) => (
                        { length: containerSize.width, offset: containerSize.width * index, index }
                    )}
                    onMomentumScrollEnd={onMomentumScrollEnd}
                />
            </GestureDetector>
        </GestureHandlerRootView>
    )
}

interface ImageViewerProps extends _ImageViewerProps {
    visible: boolean;
}
const ImageViewer = (props: ImageViewerProps) => {

    const visible = props.visible;
    const viewProps = useMemo(() => {
        let p: any = { ...props };
        delete p.visible;
        return p;
    }, [props])

    if (!visible) return null;
    return <_ImageViewer {...viewProps} />
}

export default ImageViewer;