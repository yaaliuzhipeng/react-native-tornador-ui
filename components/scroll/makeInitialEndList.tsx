import React, { MutableRefObject, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { FlatListProps, StyleProp, ViewStyle } from 'react-native';
import useRestProps from '../hooks/useRestProps';

interface Props extends Omit<FlatListProps<any>, 'onContentSizeChange' | 'style'> {
    // 出于性能问题、列表宽高必须明式指定
    size: { width: number, height: number };
    onContentSizeChange?: (w: number, h: number) => void;
    style?: ViewStyle[];
}

function makeInitialEndList(WrapperedComponent) {
    return React.forwardRef((props: Props, ref: any) => {
        const { size,onContentSizeChange } = props;
        const list: MutableRefObject<any> = ref ?? useRef();
        const initialContentSizeChangedCount = useRef(-1);
        useLayoutEffect(() => {
            let max = 10, pre = -1;
            let inter = setInterval(() => {
                let now = initialContentSizeChangedCount.current;
                if (now === -1) return;
                if (pre === now || now > max) {
                    console.log(`【makeInitialEndList】${now > max ? 'change reached max deepth':'content size not changed'}`);
                    initialContentSizeChangedCount.current = -2;
                    requestAnimationFrame(() => {
                        if (list.current) list.current.setNativeProps({ opacity: 1.0 });
                        clearInterval(inter);
                    })
                }
                pre = now;
            }, 50)
            return () => inter && clearInterval(inter);
        }, [])
        const _onContentSizeChange = React.useCallback((w: number, h: number) => {
            if (initialContentSizeChangedCount.current != -2) {
                initialContentSizeChangedCount.current += 1;
                if (list.current) list.current.scrollToEnd({ animated: false });
            }
            if(onContentSizeChange) onContentSizeChange(w,h);
        },[])
        return (
            <WrapperedComponent
                ref={list}
                {...props}
                onContentSizeChange={_onContentSizeChange}
                style={[{ opacity: 0.0, ...size },...(props.style ?? [])]}
            />
        )
    })
}
export default makeInitialEndList;