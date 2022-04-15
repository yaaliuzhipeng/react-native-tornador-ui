import React from 'react';
import HeaderBase from './HeaderBase';
import HeaderPlainBackdrop, { HeaderPlainBackdropProps } from './HeaderPlainBackdrop';
import HeaderPlainContent, { HeaderPlainContentProps } from './HeaderPlainContent';

export const PlainPageHeaderHeight = 48;
const PlainPageHeader = (props: {
    height?: number;
    zIndex?: number;
    backdropConfigs?: HeaderPlainBackdropProps;
    contentConfigs?: HeaderPlainContentProps;
}) => {
    const { zIndex = 999, height = PlainPageHeaderHeight, backdropConfigs = {}, contentConfigs = {} } = props;
    return (
        <HeaderBase
            zIndex={zIndex}
            height={height}
            renderBackdropComponent={(props) => <HeaderPlainBackdrop
                {...props}
                {...backdropConfigs}
            />}
            renderContentComponent={(props) => <HeaderPlainContent
                {...props}
                {...contentConfigs}
            />}
        />
    )
}
export default PlainPageHeader;