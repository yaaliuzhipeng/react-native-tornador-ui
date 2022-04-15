import React, { useMemo } from 'react';
import { FlexAlignType, View } from 'react-native';
type Justify = 'start' | 'end' | 'center' | 'between' | 'around' | 'evenly';
type Alignment = 'start' | 'end' | 'center' | 'stretch' | 'baseline';

interface GroupViewProps {
    children?: any;
}
interface CommonLayoutProps {
    justify?: Justify;
    alignment?: Alignment;
    fill?: 1 | 2 | 3;
    flex?: number;
    width?: string | number;
    height?: string | number;
    padding?: EdgeInsets | number;
    margin?: EdgeInsets | number;
}
function mapAlignmentToFlexType(alignment: Alignment): FlexAlignType {
    switch (alignment) {
        case 'start':
            return 'flex-start'
        case 'end':
            return 'flex-end'
        default:
            return alignment;
    }
}
function mapJustifyToFlexType(justify: Justify) {
    switch (justify) {
        case 'start':
            return 'flex-start'
        case 'end':
            return 'flex-end'
        case 'between':
            return 'space-between'
        case 'around':
            return 'space-around'
        case 'evenly':
            return 'space-evenly'
        case 'center':
            return 'center'
        default:
            return 'flex-start'
    }
}

type EdgeInsets = {
    top?: number;
    right?: number;
    bottom?: number;
    left?: number;
}

/**
 * Hooks
 */
const useCommonLayoutProps = (
    justify?: Justify,
    alignment?: Alignment,
    fill?: 1 | 2 | 3,
    flex?: number,
    width?: string | number,
    height?: string | number,
    padding?: EdgeInsets | number,
    margin?: EdgeInsets | number,
) => {
    const fillProp = useMemo(() => {
        switch (fill) {
            case 1:
                return { width: '100%' }
            case 2:
                return { height: '100%' }
            case 3:
                return { width: '100%', height: '100%' }
            default:
                return {};
        }
    }, [fill])
    const flexProp = useMemo(() => {
        let fl: any = {}
        if (justify) fl.justifyContent = mapJustifyToFlexType(justify)
        if (alignment) fl.alignItems = mapAlignmentToFlexType(alignment)
        if (flex) fl.flex = flex
        return fl;
    }, [justify, alignment, flex])
    const sizeProp = useMemo(() => {
        let size: any = {}
        if (width) size.width = width;
        if (height) size.height = height;
        return size;
    }, [width, height])
    const paddingProp = useMemo(() => {
        if (!padding) return {}
        if (typeof padding === 'number') return { padding }
        let prop: any = {}
        if (padding.top) prop.paddingTop = padding.top
        if (padding.right) prop.paddingRight = padding.right
        if (padding.bottom) prop.paddingBottom = padding.bottom
        if (padding.left) prop.paddingLeft = padding.left
        return padding;
    }, [padding])
    const marginProp = useMemo(() => {
        if (!margin) return {}
        if (typeof margin === 'number') return { margin }
        let prop: any = {}
        if (margin.top) prop.marginTop = margin.top
        if (margin.right) prop.marginRight = margin.right
        if (margin.bottom) prop.marginBottom = margin.bottom
        if (margin.left) prop.marginLeft = margin.left
        return margin;
    }, [margin])
    return { fillProp, flexProp, sizeProp, paddingProp, marginProp }
}


const Spacer = () => {
    return <View style={{ flex: 1 }} />
}
/**
 *  Layout Components
 */
interface VStackProp extends CommonLayoutProps, GroupViewProps {
    background?: string;
}
const VStack = (props: VStackProp) => {
    const { children, justify, alignment, fill, flex, width, height, padding, margin, background } = props;

    const {
        fillProp,
        flexProp,
        sizeProp,
        paddingProp,
        marginProp
    } = useCommonLayoutProps(justify, alignment, fill, flex, width, height, padding, margin);

    // console.log({
    //     ...fillProp,
    //     ...flexProp,
    //     ...sizeProp,
    //     ...paddingProp,
    //     ...marginProp,
    //     backgroundColor: background
    // })

    return (
        <View style={{
            ...fillProp,
            ...flexProp,
            ...sizeProp,
            ...paddingProp,
            ...marginProp,
            backgroundColor: background
        }}>
            {children}
        </View>
    )
}
const HStack = React.memo((props: {
    children?: any;
}) => {
    const { children } = props;
    return (
        <View>
            {children}
        </View>
    )
})
const ZStack = (props) => {

}

/**
 * Views
 */

const Text = (props) => {

    return (
        <Text></Text>
    )
}

export {
    VStack,
    HStack,
    Spacer,
    Text
}
export { default as ThemeProvider } from './lib/ThemeProvider';
export * from './lib/ThemeProvider';
export { flexStyles as fxs } from './lib/FlexStyles'