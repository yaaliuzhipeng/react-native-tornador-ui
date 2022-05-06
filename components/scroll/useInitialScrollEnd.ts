import React, { MutableRefObject, useLayoutEffect, useRef } from "react";
import { FlatList, ViewStyle } from "react-native";

export default function useInitialScrollEnd(
    ref: MutableRefObject<FlatList>
) {
    const initialSizeChangCount = useRef(-1);
    const style: ViewStyle = useRef({ opacity: 0 }).current;
    useLayoutEffect(() => {
        let max = 10, pre = -1;
        let inter = setInterval(() => {
            let now = initialSizeChangCount.current;
            if (now === -1) return;
            if (pre === now || now > max) {
                console.log(`【makeInitialEndList】${now > max ? 'change reached max deepth' : 'content size not changed'}`);
                initialSizeChangCount.current = -2;
                requestAnimationFrame(() => {
                    if (ref.current) ref.current.setNativeProps({ opacity: 1.0 });
                    clearInterval(inter);
                })
            }
            pre = now;
        }, 50)
        return () => inter && clearInterval(inter);
    }, [])
    const scrollToEnd = React.useCallback((animated?: boolean) => {
        if (ref.current) ref.current.scrollToEnd({ animated });
    }, [])
    const scrollToOffset = React.useCallback((offset: number,animated?:boolean) => {
        if (ref.current) ref.current.scrollToOffset({ animated,offset });
    }, [])
    const handler = React.useCallback(() => {
        if (initialSizeChangCount.current != -2) {
            initialSizeChangCount.current += 1;
            if (ref.current) ref.current.scrollToEnd({ animated: false });
            return false;
        }
        return true;
    }, [])
    return { style, handler, scrollToEnd,scrollToOffset }
}