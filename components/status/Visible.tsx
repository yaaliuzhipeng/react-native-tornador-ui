import React from 'react';

const Visible = (props: {
    show?: boolean;
    children?: any;
}) => {
    const { show = false, children } = props;
    if (!show) return null;
    return children
}
export default Visible;