import { withDelay, withTiming, withSpring } from "react-native-reanimated";

/**
 * 
Values Of Exiting Animation:
    targetOriginX, targetOriginY, targetWidth, targetHeight, targetGlobalOriginX, targetGlobalOriginY
Values Of Exiting Animation: 
    currentOriginX, currentOriginY, currentWidth, currentHeight, currentGlobalOriginX, currentGlobalOrigin

*/

const ScaleUpBottomCenter = (values) => {
    'worklet';
    const animations = {
        originY: withSpring(values.targetOriginY, { mass: 0.8 }),
        transform: [{ scale: withTiming(1, { duration: 300 }) }],
    };
    const initialValues = {
        originY: values.targetOriginY + values.targetHeight / 2,
        transform: [{ scale: 0.25 }],
    };
    return {
        initialValues,
        animations,
    };
};
const ScaleDownBottomCenter = (values) => {
    'worklet';
    const animations = {
        originY: withSpring(values.currentOriginY + values.currentHeight / 2, { mass: 0.7 }),
        transform: [{ scale: withTiming(0.0, { duration: 300 }) }],
    };
    const initialValues = {
        originY: values.currentOriginY,
        transform: [{ scale: 1.0 }],
    };
    return {
        initialValues,
        animations,
    };
}

const ScaleUpBottomRight = (values) => {
    'worklet';
    const animations = {
        originY: withSpring(values.targetOriginY, { mass: 0.7 }),
        originX: withSpring(values.targetOriginX, { mass: 0.7 }),
        transform: [{ scale: withTiming(1, { duration: 300 }) }],
    };
    const initialValues = {
        originY: values.targetOriginY + values.targetHeight / 2,
        originX: values.targetOriginX + values.targetWidth / 2,
        transform: [{ scale: 0.25 }],
    };
    return {
        initialValues,
        animations,
    };
};
const ScaleInDownTopRight = (values) => {
    'worklet';
    const initialValues = {
        // originY: values.targetOriginY,
        originX: values.targetOriginX + values.targetWidth / 2,
        transform: [{ scale: 0.25 }]
    }
    const animations = {
        // originY: withSpring(values.targetOriginY , { mass: 0.8 }),
        originX: withSpring(values.targetOriginX, { mass: 0.7 }),
        transform: [{ scale: withTiming(1, { duration: 300 }) }]
    }
    return { initialValues, animations }
}
const ScaleOutDownTopRight = (values) => {
    'worklet';
    const initialValues = {
        originY: values.currentOriginY,
        transform: [{ scale: 1.0 }]
    }
    const animations = {
        originY: withSpring(values.currentOriginY - values.targetHeight / 2, { mass: 0.8 }),
        transform: [{ scale: withTiming(0.0, { duration: 300 }) }]
    }
    return { initialValues, animations }
}
const ScaleDownBottomRight = (values) => {
    'worklet';
    const animations = {
        originY: withSpring(values.currentOriginY + values.currentHeight / 2, { mass: 0.7 }),
        originX: withSpring(values.currentOriginX + values.currentWidth * 0.38, { mass: 0.7 }),
        transform: [{ scale: withTiming(0.0, { duration: 300 }) }],
    };
    const initialValues = {
        originY: values.currentOriginY,
        originX: values.currentOriginX,
        transform: [{ scale: 1.0 }],
    };
    return {
        initialValues,
        animations,
    };
};
const ScaleUpBottomLeft = (values) => {
    'worklet';
    const animations = {
        originY: withSpring(values.targetOriginY, { mass: 0.7 }),
        originX: withSpring(values.targetOriginX, { mass: 0.7 }),
        transform: [{ scale: withTiming(1, { duration: 300 }) }],
    };
    const initialValues = {
        originY: values.targetOriginY - values.targetHeight / 2,
        originX: values.targetOriginX - values.targetWidth / 2,
        transform: [{ scale: 0.25 }],
    };
    return {
        initialValues,
        animations,
    };
};
const ScaleDownBottomLeft = (values) => {
    'worklet';
    const animations = {
        originY: withSpring(values.currentOriginY - values.currentHeight / 2, { mass: 0.7 }),
        originX: withSpring(values.currentOriginX - values.currentWidth * 0.38, { mass: 0.7 }),
        transform: [{ scale: withTiming(0.0, { duration: 300 }) }],
    };
    const initialValues = {
        originY: values.currentOriginY,
        originX: values.currentOriginX,
        transform: [{ scale: 1.0 }],
    };
    return {
        initialValues,
        animations,
    };
};

export {
    ScaleUpBottomCenter,
    ScaleUpBottomRight,
    ScaleUpBottomLeft,
    ScaleDownBottomCenter,
    ScaleDownBottomLeft,
    ScaleDownBottomRight,
    ScaleInDownTopRight,
    ScaleOutDownTopRight
}
