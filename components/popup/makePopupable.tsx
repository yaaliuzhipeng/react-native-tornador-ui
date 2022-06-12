import React, { useMemo, useRef } from 'react';
import { ViewStyle } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import useRestProps from '../hooks/useRestProps';
import * as LayoutAnimations from './layoutAnimations'

type PopupAnimation = 'opacity' | 'none' | 'scaleUpBottomCenter' | 'scaleUpBottomLeft' | 'scaleUpBottomRight' | 'scaleDownTopRight'
export interface PopupableComponentProps {
    position: { left?: number; top?: number; bottom?: number; zIndex?: number; };
    animation?: PopupAnimation;
    wrapperStyles?: ViewStyle[];
}

function makePopupable(WrapperedComponent) {
    return function PopupableComponent(props) {
        const injectedProps = useRestProps(props, ['wrapperStyles'])

        const animation = useRef(function () {
            switch (props.animation) {
                case 'opacity':
                    return { entering: FadeIn, exiting: FadeOut }
                case 'scaleUpBottomCenter':
                    return { entering: LayoutAnimations.ScaleUpBottomCenter, exiting: LayoutAnimations.ScaleDownBottomCenter }
                case 'scaleUpBottomLeft':
                    return { entering: LayoutAnimations.ScaleUpBottomLeft, exiting: LayoutAnimations.ScaleDownBottomLeft }
                case 'scaleUpBottomRight':
                    return { entering: LayoutAnimations.ScaleUpBottomRight, exiting: LayoutAnimations.ScaleDownBottomRight }
                case 'scaleDownTopRight':
                    return { entering: LayoutAnimations.ScaleInDownTopRight, exiting: LayoutAnimations.ScaleOutDownTopRight }
                default:
                    return {}
            }
        }()).current;

        const position = useMemo(() => {
            let pos = props.position ?? {};
            if (!isType(pos.top, 'number') && !isType(pos.bottom, 'number')) pos.top = 0;
            if (!isType(pos.zIndex, 'number')) pos.zIndex = 10;
            return pos;
        }, []);
        const positionStyle = useMemo(() => {
            let style: ViewStyle = { position: 'absolute', zIndex: position.zIndex, left: position.left };
            if (typeof position.top === 'number') {
                style.top = position.top;
            } else {
                style.bottom = position.bottom;
            }
            return style;
        }, [position])

        return (
            <Animated.View {...animation} style={[positionStyle, ...(props.wrapperStyles ?? [])]}>
                <WrapperedComponent {...injectedProps} />
            </Animated.View>
        )
    }
}

export default makePopupable;